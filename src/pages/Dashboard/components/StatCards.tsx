import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, CreditCard, Wallet, PiggyBank, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAccountsWithBalance } from '@/services/AccountService';
import { getTransactions } from '@/services/TransactionService';
import type { Transaction } from '@/types';
import { cn } from '@/lib/utils';

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

        // Get transactions for both months
        const currentMonthTransactions = await getTransactions({
          dateRange: {
            startDate: currentMonthStart.toISOString(),
            endDate: currentMonthEnd.toISOString()
          }
        });

        const previousMonthTransactions = await getTransactions({
          dateRange: {
            startDate: previousMonthStart.toISOString(),
            endDate: previousMonthEnd.toISOString()
          }
        });

        // Calculate monthly spending and savings
        const currentMonthData = calculateMonthlyData(currentMonthTransactions);
        const previousMonthData = calculateMonthlyData(previousMonthTransactions);

        // Calculate month-over-month changes
        const spendingChange = calculatePercentageChange(
          previousMonthData.spending,
          currentMonthData.spending
        );

        const savingsChange = calculatePercentageChange(
          previousMonthData.income - previousMonthData.spending,
          currentMonthData.income - currentMonthData.spending
        );

        // Calculate balance change based on net flow
        const currentNetFlow = currentMonthData.income - currentMonthData.spending;
        const previousNetFlow = previousMonthData.income - previousMonthData.spending;
        const balanceChange = calculatePercentageChange(previousNetFlow, currentNetFlow);

        setStats({
          totalBalance,
          monthlySpending: currentMonthData.spending,
          monthlySavings: currentMonthData.income - currentMonthData.spending,
          balanceChange,
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
          acc.income += transaction.amount;
        }
        return acc;
      },
      { spending: 0, income: 0 }
    );
  };

  const calculatePercentageChange = (previous: number, current: number) => {
    if (previous === 0) {
      if (current === 0) return 0;
      return current > 0 ? 100 : -100;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 bg-gray-100 rounded-lg"></div>
                <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
              </div>
              <div>
                <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                <div className="h-8 w-32 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!stats) return null;

  const getChangeStyle = (change: number, inverse: boolean = false) => {
    const isPositive = inverse ? change <= 0 : change >= 0;
    return {
      colors: isPositive 
        ? 'text-emerald-600 bg-emerald-50'
        : 'text-indigo-600 bg-indigo-50',
      icon: isPositive ? TrendingUp : TrendingDown
    };
  };

  const getCardStyle = (index: number) => {
    const styles = [
      {
        gradient: 'from-blue-50 to-indigo-50/50',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        border: 'border-blue-100',
      },
      {
        gradient: 'from-emerald-50 to-teal-50/50',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        border: 'border-emerald-100',
      },
      {
        gradient: 'from-violet-50 to-purple-50/50',
        iconBg: 'bg-violet-50',
        iconColor: 'text-violet-600',
        border: 'border-violet-100',
      }
    ];
    return styles[index];
  };

  const statCards = [
    {
      title: 'Total Balance',
      amount: stats.totalBalance,
      change: stats.balanceChange,
      icon: Wallet,
      description: 'Net worth across all accounts'
    },
    {
      title: 'Monthly Spending',
      amount: stats.monthlySpending,
      change: stats.spendingChange,
      icon: CreditCard,
      inverse: true,
      description: 'Total expenses this month'
    },
    {
      title: 'Monthly Savings',
      amount: stats.monthlySavings,
      change: stats.savingsChange,
      icon: PiggyBank,
      description: 'Net savings this month'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const style = getCardStyle(index);
        const changeStyle = getChangeStyle(stat.change, stat.inverse);
        const ChangeIcon = changeStyle.icon;

        return (
          <div
            key={index}
            className={cn(
              "relative bg-gradient-to-br rounded-xl shadow-sm p-6 border",
              "transition-all duration-200",
              "hover:shadow-md hover:border-opacity-75",
              style.gradient,
              style.border
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-2.5 rounded-xl",
                style.iconBg
              )}>
                <stat.icon className={cn(
                  "h-6 w-6",
                  style.iconColor
                )} />
              </div>

              <div className={cn(
                "flex items-center px-2.5 py-1.5 rounded-full text-sm font-medium",
                changeStyle.colors
              )}>
                <ChangeIcon className="h-4 w-4 mr-1" />
                {Math.abs(stat.change).toFixed(1)}%
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stat.amount)}
              </p>
              <p className="text-xs text-gray-500">
                {stat.description}
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/50 to-transparent"></div>
          </div>
        );
      })}
    </div>
  );
};

export default StatCards;