import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc as firestoreDoc,
  orderBy,
  limit as limitQuery,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  Transaction,
  TransactionInput,
  TransactionFilters,
  Account,
  Category,
} from "../types";

export const getTransactions = async (
  filters: TransactionFilters
): Promise<Transaction[]> => {
  let q = query(collection(db, "transactions"));

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

  const querySnapshot = await getDocs(q);
  const transactions = await Promise.all(
    querySnapshot.docs.map(async (doc) => {
      const transactionData = doc.data() as Transaction;
      const [accountDoc, categoryDoc] = await Promise.all([
        getDoc(firestoreDoc(db, "accounts", transactionData.accountId)),
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
        isRecurring: transactionData.isRecurring || false,
        recurringPattern: transactionData.recurringPattern,
        attachments: transactionData.attachments || [],
      };
      } else {
        throw new Error("Related account or category not found");
      }
    })
  );

  return transactions;
};

export const getTransactionById = async (
  transactionId: string
): Promise<Transaction | null> => {
  const transactionRef = firestoreDoc(db, "transactions", transactionId);
  const transactionSnap = await getDoc(transactionRef);

  if (!transactionSnap.exists()) {
    return null;
  }

  return { id: transactionSnap.id, ...transactionSnap.data() } as Transaction;
};

export const createTransaction = async (
  transactionInput: TransactionInput
): Promise<Transaction> => {
  // Get related documents first
  const [accountDoc, categoryDoc] = await Promise.all([
    getDoc(firestoreDoc(db, "accounts", transactionInput.accountId)),
    getDoc(firestoreDoc(db, "categories", transactionInput.categoryId)),
  ]);

  if (!accountDoc.exists()) {
    throw new Error("Account not found");
  }
  if (!categoryDoc.exists()) {
    throw new Error("Category not found");
  }
  const accountData = accountDoc.data() as Omit<Account, "id">;
  const categoryData = categoryDoc.data() as Omit<Category, "id">;

  // Create the transaction document
  const transactionRef = await addDoc(collection(db, "transactions"), {
    ...transactionInput,
    createdAt: new Date().toISOString(),
  });

  // Return the complete transaction object with all required fields
  const transaction: Transaction = {
    id: transactionRef.id,
    account: {
      id: accountDoc.id,
      name: accountData.name,
      accountType: accountData.accountType,
      bankName: accountData.bankName,
      balance: accountData.balance,
      currency: accountData.currency,
      lastSync: accountData.lastSync,
      isActive: accountData.isActive,
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
    amount: transactionInput.amount,
    type: transactionInput.type,
    description: transactionInput.description,
    transactionDate: transactionInput.transactionDate,
    isRecurring: transactionInput.isRecurring || false,
    recurringPattern: transactionInput.recurringPattern,
    attachments: [],
  };

  return transaction;
};

export const updateTransaction = async (
  transactionId: string,
  updates: Partial<TransactionInput>
): Promise<void> => {
  const transactionRef = firestoreDoc(db, "transactions", transactionId);
  await updateDoc(transactionRef, updates);
};

export const deleteTransaction = async (
  transactionId: string
): Promise<void> => {
  const transactionRef = firestoreDoc(db, "transactions", transactionId);
  await deleteDoc(transactionRef);
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
      const transactionData = doc.data() as Transaction;

      const [accountDoc, categoryDoc] = await Promise.all([
        getDoc(firestoreDoc(db, "accounts", transactionData.accountId)),
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
          isRecurring: transactionData.isRecurring || false,
          recurringPattern: transactionData.recurringPattern,
          attachments: transactionData.attachments || [],
        };
      } else {
        throw new Error("Related account or category not found");
      }
    })
  );

  return transactions;
};
