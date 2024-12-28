import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { CollectionPaths } from "../types";
import type {
  Account,
  AccountInput,
  AccountType,
  AccountStats,
  ApiResponse,
  PaginatedResponse,
} from "../types";
import { updateUserStats } from "./userService";

// Default account stats
const DEFAULT_ACCOUNT_STATS: AccountStats = {
  pendingTransactions: 0,
  dailyBalances: {},
  monthlyTransactionCount: {},
  lastSync: serverTimestamp(),
};

/**
 * Get all accounts for a user with optional pagination
 */
export const getAccounts = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
): Promise<ApiResponse<PaginatedResponse<Account>>> => {
  try {
    const accountsPath = CollectionPaths.accounts(userId);
    const accountsRef = collection(db, accountsPath);
    const q = query(accountsRef, where("isActive", "==", true));

    const snapshot = await getDocs(q);
    const total = snapshot.docs.length;

    const start = (page - 1) * limit;
    const accounts = snapshot.docs.slice(start, start + limit).map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toString(),
        updatedAt: data.updatedAt?.toString(),
        deletedAt: data.deletedAt?.toString(),
        stats: {
          ...data.stats,
          lastSync: data.stats.lastSync,
        },
      } as Account;
    });

    return {
      status: 200,
      data: {
        items: accounts,
        total,
        page,
        limit,
        hasMore: total > page * limit,
      },
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to fetch accounts: ${error}`,
    };
  }
};

/**
 * Create a new account with validation and user stats update
 */
export const createAccount = async (
  userId: string,
  accountInput: AccountInput,
): Promise<ApiResponse<Account>> => {
  try {
    // Validate required fields
    if (!accountInput.name || !accountInput.accountType) {
      return {
        status: 400,
        error: "Missing required fields",
      };
    }

    const batch = writeBatch(db);

    // Create the account document with proper collection path
    const accountsPath = CollectionPaths.accounts(userId);
    const accountRef = doc(collection(db, accountsPath));

    const newAccount: Account = {
      id: accountRef.id,
      userId,
      name: accountInput.name,
      accountType: accountInput.accountType,
      bankName: accountInput.bankName,
      currency: accountInput.currency,
      balance:
        accountInput.accountType === "CREDIT_CARD"
          ? -Math.abs(accountInput.balance || 0)
          : accountInput.balance || 0,
      metadata: accountInput.metadata || {},
      stats: DEFAULT_ACCOUNT_STATS,
      createdAt: serverTimestamp(),
      isActive: true,
    };

    batch.set(accountRef, newAccount);

    // Update user stats
    await updateUserStats(userId, { totalAccounts: 1 });

    await batch.commit();

    return {
      status: 201,
      data: {
        ...newAccount,
        createdAt: new Date().toISOString(),
        stats: {
          ...DEFAULT_ACCOUNT_STATS,
          lastSync: serverTimestamp(),
        },
      },
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to create account: ${error}`,
    };
  }
};

/**
 * Get a single account by ID with error handling
 */
export const getAccountById = async (
  userId: string,
  accountId: string,
): Promise<ApiResponse<Account>> => {
  try {
    const accountRef = doc(db, CollectionPaths.accounts(userId), accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return {
        status: 404,
        error: "Account not found",
      };
    }

    const data = accountSnap.data() as Account;
    return {
      status: 200,
      data: {
        ...data,
        id: accountSnap.id,
        createdAt: data.createdAt.toString(),
        updatedAt: data.updatedAt?.toString(),
        deletedAt: data.deletedAt?.toString(),
        stats: {
          ...data.stats,
          lastSync: data.stats.lastSync,
        },
      },
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to fetch account: ${error}`,
    };
  }
};

/**
 * Update an account with validation and error handling
 */
export const updateAccount = async (
  userId: string,
  accountId: string,
  updates: Partial<Omit<Account, "id" | "userId" | "stats">>,
): Promise<ApiResponse<Account>> => {
  try {
    const accountRef = doc(db, CollectionPaths.accounts(userId), accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return {
        status: 404,
        error: "Account not found",
      };
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(accountRef, updateData);

    // Fetch and return updated account
    const response = await getAccountById(userId, accountId);
    return response;
  } catch (error) {
    return {
      status: 500,
      error: `Failed to update account: ${error}`,
    };
  }
};

/**
 * Soft delete an account
 */
export const deleteAccount = async (
  userId: string,
  accountId: string,
): Promise<ApiResponse<void>> => {
  try {
    const accountRef = doc(db, CollectionPaths.accounts(userId), accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return { status: 404, error: "Account not found" };
    }

    const batch = writeBatch(db);

    // Soft delete the account
    batch.update(accountRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Mark all transactions as inactive
    const transactionsRef = collection(
      db,
      CollectionPaths.transactions(userId, accountId),
    );
    const transactionsSnapshot = await getDocs(
      query(transactionsRef, where("isActive", "==", true)),
    );

    transactionsSnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        isActive: false,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    // Update user stats
    await updateUserStats(userId, {
      totalAccounts: -1,
      totalTransactions: -transactionsSnapshot.size,
    });

    await batch.commit();

    return {
      status: 200,
      message: "Account successfully deleted",
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to delete account: ${error}`,
    };
  }
};
/**
 * Get accounts by type with pagination
 */
export const getAccountsByType = async (
  userId: string,
  accountType: AccountType,
  page: number = 1,
  limit: number = 10,
): Promise<ApiResponse<PaginatedResponse<Account>>> => {
  try {
    const accountsPath = CollectionPaths.accounts(userId);
    const accountsRef = collection(db, accountsPath);
    const q = query(
      accountsRef,
      where("accountType", "==", accountType),
      where("isActive", "==", true),
    );

    const snapshot = await getDocs(q);
    const total = snapshot.docs.length;

    const start = (page - 1) * limit;
    const accounts = snapshot.docs.slice(start, start + limit).map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toString(),
        updatedAt: data.updatedAt?.toString(),
        deletedAt: data.deletedAt?.toString(),
        stats: {
          ...data.stats,
          lastSync: data.stats.lastSync.toString(),
        },
      } as Account;
    });

    return {
      status: 200,
      data: {
        items: accounts,
        total,
        page,
        limit,
        hasMore: total > page * limit,
      },
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to fetch accounts by type: ${error}`,
    };
  }
};
