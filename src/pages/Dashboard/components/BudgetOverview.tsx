import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactions } from '@/services/TransactionService';
import { getBudgets } from '@/services/BudgetService';
import type { Transaction, TransactionFilters } from '@/types';
import EmptyState from '@/components/EmptyState';
import { TrendingUp, AlertTriangle, Circle, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetWithSpending {
  category: string;
  spent: number;
  limit: number;
  categoryColor?: string;
  currency: string;
}

const BudgetOverview: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();


  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const budgetsData = await getBudgets(user.id, { isActive: true });
        const filters: TransactionFilters = {
          dateRange: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
          },
          categoryIds: budgetsData.flatMap(budget => budget.categories?.map(cat => cat.category.id) || [])
        };

        const transactions = await getTransactions(filters);
        
        const budgetWithSpending = budgetsData.map(budget => {
          const relevantTransactions = transactions.filter(t => 
            budget.categories?.some(cat => cat.category.id === t.category.id)
          );
          
          return {
            category: budget.name,
            spent: calculateCategorySpending(
              relevantTransactions,
              budget.categories?.map(cat => cat.category.id) || []
            ),
            limit: budget.amount,
            categoryColor: budget.categories?.[0]?.category.color,
            // Use the currency from the first relevant transaction's account, fallback to user's currency
            currency: user?.currency || 'USD'
          };
        });

        setBudgets(budgetWithSpending.sort((a, b) => 
          (b.spent / b.limit) - (a.spent / a.limit)
        ));
      } catch (err) {
        console.error('Error fetching budget data:', err);
        setError('Failed to load budget information');
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [user]);

  const calculateCategorySpending = (
    transactions: Transaction[], 
    categoryIds: string[]
  ): number => {
    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'EXPENSE' && categoryIds.includes(transaction.category.id)) {
        return total + transaction.amount;
      }
      return total;
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total budget and spent
  const totals = budgets.reduce((acc, curr) => ({
    spent: acc.spent + curr.spent,
    limit: acc.limit + curr.limit
  }), { spent: 0, limit: 0 });

  const totalPercentage = (totals.spent / totals.limit) * 100;

    const getProgressStyle = (percentage: number) => {
    if (percentage > 100) {
      return {
        background: 'linear-gradient(to right, #f87171, #ef4444)',
        boxShadow: '0 0 12px rgba(239, 68, 68, 0.15)'
      };
    }
    if (percentage > 85) {
      return {
        background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
        boxShadow: '0 0 12px rgba(245, 158, 11, 0.15)'
      };
    }
    if (percentage > 70) {
      return {
        background: 'linear-gradient(to right, #34d399, #10b981)',
        boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)'
      };
    }
    return {
      background: 'linear-gradient(to right, #60a5fa, #3b82f6)',
      boxShadow: '0 0 12px rgba(59, 130, 246, 0.15)'
    };
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600 bg-red-50';
    if (percentage > 85) return 'text-amber-600 bg-amber-50';
    if (percentage > 70) return 'text-emerald-600 bg-emerald-50';
    return 'text-blue-600 bg-blue-50';
  };


  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-6 flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 p-6 pt-0 animate-pulse space-y-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-6 flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
        </div>
        <div className="flex-1 p-6 pt-0">
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="p-6 flex-none">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 p-6 pt-0">
          <EmptyState 
            heading="No budgets found" 
            message="Create a budget to start tracking your spending"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="p-6 flex-none">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 p-6 pt-0 overflow-y-auto">
        {/* Total Budget Overview Card */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Budget</span>
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              getStatusColor(totalPercentage)
            )}>
              {totalPercentage > 100 ? (
                <span className="flex items-center gap-1">
                  <ChevronUp className="w-3 h-3" />
                  Over Budget
                </span>
              ) : (
                `${totalPercentage.toFixed(1)}%`
              )}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(totals.spent)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                of {formatCurrency(totals.limit)}
              </span>
            </div>
          </div>
        </div>

        {/* Individual Budgets */}
        <div className="space-y-6">
          {budgets.map((budget, index) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const progressStyle = getProgressStyle(percentage);

            return (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Circle
                      className="w-3 h-3" 
                      style={{ color: budget.categoryColor || '#6b7280' }}
                      fill="currentColor"
                    />
                    <span className="font-medium text-gray-900">
                      {budget.category}
                    </span>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    getStatusColor(percentage)
                  )}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 ease-out relative group-hover:opacity-80"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        ...progressStyle
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.1] to-white/0" />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-xs text-gray-400 mx-1">/</span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(budget.limit)}
                    </span>
                  </div>
                </div>

                {percentage > 100 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      Over budget by {formatCurrency(budget.spent - budget.limit)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;