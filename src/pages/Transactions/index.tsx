import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import TransactionList from './components/TransactionList';
import AddTransactionModal from './components/AddTransactionModal';
import TransactionFilters from './components/TransactionFilters';
import { getTransactions } from '../../services/TransactionService';
import type { Transaction, TransactionFilters as FilterType, Account, Category } from '../../types';

const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
  }, [user, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      if (user) {
        // const fetchedTransactions = await getTransactions(user.id, filters);
        // src/mocks/transactions.ts
        const mockAccounts: Account[] = [
          {
            id: '1',
            name: 'Checking Account',
            accountType: 'CHECKING',
            bankName: 'Bank of America',
            balance: 2500,
            currency: 'USD',
            isActive: true,
          },
          {
            id: '2',
            name: 'Savings Account',
            accountType: 'SAVINGS',
            bankName: 'Chase Bank',
            balance: 15000,
            currency: 'USD',
            isActive: true,
          },
        ];

        const mockCategories: Category[] = [
          {
            id: '1',
            name: 'Groceries',
            type: 'EXPENSE',
            icon: 'shopping-cart',
            color: 'green',
            isDefault: true,
            isActive: true,
          },
          {
            id: '2',
            name: 'Salary',
            type: 'INCOME',
            icon: 'money',
            color: 'blue',
            isDefault: true,
            isActive: true,
          },
          {
            id: '3',
            name: 'Utilities',
            type: 'EXPENSE',
            icon: 'lightbulb',
            color: 'yellow',
            isDefault: true,
            isActive: true,
          },
          {
            id: '4',
            name: 'Dining Out',
            type: 'EXPENSE',
            icon: 'utensils',
            color: 'red',
            isDefault: true,
            isActive: true,
          },
        ];

        const mockTransactions: Transaction[] = [
          {
            id: '1',
            account: mockAccounts[0],
            category: mockCategories[0],
            amount: 150,
            type: 'EXPENSE',
            description: 'Grocery shopping at Walmart',
            transactionDate: '2023-10-01',
            isRecurring: false,
          },
          {
            id: '2',
            account: mockAccounts[1],
            category: mockCategories[1],
            amount: 5000,
            type: 'INCOME',
            description: 'Monthly salary from Tech Corp',
            transactionDate: '2023-10-01',
            isRecurring: true,
            recurringPattern: 'MONTHLY',
          },
          {
            id: '3',
            account: mockAccounts[0],
            category: mockCategories[2],
            amount: 200,
            type: 'EXPENSE',
            description: 'Electricity bill',
            transactionDate: '2023-10-05',
            isRecurring: true,
            recurringPattern: 'MONTHLY',
          },
          {
            id: '4',
            account: mockAccounts[0],
            category: mockCategories[3],
            amount: 75,
            type: 'EXPENSE',
            description: 'Dinner at Olive Garden',
            transactionDate: '2023-10-10',
            isRecurring: false,
          },
        ];
        setTransactions(mockTransactions);
      }
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implement CSV export logic here
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
      <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your income and expenses</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="mt-2 text-2xl font-semibold text-green-600">
            ${getTotalIncome().toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            ${getTotalExpenses().toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Net Income</h3>
          <p className={`mt-2 text-2xl font-semibold ${
            getTotalIncome() - getTotalExpenses() >= 0 ? 'text-teal-600' : 'text-red-600'
          }`}>
            ${(getTotalIncome() - getTotalExpenses()).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onUpdate={fetchTransactions}
          />
        )}
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