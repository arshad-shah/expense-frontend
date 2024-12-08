import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { getRecentTransactions } from '@/services/TransactionService';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction } from '@/types';
import EmptyState from '@/components/EmptyState';

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const recentTransactions = await getRecentTransactions(user.id, 5);
        setTransactions(recentTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load recent transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // If today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    // If yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // Otherwise show date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        <div className="mt-4 flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-lg">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
      {transactions.length === 0 ? (
        <EmptyState heading='No recent transactions found' message='Start tracking your expenses to see them here' />
      ) : (
        <div className="mt-4">
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span 
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: transaction.category.color }}
                      />
                      <p className="text-sm text-gray-500">
                        {transaction.category.name}
                      </p>
                      <span className="text-sm text-gray-400">
                        {transaction.account.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}
                    ${transaction.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;