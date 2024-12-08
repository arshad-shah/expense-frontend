import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCards from './components/StatCards';
import SpendingChart from './components/SpendingChart';
import RecentTransactions from './components/RecentTransactions';
import BudgetOverview from './components/BudgetOverview';
import TopCategories from './components/TopCategories';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const firstName = user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) : '';
  const lastName = user?.lastName ? user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1) : '';

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName} {lastName}
          </h1>
          <p className="text-gray-600">Here's your financial overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Last updated</p>
          <p className="text-sm font-medium text-gray-900">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <div className="lg:col-span-2">
          <SpendingChart />
        </div>

        {/* Budget Overview */}
        <div className="space-y-6">
          <BudgetOverview />
          <TopCategories />
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;