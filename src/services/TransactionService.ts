// src/services/transactionService.ts
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  increment,
  orderBy,
  limit as limitQuery,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { updateUserStats } from "./userService";
import { CollectionPaths } from "../types";
import type {
  Transaction,
  TransactionInput,
  TransactionFilters,
  Account,
  Category,
  ApiResponse,
  PaginatedResponse,
  Budget,
  BudgetStatus,
} from "../types";
import { updateBudgetCategories } from "./BudgetService";

/**
 * Create a new transaction with proper account balance updates and user stats
 */
// src/services/transactionService.ts

export const createTransaction = async (
  userId: string,
  transactionInput: TransactionInput,
): Promise<ApiResponse<Transaction>> => {
  try {
    const accountRef = doc(
      db,
      CollectionPaths.accounts(userId),
      transactionInput.accountId,
    );

    const categoryRef = doc(
      db,
      CollectionPaths.categories(userId),
      transactionInput.categoryId,
    );

    // Get related documents first
    const [accountDoc, categoryDoc] = await Promise.all([
      getDoc(accountRef),
      getDoc(categoryRef),
    ]);

    if (!accountDoc.exists()) {
      return { status: 404, error: "Account not found" };
    }
    if (!categoryDoc.exists()) {
      return { status: 404, error: "Category not found" };
    }

    const account = accountDoc.data() as Account;
    const category = categoryDoc.data() as Category;
    const amount = Number(transactionInput.amount);

    // Validate sufficient funds for expenses
    if (
      (account.accountType !== "CREDIT_CARD" && transactionInput.type) ===
        "EXPENSE" &&
      amount > account.balance
    ) {
      return { status: 400, error: "Insufficient funds in account" };
    }

    const batch = writeBatch(db);

    // Create the transaction
    const transactionsPath = CollectionPaths.transactions(
      userId,
      transactionInput.accountId,
    );

    const transactionRef = doc(collection(db, transactionsPath));

    const newTransaction: Transaction = {
      id: transactionRef.id,
      userId,
      accountId: transactionInput.accountId,
      categoryId: transactionInput.categoryId,
      amount,
      type: transactionInput.type,
      description: transactionInput.description,
      transactionDate: transactionInput.transactionDate,
      isRecurring: transactionInput.isRecurring || false,
      recurringPattern: transactionInput.recurringPattern || "",
      metadata: transactionInput.metadata || {},
      categoryName: category.name,
      accountName: account.name,
      createdAt: serverTimestamp(),
      isActive: true,
    };

    batch.set(transactionRef, newTransaction);

    // Update account balance and stats
    const balanceChange = transactionInput.type === "INCOME" ? amount : -amount;
    const monthKey = new Date().toISOString().slice(0, 7);

    batch.update(accountRef, {
      balance: increment(balanceChange),
      "stats.lastSync": serverTimestamp(),
      "stats.pendingTransactions": increment(1),
      [`stats.monthlyTransactionCount.${monthKey}`]: increment(1),
    });

    // Update category stats
    batch.update(categoryRef, {
      [`stats.monthlySpending.${monthKey}`]: increment(amount),
      "stats.lastCalculated": serverTimestamp(),
    });

    // Update user stats
    await updateUserStats(userId, {
      totalTransactions: 1,
      monthlySpending: transactionInput.type === "EXPENSE" ? amount : 0,
      monthlyIncome: transactionInput.type === "INCOME" ? amount : 0,
      lastActive: new Date().toISOString(),
    });

    await batch.commit();
    // After transaction is created, update any budgets that contain this category
    const budgetsRef = collection(db, CollectionPaths.budgets(userId));
    const budgetsSnapshot = await getDocs(
      query(budgetsRef, where("isActive", "==", true)),
    );

    for (const budgetDoc of budgetsSnapshot.docs) {
      const budget = budgetDoc.data() as Budget;
      const categoryEntry = Object.entries(budget.categories).find(
        ([, c]) => c.categoryId === transactionInput.categoryId,
      );

      if (!categoryEntry) continue;

      const [categoryKey, categoryAllocation] = categoryEntry;

      if (categoryAllocation) {
        const updatedCategories = { ...budget.categories };

        const spent = categoryAllocation.spent + transactionInput.amount;

        let status: BudgetStatus = "ON_TRACK";
        // Status should be WARNING when the amount spent is greater than 80% of the allocated amount
        if (spent > 0.8 * categoryAllocation.amount) {
          status = "WARNING";
        }

        if (categoryAllocation.amount - spent < 0) {
          status = "EXCEEDED";
        }

        updatedCategories[categoryKey] = {
          ...categoryAllocation,
          spent: spent,
          remaining: categoryAllocation.amount - spent,
          status: status,
        };

        await updateBudgetCategories(userId, budgetDoc.id, updatedCategories);
      }
    }

    return {
      status: 201,
      data: {
        ...newTransaction,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return {
      status: 500,
      error: "Failed to create transaction",
    };
  }
};
/**
 * Update a transaction with proper account balance adjustments
 */
export const updateTransaction = async (
  userId: string,
  transactionId: string,
  updates: Partial<TransactionInput>,
): Promise<ApiResponse<Transaction>> => {
  try {
    const transactionRef = doc(
      db,
      CollectionPaths.transactions(userId, updates.accountId || ""),
      transactionId,
    );
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      return { status: 404, error: "Transaction not found" };
    }

    const currentTransaction = transactionDoc.data() as Transaction;
    const batch = writeBatch(db);

    // Handle account balance updates if amount or type changes
    if (updates.amount || updates.type || updates.accountId) {
      // Reverse original transaction effect
      const oldAccountRef = doc(
        db,
        CollectionPaths.accounts(userId),
        currentTransaction.accountId,
      );
      const oldBalance =
        currentTransaction.type === "INCOME"
          ? -currentTransaction.amount
          : currentTransaction.amount;

      batch.update(oldAccountRef, {
        balance: increment(oldBalance),
        "stats.lastSync": serverTimestamp(),
      });

      // Apply new transaction effect
      const newAccountRef = doc(
        db,
        CollectionPaths.accounts(userId),
        updates.accountId || currentTransaction.accountId,
      );
      const newAmount = updates.amount || currentTransaction.amount;
      const newType = updates.type || currentTransaction.type;
      const newBalance = newType === "INCOME" ? newAmount : -newAmount;

      batch.update(newAccountRef, {
        balance: increment(newBalance),
        "stats.lastSync": serverTimestamp(),
      });
    }

    // Update the transaction
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    batch.update(transactionRef, updateData);
    await batch.commit();

    // Fetch and return updated transaction
    const updatedDoc = await getDoc(transactionRef);
    const updatedTransaction = updatedDoc.data() as Transaction;

    return {
      status: 200,
      data: {
        ...updatedTransaction,
        createdAt: updatedTransaction.createdAt.toString(),
        updatedAt: updatedTransaction.updatedAt?.toString(),
      },
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return {
      status: 500,
      error: "Failed to update transaction",
    };
  }
};

/**
 * Get transactions with filters and pagination
 */
export const getTransactions = async (
  userId: string,
  filters?: TransactionFilters,
  page: number = 1,
  limit: number = 10,
): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
  try {
    //account ids are part of the path we ned to make a call for each one of them
    const docSnap = await getDocs(
      collection(db, CollectionPaths.accounts(userId)),
    );
    let transactions: Transaction[] = [];

    for (const doc of docSnap.docs) {
      let q = query(
        collection(db, CollectionPaths.transactions(userId, doc.id)),
        orderBy("transactionDate", "desc"),
      );

      // Apply filters
      if (filters?.dateRange) {
        q = query(
          q,
          where("transactionDate", ">=", filters.dateRange.startDate),
          where("transactionDate", "<=", filters.dateRange.endDate),
        );
      }

      if (filters?.categoryIds?.length) {
        q = query(q, where("categoryId", "in", filters.categoryIds));
      }

      if (filters?.types?.length) {
        q = query(q, where("type", "in", filters.types));
      }

      if (filters?.minAmount) {
        q = query(q, where("amount", ">=", filters.minAmount));
      }

      if (filters?.maxAmount) {
        q = query(q, where("amount", "<=", filters.maxAmount));
      }

      if (filters?.isRecurring !== undefined) {
        q = query(q, where("isRecurring", "==", filters.isRecurring));
      }

      q = query(q, limitQuery(limit));
      const querySnapshot = await getDocs(q);
      transactions = transactions.concat(
        querySnapshot.docs.map((doc) => {
          const data = doc.data() as Transaction;
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toString(),
            updatedAt: data.updatedAt?.toString(),
            deletedAt: data.deletedAt?.toString(),
          };
        }),
      );
    }
    return {
      status: 200,
      data: {
        items: transactions,
        total: 0,
        page,
        limit,
        hasMore: 0 > page * limit,
      },
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      status: 500,
      error: "Failed to fetch transactions",
    };
  }
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (
  userId: string,
  accountId: string,
  transactionId: string,
): Promise<ApiResponse<void>> => {
  try {
    const transactionRef = doc(
      db,
      CollectionPaths.transactions(userId, accountId),
      transactionId,
    );
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      return { status: 404, error: "Transaction not found" };
    }

    const transaction = transactionDoc.data() as Transaction;
    const batch = writeBatch(db);

    // Reverse the balance effect
    const accountRef = doc(
      db,
      CollectionPaths.accounts(userId),
      transaction.accountId,
    );
    const balanceChange =
      transaction.type === "INCOME" ? -transaction.amount : transaction.amount;

    batch.update(accountRef, {
      balance: increment(balanceChange),
      "stats.lastSync": serverTimestamp(),
      "stats.pendingTransactions": increment(-1),
    });

    // Update user stats
    await updateUserStats(userId, {
      totalTransactions: -1,
      lastActive: new Date().toISOString(),
    });

    //udpate the category stats on the budget
    const budgetsRef = collection(db, CollectionPaths.budgets(userId));
    const budgetsSnapshot = await getDocs(
      query(budgetsRef, where("isActive", "==", true)),
    );

    for (const budgetDoc of budgetsSnapshot.docs) {
      const budget = budgetDoc.data() as Budget;
      const categoryEntry = Object.entries(budget.categories).find(
        ([, c]) => c.categoryId === transaction.categoryId,
      );

      if (!categoryEntry) continue;

      const [categoryKey, categoryAllocation] = categoryEntry;

      if (categoryAllocation) {
        const updatedCategories = { ...budget.categories };

        const spent = categoryAllocation.spent - transaction.amount;

        // Calculate the status of the category after reversing the transaction
        let status: BudgetStatus = "ON_TRACK";

        if (categoryAllocation.amount - spent < 0) {
          status = "EXCEEDED";
        }
        // Status should be WARNING when the amount spent is greater than 80% of the allocated amount
        if (spent > 0.8 * categoryAllocation.amount) {
          status = "WARNING";
        }
        updatedCategories[categoryKey] = {
          ...categoryAllocation,
          spent: categoryAllocation.spent - transaction.amount,
          remaining:
            categoryAllocation.amount -
            (categoryAllocation.spent - transaction.amount),
          status: status,
        };
        await updateBudgetCategories(userId, budgetDoc.id, updatedCategories);
      }
    }

    // Delete the transaction
    batch.delete(transactionRef);
    await batch.commit();

    return { status: 200 };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return {
      status: 500,
      error: "Failed to delete transaction",
    };
  }
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (
  userId: string,
  limit: number = 7,
): Promise<ApiResponse<Transaction[]>> => {
  try {
    const accountSnapshot = await getDocs(
      collection(db, CollectionPaths.accounts(userId)),
    );
    const accountIds = accountSnapshot.docs.map((doc) => doc.id);
    const transactions: Transaction[] = [];

    for (const accountId of accountIds) {
      const q = query(
        collection(db, CollectionPaths.transactions(userId, accountId)),
        orderBy("transactionDate", "desc"),
        limitQuery(limit),
      );

      const querySnapshot = await getDocs(q);
      transactions.push(
        ...querySnapshot.docs.map((doc) => {
          const data = doc.data() as Transaction;
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toString(),
            updatedAt: data.updatedAt?.toString(),
            deletedAt: data.deletedAt?.toString(),
          };
        }),
      );
    }

    return {
      status: 200,
      data: transactions.sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime(),
      ),
    };
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return {
      status: 500,
      error: "Failed to fetch recent transactions",
    };
  }
};
