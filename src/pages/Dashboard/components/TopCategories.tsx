import { useEffect, useState, useCallback } from 'react';
import { getTransactions } from '@/services/TransactionService';
import { getCategories } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction, Category } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, PieChart as PieChartIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySpending {
  name: string;
  value: number;
  color: string;
  percentage: number;
  id: string;
  transactionCount: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategorySpending;
  }>;
}

const TopCategories = () => {
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { user } = useAuth();

  const processCategorySpending = useCallback((transactions: Transaction[], categoryMap: Map<string, Category>): CategorySpending[] => {
    const spendingMap = new Map<string, Omit<CategorySpending, 'percentage'>>();
    let total = 0;

    // Calculate totals and transaction counts
    transactions.forEach(transaction => {
      if (transaction.type === 'EXPENSE') {
        const categoryId = transaction.categoryId;
        const category = categoryMap.get(categoryId);
        if (!category) return;

        const existing = spendingMap.get(categoryId);
        const amount = transaction.amount;
        total += amount;
        
        if (existing) {
          existing.value += amount;
          existing.transactionCount += 1;
        } else {
          spendingMap.set(categoryId, {
            id: categoryId,
            name: category.name,
            value: amount,
            color: category.color || '#6B7280',
            transactionCount: 1
          });
        }
      }
    });

    // Calculate percentages and sort
    return Array.from(spendingMap.values())
      .map(category => ({
        ...category,
        percentage: (category.value / total) * 100
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, []);

  const fetchCategoryData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch categories and transactions in parallel
      const [categoriesResponse, transactionsResponse] = await Promise.all([
        getCategories(user.id),
        getTransactions(user.id, {
          dateRange: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
          },
          types: ['EXPENSE']
        }, 1, 1000)
      ]);

      if (categoriesResponse.status !== 200 || !categoriesResponse.data) {
        throw new Error('Failed to fetch categories');
      }

      if (transactionsResponse.status !== 200 || !transactionsResponse.data) {
        throw new Error('Failed to fetch transactions');
      }

      // Create a map of categories for easy lookup
      const categoryMap = new Map(
        categoriesResponse.data.map(category => [category.id, category])
      );

      const categoryTotals = processCategorySpending(
        transactionsResponse.data.items,
        categoryMap
      );
      
      setCategories(categoryTotals);
    } catch (err) {
      console.error('Error fetching category data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load category information');
    } finally {
      setLoading(false);
    }
  }, [user?.id, processCategorySpending]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.preferences.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

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
          <p className="text-gray-500">{data.percentage.toFixed(1)}% of total</p>
          <p className="text-gray-500">{data.transactionCount} transactions</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
          <PieChartIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-100 rounded-lg" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-full" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded" />
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

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
            <p className="text-sm text-gray-500 mt-1">No spending data available</p>
          </div>
          <PieChartIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">No spending data for this period</p>
          <p className="text-sm text-gray-400 mt-1">Start tracking your expenses to see insights</p>
        </div>
      </div>
    );
  }

  const totalSpent = categories.reduce((sum, cat) => sum + cat.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
          <p className="text-sm text-gray-500 mt-1">
            Total spent: {formatCurrency(totalSpent)}
          </p>
        </div>
        <PieChartIcon className="w-5 h-5 text-gray-400" />
      </div>

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
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {categories.map((entry, index) => (
                  <Cell
                    key={entry.id}
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
              key={category.id}
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
                  <span className="font-medium text-gray-900">
                    {category.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <ArrowUpRight className="w-3 h-3" />
                    {category.percentage.toFixed(1)}% of total
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "font-medium",
                  activeIndex === index ? "text-gray-900" : "text-gray-600"
                )}>
                  {formatCurrency(category.value)}
                </span>
                <div className="text-xs text-gray-500">
                  {category.transactionCount} transactions
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopCategories;