import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Wallet, TrendingUp, Plus, PieChart,
  ArrowUpRight, ArrowDownRight, BarChart,
  Calendar, Search, Filter, Download, LogOut
} from 'lucide-react';
import useDashboard from '@/hooks/useDashboard';
import LoadingScreen from '@/components/Loading';
import { logout } from '@/store/slices/authslice';

const Dashboard = () => {
    const dispatch = useDispatch();
const {
    user,
    loading,
    showAddExpense,
    setShowAddExpense,
    searchTerm,
    setSearchTerm,
    selectedDateRange,
    setSelectedDateRange,
    selectedCategory,
    setSelectedCategory,
    showAnalytics,
    setShowAnalytics,
    createTransactionLoading,
    getFinancialData,
    getBudgets,
    getFilteredTransactions,
    handleAddExpense,
    categories
  } = useDashboard();

  if (loading) {
    return <LoadingScreen />;
  }

  const financialData = getFinancialData();

  const summaryCards = [
    {
      title: 'Total Balance',
      amount: financialData.balance,
      trend: `${financialData.trends.balance >= 0 ? '+' : ''}${financialData.trends.balance}%`,
      isPositive: financialData.trends.balance >= 0,
      icon: Wallet,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: `${selectedDateRange.charAt(0).toUpperCase() + selectedDateRange.slice(1)}ly Spending`,
      amount: financialData.spending,
      trend: `${financialData.trends.spending >= 0 ? '+' : ''}${financialData.trends.spending}%`,
      isPositive: financialData.trends.spending < 0,
      icon: TrendingUp,
      color: 'from-red-500 to-red-600'
    },
    {
      title: `${selectedDateRange.charAt(0).toUpperCase() + selectedDateRange.slice(1)}ly Budget`,
      amount: financialData.budget,
      trend: `${financialData.trends.budget}% used`,
      isPositive: financialData.trends.budget < 80,
      icon: PieChart,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Income Overview',
      amount: financialData.income,
      trend: `${financialData.trends.income >= 0 ? '+' : ''}${financialData.trends.income}%`,
      isPositive: financialData.trends.income >= 0,
      icon: BarChart,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleLogout = () => {
    dispatch(logout());
    sessionStorage.removeItem('token'); // Remove token from storage
    window.location.reload(); // Optional: Redirect or refresh the page
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await handleAddExpense(new FormData(e.currentTarget));
    if (success) setShowAddExpense(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-sm text-primary-600">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
                <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center px-4 py-2 rounded-lg text-primary-600 hover:bg-primary-50"
              >
                <BarChart className="w-4 h-4 mr-2" />
                Analytics
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transform transition-all duration-200 hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedDateRange('week')}
            className={`px-4 py-2 rounded-lg ${
              selectedDateRange === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-primary-600 hover:bg-primary-50'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedDateRange('month')}
            className={`px-4 py-2 rounded-lg ${
              selectedDateRange === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-primary-600 hover:bg-primary-50'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-600">{card.title}</p>
                  <p className="mt-2 text-2xl font-bold text-primary-900">
                    {user?.currency} {card.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {card.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${card.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {card.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Budgets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary-900">Budgets Overview</h2>
            <button className="text-primary-600 hover:text-primary-700 flex items-center">
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getBudgets().map((budget, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 ${
                  budget.status === 'warning' ? 'ring-2 ring-red-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary-600">{budget.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    budget.status === 'warning' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {budget.trend}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        budget.percentage > 80 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${budget.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-600">
                      Spent: {user?.currency} {budget.spent.toFixed(2)}
                    </span>
                    <span className="text-primary-600">
                      of {user?.currency} {budget.allocated.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary-900">Recent Transactions</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <Filter className="w-5 h-5 text-primary-600 cursor-pointer hover:text-primary-700" />
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {getFilteredTransactions().map((transaction) => (
              <div
                key={transaction.id}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${categories.find(c => c.id === transaction.category.id)?.color || 'bg-gray-500'}`}>
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-primary-900">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-primary-600">{transaction.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">
                          {categories.find(c => c.id === transaction.category.id)?.name || 'Other'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        {transaction.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs text-primary-500">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}
                      {user?.currency} {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-primary-600 flex items-center justify-end gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(transaction.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-primary-900 mb-4">Add New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-primary-600">Description</label>
                <input
                  type="text"
                  id="description"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-primary-600">Amount</label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                    {user?.currency}
                  </span>
                  <input
                    type="number"
                    id="amount"
                    required
                    step="0.01"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-primary-600">Category</label>
                <select
                  id="category"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-primary-600">Tags</label>
                <input
                  type="text"
                  id="tags"
                  placeholder="Enter tags separated by commas"
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-primary-600">Location</label>
                <input
                  type="text"
                  id="location"
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-primary-600">Date</label>
                <input
                  type="date"
                  id="date"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700"
                >
                  Cancel
                </button>
                <button
                    disabled={createTransactionLoading}
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;