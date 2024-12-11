import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  Account,
  AccountInput,
  AccountType,
  AccountWithBalance,
  TransactionResponse,
} from "../types";

export const getAccounts = async (userId: string): Promise<Account[]> => {
  const accountsRef = collection(db, "accounts");
  const q = query(accountsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Account)
  );
};

export const getAccountById = async (
  accountId: string
): Promise<Account | null> => {
  const accountRef = doc(db, "accounts", accountId);
  const accountSnap = await getDoc(accountRef);

  if (!accountSnap.exists()) {
    return null;
  }

  return { id: accountSnap.id, ...accountSnap.data() } as Account;
};

export const getAccountsWithBalance = async (
  userId: string
): Promise<AccountWithBalance[]> => {
  // Get all accounts
  const accounts = await getAccounts(userId);

  // Get all transactions for this user
  const transactionsRef = collection(db, "transactions");
  const q = query(transactionsRef, where("userId", "==", userId));
  const transactionSnapshot = await getDocs(q);
  const transactions = transactionSnapshot.docs.map(
    (doc) => ({...doc.data() } as TransactionResponse)
  );

  // Calculate balance for each account
  const accountsWithBalance = accounts.map((account) => {
    const accountTransactions = transactions.filter(
      (transaction) => transaction.accountId === account.id
    );

    const updatedBalance = accountTransactions.reduce((sum, transaction) => {
      // Add income, subtract expenses
      if (transaction.type === "INCOME") {
        return sum + transaction.amount;
      } else if (transaction.type === "EXPENSE") {
        return sum - transaction.amount;
      }
      return sum; // For TRANSFER type
    }, account.balance);

    return {
      ...account,
      balance: updatedBalance,
      transactionCount: accountTransactions.length,
    };
  });

  return accountsWithBalance;
};

export const createAccount = async (
  accountInput: AccountInput
): Promise<Account> => {
  const accountRef = await addDoc(collection(db, "accounts"), {
    ...accountInput,
    lastSync: new Date().toISOString(),
  });
  return {
    id: accountRef.id,
    ...accountInput,
    lastSync: new Date().toISOString(),
    isActive: true,
  } as Account;
};

export const updateAccount = async (
  accountId: string,
  updates: Partial<Account>
): Promise<void> => {
  const accountRef = doc(db, "accounts", accountId);
  await updateDoc(accountRef, {
    ...updates,
    lastSync: new Date().toISOString(),
  });
};

export const deleteAccount = async (accountId: string): Promise<void> => {
  await deleteDoc(doc(db, "accounts", accountId));
};

// Helper function to get accounts by type
export const getAccountsByType = async (
  userId: string,
  accountType: AccountType
): Promise<Account[]> => {
  const accountsRef = collection(db, "accounts");
  const q = query(
    accountsRef,
    where("userId", "==", userId),
    where("accountType", "==", accountType)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Account)
  );
};
