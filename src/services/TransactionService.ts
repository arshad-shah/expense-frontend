import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc as firestoreDoc,
  limit as limitQuery,
  orderBy,
  getDoc,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  Transaction,
  TransactionInput,
  TransactionFilters,
  Account,
  Category,
  TransactionResponse,
  ApiResponse,
  PaginatedResponse,
} from "../types";

/**
 * Create a new transaction with proper account balance updates and user stats
 */
export const createTransaction = async (
  transactionInput: TransactionInput
): Promise<ApiResponse<Transaction>> => {
  try {
    // Get related documents first
    const [accountDoc, categoryDoc, userDoc] = await Promise.all([
      getDoc(firestoreDoc(db, "accounts", transactionInput.accountId)),
      getDoc(firestoreDoc(db, "categories", transactionInput.categoryId)),
      getDoc(firestoreDoc(db, "users", transactionInput.userId))
    ]);

    if (!accountDoc.exists()) {
      return {
        status: 404,
        error: "Account not found"
      };
    }
    if (!categoryDoc.exists()) {
      return {
        status: 404,
        error: "Category not found"
      };
    }
    if (!userDoc.exists()) {
      return {
        status: 404,
        error: "User not found"
      };
    }

    const accountData = accountDoc.data() as Account;
    const categoryData = categoryDoc.data() as Category;
    const amount = Number(transactionInput.amount);

    // Validate sufficient funds for expenses
    if (transactionInput.type === "EXPENSE" && amount > accountData.balance) {
      return {
        status: 400,
        error: "Insufficient funds in account"
      };
    }

    const batch = writeBatch(db);

    // Create the transaction
    const transactionRef = firestoreDoc(collection(db, "transactions"));
    batch.set(transactionRef, {
      ...transactionInput,
      createdAt: serverTimestamp(),
    });

    // Update account balance
    const accountRef = firestoreDoc(db, "accounts", transactionInput.accountId);
    const balanceChange = transactionInput.type === "INCOME" ? amount : -amount;
    batch.update(accountRef, {
      balance: increment(balanceChange),
      lastSync: serverTimestamp(),
    });

    // Update user stats
    const userRef = firestoreDoc(db, "users", transactionInput.userId);
    batch.update(userRef, {
      totalTransactions: increment(1),
      lastActive: serverTimestamp(),
    });

    await batch.commit();

    // Return the complete transaction object
    const transaction: Transaction = {
      id: transactionRef.id,
      account: {
        id: accountDoc.id,
        name: accountData.name,
        accountType: accountData.accountType,
        bankName: accountData.bankName,
        balance: accountData.balance + balanceChange,
        currency: accountData.currency,
        lastSync: accountData.lastSync,
        isActive: accountData.isActive,
        userId: accountData.userId,
        createdAt: accountData.createdAt,
      },
      category: {
        id: categoryDoc.id,
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
        color: categoryData.color,
        isDefault: categoryData.isDefault,
        isActive: categoryData.isActive,
      },
      amount,
      type: transactionInput.type,
      description: transactionInput.description,
      transactionDate: transactionInput.transactionDate,
      isRecurring: transactionInput.isRecurring || false,
      recurringPattern: transactionInput.recurringPattern,
      attachments: [],
    };

    return {
      status: 201,
      data: transaction
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to create transaction: ${error}`
    };
  }
};

/**
 * Update a transaction with proper account balance adjustments
 */
export const updateTransaction = async (
  transactionId: string,
  updates: Partial<TransactionInput>
): Promise<ApiResponse<void>> => {
  try {
    // Get the current transaction
    const transactionRef = firestoreDoc(db, "transactions", transactionId);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      return {
        status: 404,
        error: "Transaction not found"
      };
    }

    const currentTransaction = transactionDoc.data() as TransactionResponse;
    
    // If account or amount is changing, we need to adjust balances
    if (updates.accountId || updates.amount || updates.type) {
      const batch = writeBatch(db);
      
      // Handle old account balance
      const oldAccountRef = firestoreDoc(db, "accounts", currentTransaction.accountId);
      
      if (!oldAccountRef) {
        return {
          status: 404,
          error: "Original account not found"
        };
      }

      // Reverse the original transaction's effect
      const originalAmount = currentTransaction.type === "INCOME" 
        ? -currentTransaction.amount 
        : currentTransaction.amount;
      
      batch.update(oldAccountRef, {
        balance: increment(originalAmount),
        lastSync: serverTimestamp(),
      });

      // Handle new account balance if account is changing
      if (updates.accountId && updates.accountId !== currentTransaction.accountId) {
        const newAccountRef = firestoreDoc(db, "accounts", updates.accountId);
        const newAccountDoc = await getDoc(newAccountRef);
        
        if (!newAccountDoc.exists()) {
          return {
            status: 404,
            error: "New account not found"
          };
        }

        const newAccountData = newAccountDoc.data() as Account;
        const newAmount = updates.amount || currentTransaction.amount;
        
        // Validate sufficient funds for expenses
        if ((updates.type || currentTransaction.type) === "EXPENSE" && 
            newAmount > newAccountData.balance) {
          return {
            status: 400,
            error: "Insufficient funds in target account"
          };
        }

        // Apply the new transaction's effect
        const newBalanceChange = (updates.type || currentTransaction.type) === "INCOME" 
          ? newAmount 
          : -newAmount;
        
        batch.update(newAccountRef, {
          balance: increment(newBalanceChange),
          lastSync: serverTimestamp(),
        });
      }

      // Update the transaction
      batch.update(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();
    } else {
      // Simple update without balance changes
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }

    return {
      status: 200
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to update transaction: ${error}`
    };
  }
};

/**
 * Delete a transaction and handle related updates
 */
export const deleteTransaction = async (
  transactionId: string
): Promise<ApiResponse<void>> => {
  try {
    const transactionRef = firestoreDoc(db, "transactions", transactionId);
    const transactionDoc = await getDoc(transactionRef);

    if (!transactionDoc.exists()) {
      return {
        status: 404,
        error: "Transaction not found"
      };
    }

    const transaction = transactionDoc.data() as TransactionResponse;
    const batch = writeBatch(db);

    // Reverse the transaction's effect on account balance
    const accountRef = firestoreDoc(db, "accounts", transaction.accountId);
    const balanceChange = transaction.type === "INCOME" 
      ? -transaction.amount 
      : transaction.amount;
    
    batch.update(accountRef, {
      balance: increment(balanceChange),
      lastSync: serverTimestamp(),
    });

    // Update user stats
    const userRef = firestoreDoc(db, "users", transaction.userId);
    batch.update(userRef, {
      totalTransactions: increment(-1),
      lastActive: serverTimestamp(),
    });

    // Delete the transaction
    batch.delete(transactionRef);

    await batch.commit();

    return {
      status: 200
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to delete transaction: ${error}`
    };
  }
};

// Keeping the existing query functions but adding pagination and proper error handling
export const getTransactions = async (
  filters: TransactionFilters,
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<PaginatedResponse<Transaction>>> => {
  try {
    let q = query(collection(db, "transactions"));

    // Apply filters
    if (filters?.dateRange?.startDate && filters?.dateRange?.endDate) {
      q = query(
        q,
        where("transactionDate", ">=", filters.dateRange.startDate),
        where("transactionDate", "<=", filters.dateRange.endDate)
      );
    }

    if (filters?.categoryIds?.length) {
      q = query(q, where("categoryId", "in", filters.categoryIds));
    }

    if (filters?.accountIds?.length) {
      q = query(q, where("accountId", "in", filters.accountIds));
    }

    if (filters?.types?.length) {
      q = query(q, where("type", "in", filters.types));
    }

    // Add ordering
    q = query(q, orderBy("transactionDate", "desc"));

    const querySnapshot = await getDocs(q);
    const total = querySnapshot.docs.length;

    // Calculate pagination
    const start = (page - 1) * limit;
    const paginatedDocs = querySnapshot.docs.slice(start, start + limit);

    // Fetch related data for each transaction
    const transactions = await Promise.all(
      paginatedDocs.map(async (doc) => {
        const transactionData = doc.data() as TransactionResponse;
        const [accountDoc, categoryDoc] = await Promise.all([
          getDoc(firestoreDoc(db, "accounts", transactionData.accountId)),
          getDoc(firestoreDoc(db, "categories", transactionData.categoryId)),
        ]);

        if (!accountDoc.exists() || !categoryDoc.exists()) {
          throw new Error("Related account or category not found");
        }

        const accountData = accountDoc.data() as Account;
        const categoryData = categoryDoc.data() as Category;

        return {
          id: doc.id,
          account: {
            id: accountDoc.id,
            name: accountData.name,
            accountType: accountData.accountType,
            bankName: accountData.bankName,
            balance: accountData.balance,
            currency: accountData.currency,
            lastSync: accountData.lastSync,
            isActive: accountData.isActive,
            userId: accountData.userId,
            createdAt: accountData.createdAt
          },
          category: {
            id: categoryDoc.id,
            name: categoryData.name,
            type: categoryData.type,
            icon: categoryData.icon,
            color: categoryData.color,
            isDefault: categoryData.isDefault,
            isActive: categoryData.isActive,
          },
          amount: transactionData.amount,
          type: transactionData.type,
          description: transactionData.description,
          transactionDate: transactionData.transactionDate,
          isRecurring:  false,
          recurringPattern: "",
          attachments: [],
        };
      })
    );

    return {
      status: 200,
      data: {
        items: transactions,
        total,
        page,
        limit,
        hasMore: total > page * limit
      }
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to fetch transactions: ${error}`
    };
  }
};

// Helper function to get recent transactions
export const getRecentTransactions = async (
  userId: string,
  limit: number = 5
): Promise<Transaction[]> => {
  const q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("transactionDate", "desc"),
    limitQuery(limit)
  );

  const querySnapshot = await getDocs(q);
  const transactions = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const transactionData = doc.data() as TransactionResponse;

      const [accountDoc, categoryDoc] = await Promise.all([
        getDoc(firestoreDoc(db, "accounts", transactionData.accountId )),
        getDoc(firestoreDoc(db, "categories", transactionData.categoryId)),
      ]);
      if (accountDoc.exists() && categoryDoc.exists()) {
        const accountData = accountDoc.data() as Account;
        const categoryData = categoryDoc.data() as Category;

        return {
          id: doc.id,
          account: {
            id: accountDoc.id,
            name: accountData.name,
            accountType: accountData.accountType,
            bankName: accountData.bankName,
            balance: accountData.balance,
            currency: accountData.currency,
            lastSync: accountData.lastSync,
            isActive: accountData.isActive,
            userId: accountData.userId,
            createdAt: accountData.createdAt,
          },
          category: {
            id: categoryDoc.id,
            name: categoryData.name,
            type: categoryData.type,
            icon: categoryData.icon,
            color: categoryData.color,
            isDefault: categoryData.isDefault,
            isActive: categoryData.isActive,
          },
          amount: transactionData.amount,
          type: transactionData.type,
          description: transactionData.description,
          transactionDate: transactionData.transactionDate,
          isRecurring: false,
          recurringPattern: "",
          attachments: [],
        };
      } else {
        throw new Error("Related account or category not found");
      }
    })
  );

  return transactions;
};
