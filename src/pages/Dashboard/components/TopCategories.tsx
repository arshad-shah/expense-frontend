import React, { useEffect, useState } from 'react';
import { getTransactions } from '@/services/TransactionService';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import EmptyState from '@/components/EmptyState';
import { ArrowUpRight, PieChart as PieChartIcon, AlertTriangle } from 'lucide-react';

interface CategorySpending {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

const TopCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { user } = useAuth();

  

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const transactions = await getTransactions({
          dateRange: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
          }
        });

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
    const categoryMap = new Map<string, CategorySpending>();
    let total = 0;

    // Calculate totals
    transactions.forEach(transaction => {
      if (transaction.type === 'EXPENSE') {
        const { category } = transaction;
        const existing = categoryMap.get(category.id);
        const amount = transaction.amount;
        total += amount;
        
        if (existing) {
          existing.value += amount;
        } else {
          categoryMap.set(category.id, {
            name: category.name,
            value: amount,
            color: category.color,
          });
        }
      }
    });

    // Add percentage and return sorted array
    return Array.from(categoryMap.values())
      .map(category => ({
        ...category,
        percentage: (category.value / total) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
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
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
          <PieChartIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-100 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-gray-900">{data.name}</span>
          </div>
          <div className="text-sm space-y-1">
            <p className="font-medium text-gray-900">{formatCurrency(data.value)}</p>
            <p className="text-gray-500">{data.percentage?.toFixed(1)}% of total</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const totalSpent = categories.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Total spent: {formatCurrency(totalSpent)}</p>
        </div>
        <PieChartIcon className="w-5 h-5 text-gray-400" />
      </div>

      {categories.length === 0 ? (
        <EmptyState 
          heading="No spending data available" 
          message="Start tracking your expenses to see insights" 
        />
      ) : (
        <div className="space-y-6">
          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid gap-3">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg transition-colors duration-150 hover:bg-gray-50"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <ArrowUpRight className="w-3 h-3" />
                      {category.percentage?.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <span className={`font-medium ${
                  activeIndex === index ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {formatCurrency(category.value)}
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