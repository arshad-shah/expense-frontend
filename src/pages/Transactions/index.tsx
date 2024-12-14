import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionFilters from './components/TransactionFilters';
import { getTransactions } from '@/services/TransactionService';
import { getAccounts } from '@/services/AccountService';
import type { 
  Transaction, 
  TransactionFilters as FilterType, 
  Account, 
  PaginatedResponse,
  ApiResponse 
} from '@/types';
import TransactionHeader from './components/TransactionHeader';
import ErrorState from '@/components/ErrorState';
import PageLoader from '@/components/PageLoader';
import Alert from '@/components/Alert';
import SummaryCards from '@/pages/Transactions/components/SummaryCards';

const DEFAULT_PAGE_SIZE = 10;

const Transactions: React.FC = () => {
  // Auth
  const { user } = useAuth();

  // State Management
  const [transactions, setTransactions] = useState<PaginatedResponse<Transaction>>({
    items: [],
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasMore: false
  });
  const [accounts, setAccounts] = useState<PaginatedResponse<Account>>({
    items: [],
    total: 0,
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    hasMore: false
  });
  const [modals, setModals] = useState({
    add: false,
    filter: false
  });
  const [loading, setLoading] = useState({
    transactions: true,
    accounts: true
  });
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterType>({
    dateRange: {
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: new Date().toISOString()
    }
  });

  // Data Fetching
  const fetchAccounts = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(prev => ({ ...prev, accounts: true }));
      const fetchedAccounts = await getAccounts(user.id);
      setAccounts(fetchedAccounts);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setLoading(prev => ({ ...prev, accounts: false }));
    }
  }, [user?.id]);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      setError(null);

      const response: ApiResponse<PaginatedResponse<Transaction>> = 
        await getTransactions(filters);;
        
      if (!response.data) {
        throw new Error('Failed to fetch transactions');
      }

      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to load transactions'
      );
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  }, [user?.id, filters]);

  // Effects
  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [fetchTransactions, fetchAccounts]);

  // Handlers
  const handleExport = () => {
    const csv = transactions.items.map(t => ({
      date: new Date(t.transactionDate).toLocaleDateString(),
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category.name,
      account: t.account.name
    }));
    
    const csvString = [
      ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account'],
      ...csv.map(row => Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `transactions-${new Date().toISOString().split('T')[0]}.csv`;

    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [user?.currency]);

  const getTotalIncome = useCallback(() => {
    return transactions.items
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions.items]);

  const getTotalExpenses = useCallback(() => {
    return transactions.items
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions.items]);

  // Modal Handlers
  const handleOpenModal = (modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: true }));
  };

  const handleCloseModal = (modal: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modal]: false }));
  };

  if (loading.transactions && loading.accounts) {
    return <PageLoader text="Loading your transactions..." />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchTransactions}
        title="Failed to load transactions"
      />
    );
  }

  const hasAccounts = accounts.total > 0;

  return (
    <div className="space-y-6 p-6">
      {/* Account Warning */}
      {!hasAccounts && (
        <Alert 
          variant="warning" 
          title="Account Required"
          className="mb-4" 
          link={{ 
            href: '/accounts', 
            label: 'Create an account' 
          }}
        >
          You need to create at least one account before adding transactions. 
          Please go to the Accounts section to create an account.
        </Alert>
      )}

      {/* Header */}
      <TransactionHeader
        onOpenFilter={() => handleOpenModal('filter')}
        onExport={handleExport}
        onAddTransaction={() => handleOpenModal('add')}
        disableAdd={!hasAccounts}
      />

      {/* Summary Cards */}
      <SummaryCards
        currentTransactions={transactions.items}
        formatCurrency={formatCurrency}
      />

      {/* Transaction List */}
      <TransactionList
        transactions={transactions.items}
        onUpdate={fetchTransactions}
      />

      {/* Modals */}
      <AddTransactionModal
        isOpen={modals.add}
        onClose={() => handleCloseModal('add')}
        onTransactionAdded={fetchTransactions}
        accounts={accounts.items}
      />

      <TransactionFilters
        isOpen={modals.filter}
        onClose={() => handleCloseModal('filter')}
        filters={filters}
        onApplyFilters={setFilters}
        accounts={accounts.items}
      />
    </div>
  );
};

export default Transactions;