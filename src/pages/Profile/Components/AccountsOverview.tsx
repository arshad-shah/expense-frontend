
import React from 'react';
import { User } from '@/types';

interface AccountOverviewProps {
  user: User;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({ user }) => {
  const totalAccounts = user.accounts?.length || 0;
  const totalTransactions = user.transactions?.length || 0;
  const totalCategories = user.categories?.length || 0;
  const totalBudgets = user.budgets?.length || 0;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Total Accounts</div>
        <div className="mt-2 text-3xl font-semibold text-gray-900">{totalAccounts}</div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Transactions</div>
        <div className="mt-2 text-3xl font-semibold text-gray-900">{totalTransactions}</div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Categories</div>
        <div className="mt-2 text-3xl font-semibold text-gray-900">{totalCategories}</div>
      </div>
      
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-gray-500">Active Budgets</div>
        <div className="mt-2 text-3xl font-semibold text-gray-900">{totalBudgets}</div>
      </div>
    </div>
  );
};