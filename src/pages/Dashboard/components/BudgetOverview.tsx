import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getTransactions } from '@/services/TransactionService';
import type { Budget, Transaction } from '@/types';
import EmptyState from '@/components/EmptyState';

interface BudgetWithSpending {
  category: string;
  spent: number;
  limit: number;
  categoryColor?: string;
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

        // Get current month's dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch budgets
        const budgetsRef = collection(db, 'budgets');
        const budgetsQuery = query(
          budgetsRef,
          where('userId', '==', user.id),
          where('isActive', '==', true)
        );
        const budgetsSnapshot = await getDocs(budgetsQuery);
        const budgetsData = budgetsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Budget[];

        // Fetch transactions for current month
        const transactions = await getTransactions(user.id, {
          dateRange: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString()
          }
        });

        // Calculate spending for each budget category
        const budgetWithSpending = budgetsData.map(budget => {
          const categorySpending = calculateCategorySpending(
            transactions,
            budget.categories?.map(cat => cat.category.id) || []
          );

          return {
            category: budget.name,
            spent: categorySpending,
            limit: budget.amount,
            categoryColor: budget.categories?.[0]?.category.color // Assuming first category color as budget color
          };
        });

        // Sort by percentage spent (highest first)
        const sortedBudgets = budgetWithSpending.sort((a, b) => 
          (b.spent / b.limit) - (a.spent / a.limit)
        );

        setBudgets(sortedBudgets);
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
      if (
        transaction.type === 'EXPENSE' && 
        categoryIds.includes(transaction.category.id)
      ) {
        return total + transaction.amount;
      }
      return total;
    }, 0);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
      {budgets.length === 0 ? (
        <EmptyState heading='No budgets found' message='Create a budget to get started' />
      ) : (
        <div className="mt-4 space-y-4">
          {budgets.map((budget, index) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const isOverBudget = percentage > 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-600">
                    {budget.category}
                  </span>
                  <span className={`font-medium ${
                    isOverBudget ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    ${budget.spent.toLocaleString()} / ${budget.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-2 transition-all duration-500 ${
                      isOverBudget ? 'bg-red-500' : 
                      percentage > 80 ? 'bg-yellow-500' : 
                      budget.categoryColor ? `bg-[${budget.categoryColor}]` : 'bg-teal-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-xs text-red-600">
                    Over budget by ${(budget.spent - budget.limit).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;