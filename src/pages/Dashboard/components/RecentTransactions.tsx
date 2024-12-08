import React, { useEffect, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  Clock,
  CreditCard,
  MoreVertical
} from 'lucide-react';
import { getRecentTransactions } from '@/services/TransactionService';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction, TransactionType } from '@/types';
import EmptyState from '@/components/EmptyState';
import { cn } from '@/lib/utils';

const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Array<Transaction & { type: TransactionType }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const recentTransactions = (await getRecentTransactions(user.id, 5)).map(transaction => ({
          ...transaction,
          type: transaction.type as TransactionType
        }));
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

  const formatCurrency = (amount: number, type: TransactionType) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);

    return `${type === 'INCOME' ? '+' : '-'}${formatted}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest financial activity</p>
          </div>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="animate-pulse flex items-center justify-between p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-100 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32"></div>
                  <div className="h-3 bg-gray-100 rounded w-24"></div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div>
                <div className="h-3 bg-gray-100 rounded w-16 ml-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">Your latest financial activity</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  const TransactionIcon = ({ type }: { type: TransactionType }) => {
    const baseClasses = "p-2.5 rounded-full flex items-center justify-center transition-colors duration-200";
    const iconClasses = "w-5 h-5";
    
    if (type === 'INCOME') {
      return (
        <div className={cn(baseClasses, "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100")}>
          <ArrowUpRight className={iconClasses} />
        </div>
      );
    }
    return (
      <div className={cn(baseClasses, "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100")}>
        <ArrowDownRight className={iconClasses} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <p className="text-sm text-gray-500 mt-1">Your latest financial activity</p>
        </div>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      {transactions.length === 0 ? (
        <EmptyState 
          heading='No recent transactions' 
          message='Start tracking your expenses to see them here' 
        />
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="group flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <TransactionIcon type={transaction.type} />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      transaction.type === 'INCOME' 
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-indigo-50 text-indigo-700"
                    )}>
                      {transaction.type === 'INCOME' ? 'Income' : 'Expense'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: transaction.category.color }}
                      />
                      <span className="text-gray-600">
                        {transaction.category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{transaction.account.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={cn(
                    "font-medium",
                    transaction.type === 'INCOME' ? "text-emerald-600" : "text-indigo-600"
                  )}>
                    {formatCurrency(transaction.amount, transaction.type)}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(transaction.transactionDate)}
                  </p>
                </div>
                
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;