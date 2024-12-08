import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  SpendingByCategory,
  MonthlySpending,
  BudgetPerformance,
  Transaction,
  Budget,
  BudgetCategory,
  Category,
  DateRange,
  BudgetPeriod,
} from "../types";

export const getSpendingByCategory = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<SpendingByCategory[]> => {
  // Get current period transactions
  const transactionsRef = collection(db, "transactions");
  const currentQ = query(
    transactionsRef,
    where("userId", "==", userId),
    where("transactionDate", ">=", startDate),
    where("transactionDate", "<=", endDate),
    where("type", "==", "EXPENSE")
  );

  // Get previous period transactions for trend calculation
  const previousStartDate = new Date(startDate);
  const previousEndDate = new Date(endDate);
  const periodDiff = previousEndDate.getTime() - previousStartDate.getTime();
  previousStartDate.setTime(previousStartDate.getTime() - periodDiff);
  previousEndDate.setTime(previousEndDate.getTime() - periodDiff);

  const previousQ = query(
    transactionsRef,
    where("userId", "==", userId),
    where(
      "transactionDate",
      ">=",
      previousStartDate.toISOString().split("T")[0]
    ),
    where("transactionDate", "<=", previousEndDate.toISOString().split("T")[0]),
    where("type", "==", "EXPENSE")
  );

  const [currentSnapshot, previousSnapshot] = await Promise.all([
    getDocs(currentQ),
    getDocs(previousQ),
  ]);

  const currentTransactions = currentSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Transaction)
  );

  const previousTransactions = previousSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Transaction)
  );

  // Group current transactions by category and calculate totals
  const categoryTotals = currentTransactions.reduce((acc, transaction) => {
    const categoryId = transaction.category.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        categoryId,
        categoryName: transaction.category.name,
        amount: 0,
        percentage: 0,
        trend: 0,
      };
    }
    acc[categoryId].amount += transaction.amount;
    return acc;
  }, {} as Record<string, SpendingByCategory>);

  // Calculate previous period totals for trend
  const previousCategoryTotals = previousTransactions.reduce(
    (acc, transaction) => {
      const categoryId = transaction.category.id;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += transaction.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate percentages and trends
  const totalSpending = Object.values(categoryTotals).reduce(
    (sum, cat) => sum + cat.amount,
    0
  );

  return Object.values(categoryTotals)
    .map((category) => {
      const previousAmount = previousCategoryTotals[category.categoryId] || 0;
      const trend =
        previousAmount > 0
          ? ((category.amount - previousAmount) / previousAmount) * 100
          : 0;

      return {
        ...category,
        percentage: (category.amount / totalSpending) * 100,
        trend,
      };
    })
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
};

export const getMonthlySpending = async (
  userId: string,
  year: number
): Promise<MonthlySpending[]> => {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  // Get transactions
  const transactionsRef = collection(db, "transactions");
  const transactionsQ = query(
    transactionsRef,
    where("userId", "==", userId),
    where("transactionDate", ">=", startDate),
    where("transactionDate", "<=", endDate)
  );

  // Get budgets
  const budgetsRef = collection(db, "budgets");
  const budgetsQ = query(
    budgetsRef,
    where("userId", "==", userId),
    where("period", "==", "MONTHLY"),
    where("startDate", ">=", startDate),
    where("endDate", "<=", endDate)
  );

  const [transactionsSnapshot, budgetsSnapshot] = await Promise.all([
    getDocs(transactionsQ),
    getDocs(budgetsQ),
  ]);

  const transactions = transactionsSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Transaction)
  );

  const budgets = budgetsSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Budget)
  );

  // Group transactions by month
  const monthlyTotals = transactions.reduce((acc, transaction) => {
    const month = transaction.transactionDate.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = {
        month,
        amount: 0,
        budgetAmount: 0,
        variance: 0,
      };
    }
    if (transaction.type === "EXPENSE") {
      acc[month].amount += transaction.amount;
    }
    return acc;
  }, {} as Record<string, MonthlySpending>);

  // Add budget amounts
  budgets.forEach((budget) => {
    const month = budget.startDate.substring(0, 7);
    if (monthlyTotals[month]) {
      monthlyTotals[month].budgetAmount = budget.amount;
      monthlyTotals[month].variance =
        monthlyTotals[month].budgetAmount - monthlyTotals[month].amount;
    }
  });

  return Object.values(monthlyTotals).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
};

export const getBudgetPerformance = async (
  userId: string,
  period: BudgetPeriod,
  dateRange?: DateRange
): Promise<BudgetPerformance[]> => {
  const budgetsRef = collection(db, "budgets");
  let q = query(
    budgetsRef,
    where("userId", "==", userId),
    where("period", "==", period),
    where("isActive", "==", true)
  );

  if (dateRange) {
    q = query(
      q,
      where("startDate", ">=", dateRange.startDate),
      where("endDate", "<=", dateRange.endDate)
    );
  }

  const querySnapshot = await getDocs(q);
  const budgets = querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Budget)
  );

  // Get all categories for these budgets
  const budgetCategoriesRef = collection(db, "budgetCategories");
  const categoriesPromises = budgets.map(async (budget) => {
    const categoriesQ = query(
      budgetCategoriesRef,
      where("budgetId", "==", budget.id)
    );
    const snapshot = await getDocs(categoriesQ);
    return snapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
        } as BudgetCategory)
    );
  });

  const budgetCategories = await Promise.all(categoriesPromises);

  return budgets.map((budget, index) => {
    const categories = budgetCategories[index];
    const spent = categories.reduce(
      (sum, cat) => sum + (cat.spentAmount || 0),
      0
    );
    const allocated = categories.reduce(
      (sum, cat) => sum + cat.allocatedAmount,
      0
    );
    const percentageUsed = (spent / allocated) * 100;

    let status: "ON_TRACK" | "WARNING" | "EXCEEDED" = "ON_TRACK";
    if (percentageUsed >= 100) {
      status = "EXCEEDED";
    } else if (percentageUsed >= 80) {
      status = "WARNING";
    }

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      allocated,
      spent,
      remaining: allocated - spent,
      percentageUsed,
      status,
    };
  });
};
