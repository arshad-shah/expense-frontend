import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';
import { Transaction } from '@/types';
import React, { useEffect, useState } from 'react';
import { getTransactions } from '@/services/TransactionService';

interface SummaryCardsProps {
  currentTransactions: Transaction[];
  formatCurrency: (amount: number) => string;
}

interface MonthlyTotals {
  income: number;
  expenses: number;
  net: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  currentTransactions,
  formatCurrency
}) => {
  const [previousMonthTotals, setPreviousMonthTotals] = useState<MonthlyTotals | null>(null);

  useEffect(() => {
    const fetchPreviousMonthData = async () => {
      // Calculate previous month's date range
      const today = new Date();
      const startOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      try {
        const response = await getTransactions({
          dateRange: {
            startDate: startOfPreviousMonth.toISOString(),
            endDate: endOfPreviousMonth.toISOString()
          }
        });

        if (response.data) {
          const previousTransactions = response.data.items;
          
          const totals = previousTransactions.reduce((acc, transaction) => ({
            income: acc.income + (transaction.type === 'INCOME' ? transaction.amount : 0),
            expenses: acc.expenses + (transaction.type === 'EXPENSE' ? transaction.amount : 0),
            net: acc.net + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount)
          }), { income: 0, expenses: 0, net: 0 });

          setPreviousMonthTotals(totals);
        }
      } catch (error) {
        console.error('Error fetching previous month data:', error);
      }
    };

    fetchPreviousMonthData();
  }, []);

  // Calculate current month totals
  const currentTotals = currentTransactions.reduce((acc, transaction) => ({
    income: acc.income + (transaction.type === 'INCOME' ? transaction.amount : 0),
    expenses: acc.expenses + (transaction.type === 'EXPENSE' ? transaction.amount : 0),
    net: acc.net + (transaction.type === 'INCOME' ? transaction.amount : -transaction.amount)
  }), { income: 0, expenses: 0, net: 0 });

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const getChangeIndicator = (change: number) => {
    return { 
      icon: change >= 0 ? ArrowUpRight : ArrowDownRight,
      className: change >= 0 ? 'text-emerald-600' : 'text-rose-600'
    };
  };

  // Calculate percentage changes
  const changes = {
    income: calculatePercentageChange(currentTotals.income, previousMonthTotals?.income || 0),
    expenses: calculatePercentageChange(currentTotals.expenses, previousMonthTotals?.expenses || 0),
    net: calculatePercentageChange(currentTotals.net, previousMonthTotals?.net || 0)
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Income Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden bg-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
            </div>
            {previousMonthTotals && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                changes.income >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
              } px-2 py-1 rounded-lg`}>
                {React.createElement(getChangeIndicator(changes.income).icon, {
                  className: "w-3 h-3"
                })}
                {Math.abs(changes.income).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentTotals.income)}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 opacity-[0.08]">
          <TrendingUp className="w-24 h-24 text-emerald-600 -rotate-12" />
        </div>
      </motion.div>

      {/* Expenses Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="relative overflow-hidden bg-white rounded-xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-400" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
            </div>
            {previousMonthTotals && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                changes.expenses <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
              } px-2 py-1 rounded-lg`}>
                {React.createElement(getChangeIndicator(-changes.expenses).icon, {
                  className: "w-3 h-3"
                })}
                {Math.abs(changes.expenses).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentTotals.expenses)}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 opacity-[0.08]">
          <TrendingUp className="w-24 h-24 text-rose-600 rotate-180 -rotate-12" />
        </div>
      </motion.div>

      {/* Net Income Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={`relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border ${
          currentTotals.net >= 0 ? 'border-indigo-100' : 'border-amber-100'
        }`}
      >
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
          currentTotals.net >= 0 
            ? 'from-indigo-500 to-indigo-400'
            : 'from-amber-500 to-amber-400'
        }`} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                currentTotals.net >= 0 ? 'bg-indigo-50' : 'bg-amber-50'
              }`}>
                <PiggyBank className={`w-5 h-5 ${
                  currentTotals.net >= 0 ? 'text-indigo-600' : 'text-amber-600'
                }`} />
              </div>
              <h3 className="text-sm font-medium text-gray-600">Net Income</h3>
            </div>
            {previousMonthTotals && (
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
                changes.net >= 0 
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-amber-600 bg-amber-50'
              }`}>
                {React.createElement(getChangeIndicator(changes.net).icon, {
                  className: "w-3 h-3"
                })}
                {Math.abs(changes.net).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(currentTotals.net)}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 opacity-[0.08]">
          <TrendingUp className={`w-24 h-24 ${
            currentTotals.net >= 0 ? 'text-indigo-600' : 'text-amber-600'
          } ${currentTotals.net >= 0 ? '' : 'rotate-180'} -rotate-12`} />
        </div>
      </motion.div>
    </div>
  );
};

export default SummaryCards;