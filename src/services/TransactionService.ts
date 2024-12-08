import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
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
  userId: string,
  filters?: TransactionFilters
): Promise<Transaction[]> => {
  let q = query(
    collection(db, "transactions"),
    where("userId", "==", userId),
    orderBy("transactionDate", "desc")
  );

  if (filters?.dateRange) {
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
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
  );
};

export const getTransactionById = async (
  transactionId: string
): Promise<Transaction | null> => {
  const transactionRef = doc(db, "transactions", transactionId);
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
    getDoc(doc(db, "accounts", transactionInput.accountId)),
    getDoc(doc(db, "categories", transactionInput.categoryId)),
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
  const transactionRef = doc(db, "transactions", transactionId);
  await updateDoc(transactionRef, updates);
};

export const deleteTransaction = async (
  transactionId: string
): Promise<void> => {
  const transactionRef = doc(db, "transactions", transactionId);
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
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
  );
};
