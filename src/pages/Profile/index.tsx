import React, { useState, useEffect } from 'react';
import { User, UserStats, UserInput, Currency, WeekDay, DateFormat } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { 
  CreditCard, 
  DollarSign, 
  PiggyBank, 
  Settings, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { getUser, updateUser, getUserStats } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import ErrorState from '@/components/ErrorState';
import PageLoader from '@/components/PageLoader';
import EmptyState from '@/components/EmptyState';
import { CURRENCY } from '@/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color: string;
}

const ProfileComponent = () => {
  const { user : authUser} = useAuth();
  const userId = authUser?.id;
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User ID is not defined');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [userData, userStats] = await Promise.all([
          getUser(userId, true),
          getUserStats(userId)
        ]);

        if (!userData) {
          throw new Error('User not found');
        }

        setUser(userData);
        setStats(userStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdatePreferences = async (updates: Partial<UserInput>) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await updateUser(user.id, updates);
      const updatedUser = await getUser(user.id, true);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

    const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.direction === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trend.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <PageLoader text='Loading profile...' />
    );
  }

  if (error || !user || !stats) {
    return (
      <ErrorState message={error || 'Failed to load profile'} onRetry={() => window.location.reload()} />
    );
  }

  return (
    <div className="bg-gradient-to-br p-8">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                Member since {new Date(user.signupDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Monthly Income"
            value={formatCurrency(stats.monthlyIncome)}
            icon={DollarSign}
            trend={stats.trends.income}
            color="text-green-600"
          />
          <StatCard
            title="Monthly Spending"
            value={formatCurrency(stats.monthlySpending)}
            icon={CreditCard}
            trend={stats.trends.spending}
            color="text-red-600"
          />
          <StatCard
            title="Savings Rate"
            value={`${stats.savingsRate.toFixed(1)}%`}
            icon={PiggyBank}
            trend={stats.trends.savings}
            color="text-purple-600"
          />
          <StatCard
            title="Active Budgets"
            value={stats.totalBudgets}
            icon={Settings}
            color="text-indigo-600"
          />
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Spending Categories</h2>
          <div className="space-y-4">
            {stats.topCategories.length > 0 ? (
              stats.topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-purple-700">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-700">{category.category}</span>
                </div>
                <span className="font-semibold text-gray-900">
                {formatCurrency(category.amount)}
                </span>
              </div>
              ))
            ) : (
              <EmptyState message='No transactions found, start adding transactions to see your top categories' />
            )}
          </div>
        </div>

        {/* Settings/Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Preferences</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <Select value={user.currency} onValueChange={(value: Currency) => handleUpdatePreferences({ currency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <Select value={user.dateFormat} onValueChange={(value: DateFormat) => handleUpdatePreferences({ dateFormat: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week Starts On
                </label>
                <Select value={user.weekStartDay} onValueChange={(value: WeekDay) => handleUpdatePreferences({ weekStartDay: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;