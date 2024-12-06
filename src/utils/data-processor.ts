// Mock data replacement logic

interface FinancialData {
  balance: number;
  spending: number;
  budget: number;
  income: number;
  trends: {
    balance: number;
    spending: number;
    budget: number;
    income: number;
  };
}

// Main financial data calculation
const getFinancialData = (): FinancialData => {
  const accounts = accountsData?.accounts || [];
  const transactions = transactionsData?.transactions || [];
  const budgets = budgetsData?.budgets || [];

  const currentPeriodStart = selectedDateRange === 'week' 
    ? subDays(new Date(), 7) 
    : startOfMonth(new Date());

  const previousPeriodStart = selectedDateRange === 'week'
    ? subDays(currentPeriodStart, 7)
    : subMonths(currentPeriodStart, 1);

  const currentTransactions = transactions.filter(t => 
    new Date(t.transactionDate) >= currentPeriodStart
  );

  const previousTransactions = transactions.filter(t =>
    new Date(t.transactionDate) >= previousPeriodStart &&
    new Date(t.transactionDate) < currentPeriodStart
  );

  const balance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const spending = calculatePeriodSpending(currentTransactions);
  const previousSpending = calculatePeriodSpending(previousTransactions);
  const income = calculatePeriodIncome(currentTransactions);
  const previousIncome = calculatePeriodIncome(previousTransactions);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  return {
    balance,
    spending,
    budget: totalBudget,
    income,
    trends: {
      balance: calculatePercentageChange(previousBalance, balance),
      spending: calculatePercentageChange(previousSpending, spending),
      budget: (spending / totalBudget) * 100,
      income: calculatePercentageChange(previousIncome, income)
    }
  };
};

// Budget calculations
const calculateBudgetSpent = (budget: Budget): number => {
  const transactions = transactionsData?.transactions || [];
  const currentPeriodStart = selectedDateRange === 'week'
    ? subDays(new Date(), 7)
    : startOfMonth(new Date());

  return transactions
    .filter(t => 
      t.type === 'EXPENSE' &&
      new Date(t.transactionDate) >= currentPeriodStart &&
      budget.categories.some(bc => bc.category.id === t.category.id)
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

const calculateBudgetTrend = (budget: Budget): string => {
  const transactions = transactionsData?.transactions || [];
  const currentPeriodStart = selectedDateRange === 'week'
    ? subDays(new Date(), 7)
    : startOfMonth(new Date());
  const previousPeriodStart = selectedDateRange === 'week'
    ? subDays(currentPeriodStart, 7)
    : subMonths(currentPeriodStart, 1);

  const currentSpent = transactions
    .filter(t => 
      t.type === 'EXPENSE' &&
      new Date(t.transactionDate) >= currentPeriodStart &&
      budget.categories.some(bc => bc.category.id === t.category.id)
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const previousSpent = transactions
    .filter(t => 
      t.type === 'EXPENSE' &&
      new Date(t.transactionDate) >= previousPeriodStart &&
      new Date(t.transactionDate) < currentPeriodStart &&
      budget.categories.some(bc => bc.category.id === t.category.id)
    )
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const percentageChange = calculatePercentageChange(previousSpent, currentSpent);
  return `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`;
};

// Helper functions
const calculatePeriodSpending = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
};

const calculatePeriodIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
};

const calculatePercentageChange = (previous: number, current: number): number => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const subDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

const subMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
};

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getBudgets = () => {
  if (!budgetsData?.budgets) return [];

  return budgetsData.budgets.map(budget => {
    const spent = calculateBudgetSpent(budget);
    const trend = calculateBudgetTrend(budget);
    const percentage = (spent / budget.amount) * 100;

    return {
      name: budget.name,
      allocated: budget.amount,
      spent,
      trend,
      category: budget.categories[0]?.category.id,
      remaining: budget.amount - spent,
      percentage,
      status: percentage > 80 ? 'warning' : 'normal'
    };
  });
};

export default {
    getFinancialData,
    getBudgets
}