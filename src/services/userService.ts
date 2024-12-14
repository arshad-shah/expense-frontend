import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  User,
  UserInput,
  Account,
  Transaction,
  Category,
  Budget,
  UserStats,
} from "../types";

// Default user preferences for new users
const DEFAULT_USER_PREFERENCES: Pick<User, 'dateFormat' | 'budgetStartDay' | 'weekStartDay'> = {
  dateFormat: 'MM/DD/YYYY',
  budgetStartDay: 1,
  weekStartDay: 'monday',
};

/**
 * Retrieves a user by their ID with optional related data
 * @param userId - The unique identifier of the user
 * @param includeRelations - Whether to include related data (accounts, transactions, etc.)
 * @returns The user object or null if not found
 */
export const getUser = async (
  userId: string,
  includeRelations: boolean = false
): Promise<User | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const userData = userSnap.data() as User;

  if (!includeRelations) {
    return {
      ...userData,
      id: userSnap.id,
    };
  }

  // Fetch related data if requested
  const [accountsSnap, transactionsSnap, categoriesSnap, budgetsSnap] =
    await Promise.all([
      getDocs(query(collection(db, "accounts"), where("userId", "==", userId))),
      getDocs(
        query(collection(db, "transactions"), where("userId", "==", userId))
      ),
      getDocs(
        query(collection(db, "categories"), where("userId", "==", userId))
      ),
      getDocs(query(collection(db, "budgets"), where("userId", "==", userId))),
    ]);

  // Update usage statistics
  await updateDoc(userRef, {
    lastActive: new Date().toISOString(),
    totalAccounts: accountsSnap.size,
    totalTransactions: transactionsSnap.size,
  });

  // Return user with all related data
  return {
    ...userData,
    id: userSnap.id,
    accounts: accountsSnap.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Account)
    ),
    transactions: transactionsSnap.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Transaction)
    ),
    categories: categoriesSnap.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Category)
    ),
    budgets: budgetsSnap.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Budget)
    ),
  };
};

/**
 * Creates a new user with default categories
 * @param userInput - The user input data including ID
 * @returns The created user object
 */
export const createUser = async (
  userInput: UserInput & { id: string }
): Promise<User> => {
  // Create base user object
  const user: User = {
    id: userInput.id,
    email: userInput.email,
    firstName: userInput.firstName,
    lastName: userInput.lastName,
    currency: userInput.currency,
    signupDate: new Date().toISOString(),
    totalTransactions: 0,
    totalAccounts: 0,
    ...DEFAULT_USER_PREFERENCES,
  };

  // check if we have categories in the database
  const categoriesSnap = await getDocs(query(collection(db, "categories"), where("userId", "==", userInput.id)));
  
  // Default categories for new users
  const defaultCategories = [
    // Income Categories
    { name: "Salary", type: "INCOME", icon: "dollar", color: "#4CAF50" },
    { name: "Investments", type: "INCOME", icon: "trending-up", color: "#66BB6A" },
    { name: "Other Income", type: "INCOME", icon: "plus-circle", color: "#8BC34A" },

    // Essential Expenses
    { name: "Housing", type: "EXPENSE", icon: "home", color: "#455A64" },
    { name: "Utilities", type: "EXPENSE", icon: "zap", color: "#607D8B" },
    { name: "Groceries", type: "EXPENSE", icon: "shopping-cart", color: "#FF7043" },
    { name: "Transport", type: "EXPENSE", icon: "car", color: "#2196F3" },
  ];

  const batch = writeBatch(db);

  // Write the user document
  const userDocRef = doc(db, "users", user.id);
  batch.set(userDocRef, {
    ...user,
    createdAt: new Date().toISOString(),
  });

  if (categoriesSnap.empty) {
    console.log('Creating default categories');
    
    // Write default categories
    defaultCategories.forEach((category) => {
      const categoryDocRef = doc(db, "categories");
      batch.set(categoryDocRef, {
        ...category,
      });
    });
  }

  await batch.commit();
  return user;
};

/**
 * Updates user information
 * @param userId - The ID of the user to update
 * @param updates - Partial user data to update
 */
export const updateUser = async (
  userId: string,
  updates: Partial<UserInput>
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Gets comprehensive statistics for a user
 * @param userId - The ID of the user
 * @returns User statistics including financial metrics and trends
 */
export const getUserStats = async (
  userId: string
): Promise<UserStats> => {
  // Fetch all relevant data
  const [accountsSnap, transactionsSnap, categoriesSnap, budgetsSnap] =
    await Promise.all([
      getDocs(query(collection(db, "accounts"), where("userId", "==", userId))),
      getDocs(
        query(collection(db, "transactions"), where("userId", "==", userId))
      ),
      getDocs(
        query(collection(db, "categories"), where("userId", "==", userId))
      ),
      getDocs(query(collection(db, "budgets"), where("userId", "==", userId))),
    ]);

  // Calculate current month metrics
  const currentDate = new Date();
  const firstDayOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  
  // Process transactions
  const transactions = transactionsSnap.docs.map(doc => {
    const data = doc.data();

    // get account and category objects using the data.accountId and data.categoryId
    const account = accountsSnap.docs.find(acc => acc.id === data.accountId)?.data();
    const category = categoriesSnap.docs.find(cat => cat.id === data.categoryId)?.data();
    
    return {
      id: doc.id,
      account: account,
      category: category,
      amount: data.amount,
      type: data.type,
      transactionDate: new Date(data.transactionDate).toISOString(),
      description: data.description || '',
      isRecurring: data.isRecurring || false,
    } as Transaction;
  });

  // Filter transactions by month
  const currentMonthTransactions = transactions
    .filter(transaction => new Date(transaction.transactionDate) >= firstDayOfCurrentMonth);

    
  const lastMonthTransactions = transactions
    .filter(transaction => 
      new Date(transaction.transactionDate) >= firstDayOfLastMonth && 
      new Date(transaction.transactionDate) < firstDayOfCurrentMonth
    );

  // Calculate current month metrics
  const currentMonthlySpending = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate last month metrics
  const lastMonthlySpending = lastMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthlyIncome = lastMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate savings rates
  const currentSavingsRate = currentMonthlyIncome > 0 
    ? ((currentMonthlyIncome - currentMonthlySpending) / currentMonthlyIncome) * 100 
    : 0;

  const lastSavingsRate = lastMonthlyIncome > 0
    ? ((lastMonthlyIncome - lastMonthlySpending) / lastMonthlyIncome) * 100
    : 0;

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, direction: 'up' as const };
    const percentageChange = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Number(percentageChange.toFixed(1))),
      direction: percentageChange >= 0 ? 'up' as const : 'down' as const
    };
  };

  const trends = {
    income: calculateTrend(currentMonthlyIncome, lastMonthlyIncome),
    spending: calculateTrend(currentMonthlySpending, lastMonthlySpending),
    savings: calculateTrend(currentSavingsRate, lastSavingsRate)
  };

  // Calculate top spending categories
  const categorySpending = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {

      
      acc[t.category.name] = (acc[t.category.name] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categorySpending)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Return comprehensive statistics
  return {
    totalAccounts: accountsSnap.size,
    totalTransactions: transactionsSnap.size,
    totalCategories: categoriesSnap.size,
    totalBudgets: budgetsSnap.size,
    monthlySpending: currentMonthlySpending,
    monthlyIncome: currentMonthlyIncome,
    savingsRate: currentSavingsRate,
    topCategories,
    trends
  };
};