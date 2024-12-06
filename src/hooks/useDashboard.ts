import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { 
  useAccounts, 
  useTransactions, 
  useBudgets,
  useCategories, 
  useCreateTransaction 
} from '@/api/hooks';
import { differenceInDays, startOfWeek, startOfMonth, isSameMonth, isSameWeek } from 'date-fns';

export const useDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<'week' | 'month'>('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data: accountsData, loading: accountsLoading } = useAccounts(user?.id || '');
  const { data: transactionsData, loading: transactionsLoading } = useTransactions(user?.id || '');
  const { data: budgetsData, loading: budgetsLoading } = useBudgets(user?.id || '');
  const { data: categoriesData } = useCategories(user?.id || '');
  const [createTransaction, { loading: createTransactionLoading }] = useCreateTransaction();

  const loading = accountsLoading || transactionsLoading || budgetsLoading;

  const calculateTrends = (
    transactions: any[],
    currentBalance: number,
    currentSpending: number,
    currentIncome: number,
    totalBudget: number
  ) => {
    const startDate = selectedDateRange === 'week' ? startOfWeek(new Date()) : startOfMonth(new Date());

    const previousTransactions = transactions.filter((t) => {
      const days = differenceInDays(new Date(t.transactionDate), startDate);
      return days >= 0 && days < (selectedDateRange === 'week' ? 7 : 30);
    });

    const previousSpending = previousTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const previousIncome = previousTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: calculatePercentageChange(previousSpending - previousIncome, currentBalance),
      spending: calculatePercentageChange(previousSpending, currentSpending),
      budget: (currentSpending / totalBudget) * 100,
      income: calculatePercentageChange(previousIncome, currentIncome),
    };
  };

  const getFinancialData = (): DashboardData => {
    if (loading)
      return {
        balance: 0,
        spending: 0,
        budget: 0,
        income: 0,
        trends: { balance: 0, spending: 0, budget: 0, income: 0 },
      };

    const dateFilter = (date: string) => {
      const transactionDate = new Date(date);
      if (selectedDateRange === 'week') {
        return isSameWeek(transactionDate, new Date());
      }
      return isSameMonth(transactionDate, new Date());
    };

    const transactions = transactionsData?.transactions || [];
    const currentTransactions = transactions.filter((t) => dateFilter(t.transactionDate));

    const balance = accountsData?.accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
    const spending = currentTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const income = currentTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const budget = budgetsData?.budgets?.reduce((sum, b) => sum + b.amount, 0) || 0;

    const trends = calculateTrends(transactions, balance, spending, income, budget);

    return {
      balance,
      spending,
      budget,
      income,
      trends,
    };
  };

  const calculateBudgetSpent = (budget: any) => {
    const transactions = transactionsData?.transactions || [];
    const startDate = selectedDateRange === 'week' ? startOfWeek(new Date()) : startOfMonth(new Date());

    return transactions
      .filter(
        (t) =>
          t.type === 'EXPENSE' &&
          new Date(t.transactionDate) >= startDate &&
          budget.categories.some((bc: any) => bc.category.id === t.category.id)
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getBudgets = () => {
    if (!budgetsData?.budgets) return [];

    return budgetsData.budgets.map((budget) => {
      const spent = calculateBudgetSpent(budget);
      const percentage = (spent / budget.amount) * 100;

      return {
        name: budget.name,
        allocated: budget.amount,
        spent,
        trend: calculateTrend(spent, budget.amount),
        category: budget.categories[0]?.category.id,
        remaining: budget.amount - spent,
        percentage,
        status: percentage > 80 ? 'warning' : 'normal',
      };
    });
  };

  const getFilteredTransactions = () => {
    if (!transactionsData?.transactions) return [];

    return transactionsData.transactions.filter((transaction) => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || transaction.category.id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const handleAddExpense = async (formData: FormData) => {
    try {
      await createTransaction({
        variables: {
          input: {
            userId: user?.id || '',
            description: formData.get('description') as string,
            amount: -Math.abs(parseFloat(formData.get('amount') as string)),
            categoryId: formData.get('category') as string,
            transactionDate: formData.get('date') as string,
            type: 'EXPENSE',
            isRecurring: false,
          },
        },
      });
      setShowAddExpense(false);
      return true;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return false;
    }
  };

  const calculateTrend = (current: number, previous: number): string => {
    const percentage = calculatePercentageChange(previous, current);
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const calculatePercentageChange = (previous: number, current: number): number => {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  return {
    user,
    loading,
    showAddExpense,
    setShowAddExpense,
    searchTerm,
    setSearchTerm,
    selectedDateRange,
    setSelectedDateRange,
    selectedCategory,
    setSelectedCategory,
    showAnalytics,
    setShowAnalytics,
    createTransactionLoading,
    getFinancialData,
    getBudgets,
    getFilteredTransactions,
    handleAddExpense,
    categories: categoriesData?.categories || [],
  };
};

export default useDashboard;
