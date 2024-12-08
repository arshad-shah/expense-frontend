import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { getTransactions } from '@/services/TransactionService';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction } from '@/types';

interface MonthlySpending {
  month: string;
  spending: number;
  income: number;
}

const SpendingChart: React.FC = () => {
  const [data, setData] = useState<MonthlySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Calculate date range for last 6 months
        const now = new Date();
        const sixMonthsAgo = new Date(
          now.getFullYear(),
          now.getMonth() - 5,
          1
        );
        
        // Fetch transactions for the last 6 months
        const transactions = await getTransactions(user.id, {
          dateRange: {
            startDate: sixMonthsAgo.toISOString(),
            endDate: now.toISOString()
          }
        });

        const monthlyData = processTransactions(transactions);
        setData(monthlyData);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load spending data');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const processTransactions = (transactions: Transaction[]): MonthlySpending[] => {
    // Create a map to store monthly totals
    const monthlyTotals = new Map<string, { spending: number; income: number }>();

    // Get last 6 months
    const months = [];
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

    // Convert to array format for chart
    return months.map(month => ({
      month,
      ...monthlyTotals.get(month)!
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Spending Trends</h2>
        <div className="mt-4 h-80 animate-pulse bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
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
          <p className="text-red-600">
            Spending: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-green-600">
            Income: ${payload[1].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900">Spending Trends</h2>
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="spending" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444' }}
              name="Spending"
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e' }}
              name="Income"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingChart;