import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionFilters from './components/TransactionFilters';
import { getTransactions } from '../../services/TransactionService';
import { getAccounts } from '../../services/AccountService';
import type { Transaction, TransactionFilters as FilterType, Account } from '../../types';
import TransactionHeader from './components/TransactionHeader';
import ErrorState from '@/components/ErrorState';
import PageLoader from '@/components/PageLoader';
import Alert from '@/components/Alert';

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterType>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date().toISOString()
    }
  });

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [user, filters]);

  const fetchAccounts = async () => {
    try {
      if (user) {
        const fetchedAccounts = await getAccounts(user.id);
        setAccounts(fetchedAccounts);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      if (user) {
        const fetchedTransactions = await getTransactions(filters);
        setTransactions(fetchedTransactions);
      }
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = transactions.map(t => ({
      date: t.transactionDate,
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category.name,
      account: t.account.name
    }));
    
    const csvString = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account'],
      ...csv.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (error) {
    return (
      <ErrorState
        message="Failed to load transactions"
        onRetry={fetchTransactions}
      />
    );
  }

  if (loading) {
    return <PageLoader text="Loading your transactions..." />;
  }

  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-6 p-6">
      {!hasAccounts && (
        <Alert variant="warning" className="mb-4" link={{ href: '/accounts', label: 'Create an account' }}>
          You need to create at least one account before adding transactions. Please go to the Accounts section to create an account.
        </Alert>

      )}

      <TransactionHeader
        onOpenFilter={() => setIsFilterOpen(true)}
        onExport={handleExport}
        onAddTransaction={() => setIsAddModalOpen(true)}
        disableAdd={!hasAccounts}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="mt-2 text-2xl font-semibold text-green-600">
            {formatCurrency(getTotalIncome())}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {formatCurrency(getTotalExpenses())}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Net Income</h3>
          <p className={`mt-2 text-2xl font-semibold ${
            getTotalIncome() - getTotalExpenses() >= 0 ? 'text-teal-600' : 'text-red-600'
          }`}>
            {formatCurrency(getTotalIncome() - getTotalExpenses())}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-sm">
        <TransactionList
          transactions={transactions}
          onUpdate={fetchTransactions}
        />
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTransactionAdded={fetchTransactions}
      />

      <TransactionFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </div>
  );
};

export default Transactions;