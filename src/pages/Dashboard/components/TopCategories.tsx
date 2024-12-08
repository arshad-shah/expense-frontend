// components/TopCategories.tsx
import React, { useEffect, useState } from 'react';
import { getTransactions } from '@/services/TransactionService';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import EmptyState from '@/components/EmptyState';

interface CategorySpending {
  name: string;
  value: number;
  color: string;
}

const TopCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get current month's dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch transactions
        const transactions = await getTransactions(user.id, {
          dateRange: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
          }
        });

        // Process transactions by category
        const categoryTotals = processCategorySpending(transactions);
        setCategories(categoryTotals);

      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category information');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [user]);

  const processCategorySpending = (transactions: Transaction[]): CategorySpending[] => {
    // Create a map to store category totals
    const categoryMap = new Map<string, CategorySpending>();

    // Process all expense transactions
    transactions.forEach(transaction => {
      if (transaction.type === 'EXPENSE') {
        const { category } = transaction;
        const existing = categoryMap.get(category.id);
        
        if (existing) {
          existing.value += transaction.amount;
        } else {
          categoryMap.set(category.id, {
            name: category.name,
            value: transaction.amount,
            color: category.color,
          });
        }
      }
    });

    // Convert to array and sort by value
    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Get top 5 categories
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
        <div className="mt-4 h-64 animate-pulse bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-gray-600">
            ${data.value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
      {categories.length === 0 ? (
          <EmptyState heading='No spending data available' message='Start tracking your expenses to see insights' />
      ) : (
        <div className="mt-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-sm text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-700">{category.name}</span>
                </div>
                <span className="text-gray-600">
                  ${category.value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TopCategories;