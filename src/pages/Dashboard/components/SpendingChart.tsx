import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactions } from '@/services/TransactionService';
import { getUserStats } from '@/services/userService';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import type { Transaction, UserStats } from '@/types';

interface MonthlySpending {
  month: string;
  spending: number;
  income: number;
}

const SpendingChart: React.FC = () => {
  const [data, setData] = useState<MonthlySpending[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total spending and income
  const totals = data.reduce((acc, curr) => ({
    spending: acc.spending + curr.spending,
    income: acc.income + curr.income
  }), { spending: 0, income: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError('');
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        
        // Fetch both transactions and user stats in parallel
        const [transactionsResponse, stats] = await Promise.all([
          getTransactions({
            dateRange: {
              startDate: sixMonthsAgo.toISOString(),
              endDate: now.toISOString()
            }
          }, 1, 1000), // Request a large page size to get all transactions at once
          getUserStats(user.id)
        ]);

        if (transactionsResponse.status !== 200 || !transactionsResponse.data) {
          throw new Error(transactionsResponse.error || 'Failed to fetch transactions');
        }

        const monthlyData = processTransactions(transactionsResponse.data.items);
        setData(monthlyData);
        setUserStats(stats);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load spending data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const processTransactions = (transactions: Transaction[]): MonthlySpending[] => {
    const monthlyTotals = new Map<string, { spending: number; income: number }>();
    const months = [];
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months.unshift(monthKey);
      monthlyTotals.set(monthKey, { spending: 0, income: 0 });
    }

    // Process transactions
    transactions.forEach(transaction => {
      const date = new Date(transaction.transactionDate);
      const monthKey = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      
      if (monthlyTotals.has(monthKey)) {
        const currentTotals = monthlyTotals.get(monthKey)!;
        if (transaction.type === 'EXPENSE') {
          currentTotals.spending += transaction.amount;
        } else if (transaction.type === 'INCOME') {
          currentTotals.income += transaction.amount;
        }
      }
    });

    // Convert to array format
    return months.map(month => ({
      month,
      ...monthlyTotals.get(month)!
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Spending Trends</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
            <div className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
            <div className="animate-pulse bg-gray-100 h-16 rounded-lg"></div>
          </div>
          <div className="h-80 animate-pulse bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Spending Trends</h2>
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ArrowDownRight className="h-4 w-4 text-indigo-600" />
              <p className="text-indigo-600">
                Spending: {formatCurrency(payload[0].value)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
              <p className="text-emerald-600">
                Income: {formatCurrency(payload[1].value)}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => {
    const trends = userStats?.trends;
    
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
            <span className="text-sm font-medium text-gray-600">Total Spending</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totals.spending)}
            </p>
            {trends?.spending && (
              <div className="flex items-center space-x-1">
                {trends.spending.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className={`text-sm font-medium ${
                  trends.spending.direction === 'up' ? 'text-red-500' : 'text-green-500'
                }`}>
                  {trends.spending.value}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-emerald-600"></div>
            <span className="text-sm font-medium text-gray-600">Total Income</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(totals.income)}
            </p>
            {trends?.income && (
              <div className="flex items-center space-x-1">
                {trends.income.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trends.income.direction === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trends.income.value}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <div className="h-3 w-3 rounded-full bg-blue-600"></div>
            <span className="text-sm font-medium text-gray-600">Savings Rate</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              {userStats?.savingsRate.toFixed(1)}%
            </p>
            {trends?.savings && (
              <div className="flex items-center space-x-1">
                {trends.savings.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trends.savings.direction === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trends.savings.value}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Spending Trends</h2>
      
      <CustomLegend />
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#f1f5f9" 
              vertical={false}
            />
            
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={value => formatCurrency(value)}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#e2e8f0' }}
            />
            
            <Line 
              type="monotone" 
              dataKey="spending" 
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ fill: '#4f46e5', strokeWidth: 2, stroke: '#fff', r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Spending"
              fill="url(#spendingGradient)"
            />
            
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ fill: '#059669', strokeWidth: 2, stroke: '#fff', r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Income"
              fill="url(#incomeGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingChart;