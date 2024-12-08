import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, CreditCard, Wallet, PiggyBank } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAccountsWithBalance } from '@/services/AccountService';
import { getTransactions } from '@/services/TransactionService';
import type { Transaction, AccountWithBalance } from '@/types';

interface StatData {
  totalBalance: number;
  monthlySpending: number;
  monthlySavings: number;
  balanceChange: number;
  spendingChange: number;
  savingsChange: number;
}

const StatCards: React.FC = () => {
  const [stats, setStats] = useState<StatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Get all accounts with their balances
        const accounts = await getAccountsWithBalance(user.id);
        const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

        // Calculate dates for filtering
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get current month's transactions
        const currentMonthTransactions = await getTransactions(user.id, {
          dateRange: {
            startDate: currentMonthStart.toISOString(),
            endDate: currentMonthEnd.toISOString()
          }
        });

        // Get previous month's transactions
        const previousMonthTransactions = await getTransactions(user.id, {
          dateRange: {
            startDate: previousMonthStart.toISOString(),
            endDate: previousMonthEnd.toISOString()
          }
        });

        // Calculate monthly data
        const currentMonthData = calculateMonthlyData(currentMonthTransactions);
        const previousMonthData = calculateMonthlyData(previousMonthTransactions);

        // Calculate percentage changes
        const spendingChange = calculatePercentageChange(
          previousMonthData.spending,
          currentMonthData.spending
        );
        const savingsChange = calculatePercentageChange(
          previousMonthData.savings,
          currentMonthData.savings
        );

        setStats({
          totalBalance,
          monthlySpending: currentMonthData.spending,
          monthlySavings: currentMonthData.savings,
          balanceChange: calculateBalanceChange(accounts),
          spendingChange,
          savingsChange
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const calculateMonthlyData = (transactions: Transaction[]) => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'EXPENSE') {
          acc.spending += transaction.amount;
        } else if (transaction.type === 'INCOME') {
          acc.savings += transaction.amount;
        }
        return acc;
      },
      { spending: 0, savings: 0 }
    );
  };

  const calculatePercentageChange = (previous: number, current: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const calculateBalanceChange = (accounts: AccountWithBalance[]) => {
    // You could calculate this based on the difference between current and initial balances
    // or use a more sophisticated calculation based on your needs
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const totalTransactions = accounts.reduce((sum, account) => sum + account.transactionCount, 0);
    return totalTransactions > 0 ? ((totalBalance / totalTransactions) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-8 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Balance',
      amount: stats.totalBalance,
      change: stats.balanceChange,
      trending: stats.balanceChange >= 0 ? 'up' : 'down',
      icon: Wallet
    },
    {
      title: 'Monthly Spending',
      amount: stats.monthlySpending,
      change: stats.spendingChange,
      trending: stats.spendingChange <= 0 ? 'up' : 'down', // Inverse for spending
      icon: CreditCard
    },
    {
      title: 'Monthly Savings',
      amount: stats.monthlySavings,
      change: stats.savingsChange,
      trending: stats.savingsChange >= 0 ? 'up' : 'down',
      icon: PiggyBank
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-teal-50">
              <stat.icon className="h-6 w-6 text-teal-600" />
            </span>
            <span className={`flex items-center text-sm font-medium ${
              stat.trending === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.trending === 'up' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(stat.change).toFixed(1)}%
            </span>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">{stat.title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            ${stat.amount.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;