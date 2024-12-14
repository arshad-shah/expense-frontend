// src/types/account.ts

import { FieldValue } from "firebase/firestore";


// src/types/user.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  
  // Core Financial Settings
  currency: Currency;
  dateFormat: DateFormat;
  budgetStartDay: number; // Day of month budget cycle starts
  weekStartDay: WeekDay; // Which day weeks start on for weekly views
  
  // Stats
  lastActive?: string;
  signupDate: string;
  totalTransactions: number;
  totalAccounts: number;
  
  // Relationships
  accounts?: Account[];
  transactions?: Transaction[];
  categories?: Category[];
  budgets?: Budget[];
}

export interface UserStats {
  totalAccounts: number;
  totalTransactions: number;
  totalCategories: number;
  totalBudgets: number;
  monthlySpending: number;
  monthlyIncome: number;
  savingsRate: number;
  topCategories: Array<{
    category: string;
    amount: number;
  }>;
  trends: {
    income: { value: number; direction: 'up' | 'down' };
    spending: { value: number; direction: 'up' | 'down' };
    savings: { value: number; direction: 'up' | 'down' };
  };
}

export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  currency: Currency;
  dateFormat: DateFormat;
  budgetStartDay: number;
  weekStartDay: WeekDay;
}

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export type WeekDay = 'sunday' | 'monday';


export interface Account {

  id: string;

  userId: string;

  name: string;

  accountType: string;

  bankName: string;

  balance: number;

  currency: string;

  isActive: boolean;

  createdAt: FieldValue | string;

  lastSync: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface AccountWithBalance extends Account {
  balance: number;
  transactionCount: number;
}

export interface AccountInput {
  userId: string;
  name: string;
  accountType: string;
  bankName: string;
  balance: number;
  currency: string;
}
// src/types/transaction.ts
export interface Transaction {
  id: string;
  account: Account;
  category: Category;
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
  isRecurring: boolean;
  recurringPattern?: string;
  attachments?: Attachment[];
}

export interface TransactionInput {
  userId: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: string;
  description: string;
  transactionDate: string;
  isRecurring?: boolean;
  recurringPattern?: string;
}

// src/types/category.ts
export interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  transactions?: Transaction[];
}

export interface CategoryInput {
  userId: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  isDefault?: boolean;
}

// src/types/budget.ts
export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  categories?: BudgetCategory[];
}

export interface BudgetCategory {
  budget: Budget;
  category: Category;
  allocatedAmount: number;
  spentAmount: number;
}

export interface BudgetInput {
  userId: string;
  name: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
}

// src/types/attachment.ts
export interface Attachment {
  id: string;
  transaction: Transaction;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

// src/types/common.ts
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type AccountType = 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'CASH' | 'INVESTMENT';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CNY';

// src/types/responses.ts
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
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
  code?: string;
  field?: string;
}

// src/types/filters.ts
export interface DateRange {
  startDate: string;
  endDate: string;
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
}

export interface BudgetFilters {
  period?: BudgetPeriod;
  isActive?: boolean;
  dateRange?: DateRange;
  categoryIds?: string[];
}

// src/types/analytics.ts
export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  trend: number;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  budgetAmount?: number;
  variance?: number;
}
export interface CategoryPerformance {
  allocated: number;
  spent: number;
  name: string;
  id: string;
  percentageUsed: number;
}

export interface BudgetPerformance {
  budgetId: string;
  budgetName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'ON_TRACK' | 'WARNING' | 'EXCEEDED';
  categoryPerformance: Record<string, CategoryPerformance>;
}


export interface TransactionResponse {
  accountId: string;
  amount: number;
  categoryId: string;
  createdAt: string;
  description: string;
  transactionDate: string;
  type: string;
  userId: string;
}