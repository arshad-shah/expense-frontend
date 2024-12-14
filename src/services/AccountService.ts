import {
  collection,
  query,
  where,

  updateDoc,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  increment,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  Account,
  AccountInput,
  AccountType,
  AccountWithBalance,
  TransactionResponse,
  ApiResponse,
  PaginatedResponse
} from "../types";

// Default account settings
const DEFAULT_ACCOUNT_STATE = {
  isActive: true,
  createdAt: serverTimestamp(),
  lastSync: serverTimestamp(),
};

/**
 * Updates user statistics in Firestore
 */
const updateUserStats = async (
  userId: string,
  updates: {
    totalAccounts?: number;
    totalTransactions?: number;
  }
) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...updates,
    lastActive: serverTimestamp(),
  });
};

/**
 * Get all accounts for a user with optional pagination
 */
export const getAccounts = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Account>> => {
  try {
    const accountsRef = collection(db, "accounts");
    const q = query(
      accountsRef, 
      where("userId", "==", userId),
      where("isActive", "==", true)
    );
    
    const snapshot = await getDocs(q);
    const total = snapshot.docs.length;
    
    // Update user stats with the correct total
    await updateUserStats(userId, { totalAccounts: total });
    
    const start = (page - 1) * limit;
    const accounts = snapshot.docs
      .slice(start, start + limit)
      .map(doc => ({ id: doc.id, ...doc.data() } as Account));

    return {
      items: accounts,
      total,
      page,
      limit,
      hasMore: total > page * limit
    };
  } catch (error) {
    throw new Error(`Failed to fetch accounts: ${error}`);
  }
};

/**
 * Create a new account with validation and user stats update
 */
export const createAccount = async (
  accountInput: AccountInput
): Promise<ApiResponse<Account>> => {
  try {
    // Validate required fields
    if (!accountInput.userId || !accountInput.name || !accountInput.accountType) {
      return {
        status: 400,
        error: "Missing required fields"
      };
    }

    const batch = writeBatch(db);

    // Create the account document
    const accountRef = doc(collection(db, "accounts"));
    batch.set(accountRef, {
      ...accountInput,
      ...DEFAULT_ACCOUNT_STATE,
    });

    // Update user stats
    const userRef = doc(db, "users", accountInput.userId);
    batch.update(userRef, {
      totalAccounts: increment(1),
      lastActive: serverTimestamp(),
    });

    await batch.commit();

    const newAccount = {
      id: accountRef.id,
      ...accountInput,
      ...DEFAULT_ACCOUNT_STATE,
    } as Account;

    return {
      status: 201,
      data: newAccount
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to create account: ${error}`
    };
  }
};

/**
 * Soft delete an account and handle associated data
 */
export const deleteAccount = async (accountId: string): Promise<ApiResponse<void>> => {
  try {
    const batch = writeBatch(db);
    
    // Get account data first to access userId
    const accountRef = doc(db, "accounts", accountId);
    const accountSnap = await getDoc(accountRef);
    
    if (!accountSnap.exists()) {
      return {
        status: 404,
        error: "Account not found"
      };
    }

    const accountData = accountSnap.data();
    const userId = accountData.userId;
    
    // Soft delete the account
    batch.update(accountRef, { 
      isActive: false,
      deletedAt: serverTimestamp()
    });

    // Get associated transactions
    const transactionsRef = collection(db, "transactions");
    const transactionsQuery = query(transactionsRef, 
      where("accountId", "==", accountId),
      where("isActive", "==", true)
    );
    const transactions = await getDocs(transactionsQuery);
    
    // Mark transactions as deleted
    const transactionCount = transactions.docs.length;
    transactions.docs.forEach(transactionDoc => {
      batch.update(doc(db, "transactions", transactionDoc.id), {
        isActive: false,
        deletedAt: serverTimestamp()
      });
    });

    // Update user stats
    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      totalAccounts: increment(-1),
      totalTransactions: increment(-transactionCount),
      lastActive: serverTimestamp(),
    });

    await batch.commit();

    return {
      status: 200
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to delete account: ${error}`
    };
  }
};

/**
 * Update an account with validation and error handling
 */
export const updateAccount = async (
  accountId: string,
  updates: Partial<Account>
): Promise<ApiResponse<void>> => {
  try {
    const accountRef = doc(db, "accounts", accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return {
        status: 404,
        error: "Account not found"
      };
    }

    const accountData = accountSnap.data();
    const batch = writeBatch(db);

    // Update the account
    batch.update(accountRef, {
      ...updates,
      lastSync: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update user's lastActive timestamp
    const userRef = doc(db, "users", accountData.userId);
    batch.update(userRef, {
      lastActive: serverTimestamp(),
    });

    await batch.commit();

    return {
      status: 200
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to update account: ${error}`
    };
  }
};

// Rest of the service remains the same...
/**
 * Get a single account by ID with error handling
 */
export const getAccountById = async (
  accountId: string
): Promise<ApiResponse<Account>> => {
  try {
    const accountRef = doc(db, "accounts", accountId);
    const accountSnap = await getDoc(accountRef);

    if (!accountSnap.exists()) {
      return {
        status: 404,
        error: "Account not found"
      };
    }

    return {
      status: 200,
      data: { id: accountSnap.id, ...accountSnap.data() } as Account
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to fetch account: ${error}`
    };
  }
};

/**
 * Get accounts with calculated balances and transaction counts
 */
export const getAccountsWithBalance = async (
  userId: string
): Promise<ApiResponse<AccountWithBalance[]>> => {
  try {
    // Get all active accounts
    const accountsRef = collection(db, "accounts");
    const accountsQuery = query(
      accountsRef,
      where("userId", "==", userId),
      where("isActive", "==", true)
    );
    const accounts = await getDocs(accountsQuery);

    // Get all transactions for this user
    const transactionsRef = collection(db, "transactions");
    const transactionsQuery = query(transactionsRef, where("userId", "==", userId));
    const transactions = await getDocs(transactionsQuery);

    const accountsWithBalance = accounts.docs.map(accountDoc => {
      const account = { id: accountDoc.id, ...accountDoc.data() } as Account;
      
      const accountTransactions = transactions.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            accountId: data.accountId,
            amount: data.amount,
            categoryId: data.categoryId,
            createdAt: data.createdAt,
            type: data.type,
            userId: data.userId,
            isActive: data.isActive,
            description: data.description,
            transactionDate: data.transactionDate
          } as TransactionResponse;
        })
        .filter(transaction => transaction.accountId === account.id);

      const balance = accountTransactions.reduce((sum, transaction) => {
        const amount = Number(transaction.amount);
        switch(transaction.type) {
          case "INCOME":
            return sum + amount;
          case "EXPENSE":
            return sum - amount;
          default:
            return sum;
        }
      }, Number(account.balance));

      return {
        ...account,
        balance,
        transactionCount: accountTransactions.length
      };
    });

    return {
      status: 200,
      data: accountsWithBalance
    };
  } catch (error) {
    return {
      status: 500,
      error: `Failed to fetch accounts with balance: ${error}`
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
  limit: number = 10
): Promise<PaginatedResponse<Account>> => {
  try {
    const accountsRef = collection(db, "accounts");
    const q = query(
      accountsRef,
      where("userId", "==", userId),
      where("accountType", "==", accountType),
      where("isActive", "==", true)
    );
    
    const snapshot = await getDocs(q);
    const total = snapshot.docs.length;
    
    const start = (page - 1) * limit;
    const accounts = snapshot.docs
      .slice(start, start + limit)
      .map(doc => ({ id: doc.id, ...doc.data() } as Account));

    return {
      items: accounts,
      total,
      page,
      limit,
      hasMore: total > page * limit
    };
  } catch (error) {
    throw new Error(`Failed to fetch accounts by type: ${error}`);
  }
};