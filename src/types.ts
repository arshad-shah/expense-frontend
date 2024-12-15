import { FieldValue } from "firebase/firestore";

// ==================
// Enums & Constants
// ==================
export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER";
export type AccountType =
  | "CHECKING"
  | "SAVINGS"
  | "CREDIT_CARD"
  | "CASH"
  | "INVESTMENT";
export type CategoryType = "INCOME" | "EXPENSE";
export type BudgetPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CNY";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type WeekDay = "sunday" | "monday";
export type BudgetStatus = "ON_TRACK" | "WARNING" | "EXCEEDED";

// ==================
// Base Interfaces
// ==================
interface BaseModel {
  id: string;
  createdAt: FieldValue | string;
  updatedAt?: FieldValue | string;
  isActive: boolean;
  deletedAt?: FieldValue | string;
}
// ==================
// User Types
// ==================
export interface UserStats {
  totalAccounts: number;
  totalTransactions: number;
  totalCategories: number;
  totalBudgets: number;
  lastActive: string;
  signupDate: string;
  monthlySpending: number;
  monthlyIncome: number;
  savingsRate: number;
  lastCalculated: FieldValue | string;
}

export interface UserPreferences {
  currency: Currency;
  dateFormat: DateFormat;
  budgetStartDay: number;
  weekStartDay: WeekDay;
}

export interface User extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
  
  stats: UserStats;
}

export type UserInput = Omit<User, keyof BaseModel | "stats">;

// For direct Firestore timestamp objects
  // Type definition
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
} | {
  _seconds: number;
  _nanoseconds: number;
} | string | FieldValue;
// ==================
// Account Types
// ==================
export interface AccountStats {
  availableCredit?: number;
  pendingTransactions: number;
  dailyBalances: Record<string, number>;
  monthlyTransactionCount: Record<string, number>;
  lastSync: FirestoreTimestamp;
}

export interface Account extends BaseModel {
  userId: string;
  name: string;
  accountType: AccountType;
  bankName: string;
  currency: Currency;
  balance: number;
  stats: AccountStats;
  metadata: {
    accountNumber?: string;
    routingNumber?: string;
    institution?: string;
    lastFour?: string;
    color?: string;
    icon?: string;
  };
}

export type AccountInput = Omit<Account, keyof BaseModel | "stats">;

// ==================
// Transaction Types
// ==================
export interface TransactionMetadata {
  location?: string;
  notes?: string;
  tags?: string[];
  merchantName?: string;
  merchantCategory?: string;
}

export interface Transaction extends BaseModel {
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string;
  transactionDate: string;
  isRecurring: boolean;
  recurringPattern?: string;
  metadata: TransactionMetadata;
  // Denormalized fields for quick access
  categoryName: string;
  accountName: string;
}

export type TransactionInput = Omit<Transaction, keyof BaseModel>;

// ==================
// Category Types
// ==================
export interface CategoryBudget {
  amount: number;
  period: BudgetPeriod;
  spent: number;
  remaining: number;
  status: BudgetStatus;
}

export interface CategoryStats {
  monthlySpending: Record<string, number>;
  monthlyBudgetCompliance: Record<string, number>;
  trend: {
    direction: "up" | "down" | "stable";
    percentage: number;
  };
  lastCalculated: FieldValue | string;
}

export interface Category extends BaseModel {
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  parentId?: string;
}

export type CategoryInput = Omit<Category, keyof BaseModel | "stats">;

// ==================
// Budget Types
// ==================
export interface BudgetCategoryAllocation {
  categoryId: string;
  amount: number;
  spent: number;
  remaining: number;
  status: BudgetStatus;
}

export interface BudgetStats {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  complianceRate: number;
  historicalPerformance: Record<
    string,
    {
      allocated: number;
      spent: number;
      compliance: number;
    }
  >;
}

export interface CategoryAllocation {
  categoryId: string;
  amount: number;
}

export interface Budget extends BaseModel {
  userId: string;
  name: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  amount: number;
  categories: Record<string, BudgetCategoryAllocation>;
  categoryAllocations: CategoryAllocation[];
  stats: BudgetStats;
  rollover: boolean;
}
export type BudgetInput = Omit<
  Budget,
  keyof BaseModel | "stats" | "categories"
>;

// ==================
// Filter & Query Types
// ==================
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface TransactionFilters {
  dateRange?: DateRange;
  categoryIds?: string[];
  accountIds?: string[];
  types?: TransactionType[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  isRecurring?: boolean;
  tags?: string[];
}

export interface BudgetFilters {
  period?: BudgetPeriod;
  isActive?: boolean;
  dateRange?: DateRange;
  categoryIds?: string[];
  status?: BudgetStatus;
}

// ==================
// Response Types
// ==================
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, unknown>;
}

// ==================
// Analytics Types
// ==================
export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  trend: {
    value: number;
    direction: "up" | "down" | "stable";
  };
}

export interface MonthlyAnalytics {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  budgetCompliance: number;
  topCategories: SpendingByCategory[];
}

export interface FinancialInsight {
  type: "SPENDING_PATTERN" | "BUDGET_ALERT" | "SAVING_OPPORTUNITY";
  title: string;
  description: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  category?: string;
  amount?: number;
  recommendations: string[];
}

// ==================
// Collection Paths
// ==================
export const CollectionPaths = {
  users: "users",
  accounts: (userId: string) => `users/${userId}/accounts`,
  transactions: (userId: string, accountId: string) =>
    `users/${userId}/accounts/${accountId}/transactions`,
  categories: (userId: string) => `users/${userId}/categories`,
  budgets: (userId: string) => `users/${userId}/budgets`,
  stats: {
    account: (userId: string, accountId: string) =>
      `users/${userId}/accounts/${accountId}/stats`,
    category: (userId: string, categoryId: string) =>
      `users/${userId}/categories/${categoryId}/stats`,
    budget: (userId: string, budgetId: string) =>
      `users/${userId}/budgets/${budgetId}/stats`,
  },
} as const;
