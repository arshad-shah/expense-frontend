import React, { useState } from 'react';
import { Dialog } from '@/components/Dialog';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  CreditCard, 
  Building2, 
  CalendarClock, 
  Wallet2, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight,
  Activity,
  TrendingUp,
  BadgeDollarSign,
  Clock,
  CreditCard as CardIcon,
  BarChart3,
  PiggyBank
} from 'lucide-react';
import type { Account, Transaction } from '@/types';
import { motion } from 'framer-motion';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account;
  transactions: Transaction[];
}

const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
  account,
  transactions
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('month');

  const calculateStatistics = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));
    
    const periodStart = selectedPeriod === 'month' ? startOfMonth : startOfWeek;
    const thisMonthTransactions = transactions.filter(t => 
      new Date(t.transactionDate) >= periodStart
    );

    const totalIncome = thisMonthTransactions.reduce((sum, t) => 
      t.type === 'INCOME' ? sum + t.amount : sum, 0
    );

    const totalExpenses = thisMonthTransactions.reduce((sum, t) => 
      t.type === 'EXPENSE' ? sum + t.amount : sum, 0
    );

    const avgTransaction = thisMonthTransactions.length > 0 
      ? thisMonthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / thisMonthTransactions.length
      : 0;

    const largestTransaction = thisMonthTransactions.length > 0
      ? Math.max(...thisMonthTransactions.map(t => Math.abs(t.amount)))
      : 0;

    const transactionCount = thisMonthTransactions.length;
    const netChange = totalIncome - totalExpenses;

    // Create chart data
    const chartData = Array.from({ length: selectedPeriod === 'month' ? 30 : 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayTransactions = transactions.filter(t => 
        new Date(t.transactionDate).toDateString() === date.toDateString()
      );
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        balance: dayTransactions.reduce((sum, t) => 
          sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0
        )
      };
    }).reverse();

    return {
      totalIncome,
      totalExpenses,
      transactionCount,
      netChange,
      avgTransaction,
      largestTransaction,
      chartData
    };
  };

  const stats = calculateStatistics();
  const lastSyncDate = new Date(account.lastSync.seconds * 1000 + account.lastSync.nanoseconds / 1000000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Account Details"
    >
      <div>
        {/* Hero Section */}
        <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-6 rounded-xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M0,50 L100,50" stroke="currentColor" strokeWidth="0.5" />
              <path d="M50,0 L50,100" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium opacity-90">Current Balance</h4>
                <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 opacity-75" />
                <span>{account.bankName}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 opacity-75" />
                <span>{stats.transactionCount} transactions this {selectedPeriod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Period Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
            {(['week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Activity Chart */}
          <div className="p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Activity Overview</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span>Daily Balance Change</span>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                    tickLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: '0.5rem',
                      padding: '0.5rem'
                    }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Balance Change']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#6366F1"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              className="rounded-xl border border-gray-100 p-4 hover:border-emerald-100 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 text-emerald-600 mb-3">
                <div className="p-1.5 rounded-lg bg-emerald-50">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="font-medium">Income</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(stats.totalIncome)}
              </p>
              <p className="text-sm text-gray-500">This {selectedPeriod}</p>
            </motion.div>

            <motion.div 
              className="rounded-xl border border-gray-100 p-4 hover:border-red-100 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 text-red-600 mb-3">
                <div className="p-1.5 rounded-lg bg-red-50">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <span className="font-medium">Expenses</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(stats.totalExpenses)}
              </p>
              <p className="text-sm text-gray-500">This {selectedPeriod}</p>
            </motion.div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <BadgeDollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Avg. Transaction</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.avgTransaction)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Largest Transaction</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats.largestTransaction)}
              </p>
            </div>
          </div>

          {/* Account Details */}
          <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-gray-100">
                    <CalendarClock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-sm text-gray-500">
                      {lastSyncDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-gray-100">
                    <Activity className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Net Change</p>
                    <p className={`text-sm ${stats.netChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(stats.netChange))}
                      {stats.netChange >= 0 ? ' profit' : ' loss'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AccountDetailsModal;