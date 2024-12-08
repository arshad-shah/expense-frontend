import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, CreditCard, PiggyBank, DollarSign, TrendingUp, AlertCircle, Briefcase } from "lucide-react";
import AccountCard from "./components/AccountCard";
import AddAccountModal from "./components/AddAccountModal";
import type { Account } from "../../types";
import { getAccounts } from "@/services/AccountService";
import EmptyState from "@/components/EmptyState";

const Accounts: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      if (user) {
        // const fetchedAccounts = await getAccounts(user.id);
        const mockedAccounts: Account[] = [
          {
            id: "1",
            name: "Main Checking",
            accountType: "CHECKING",
            bankName: "Bank of America",
            balance: 1500.0,
            currency: "USD",
            isActive: true,
            lastSync: new Date().toISOString(),
            transactions: [],
          },
          {
            id: "2",
            name: "Savings Account",
            accountType: "SAVINGS",
            bankName: "Chase",
            balance: 3000.0,
            currency: "USD",
            isActive: true,
            lastSync: new Date().toISOString(),
            transactions: [],
          },
          {
            id: "3",
            name: "Credit Card",
            accountType: "CREDIT_CARD",
            bankName: "Citi",
            balance: -500.0,
            currency: "USD",
            isActive: true,
            lastSync: new Date().toISOString(),
            transactions: [],
          },
        ];

        setAccounts(mockedAccounts);
        // setAccounts(fetchedAccounts);
      }
    } catch (err) {
      setError("Failed to load accounts");
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case "CHECKING":
        return Briefcase;
      case "SAVINGS":
        return PiggyBank;
      case "CREDIT_CARD":
        return CreditCard;
      case "CASH":
        return DollarSign;
      case "INVESTMENT":
        return TrendingUp;
      default:
        return AlertCircle; // Fallback icon for unknown types
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600">Manage your financial accounts</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-lg font-medium opacity-90">Total Balance</h2>
          <p className="text-3xl font-bold mt-2">
            ${getTotalBalance().toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm opacity-75 mt-1">
            Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Accounts Grid or Empty State */}
      {accounts.length === 0 ? (
        <EmptyState
          heading="No Accounts Found"
          message="Start managing your finances by adding your first account."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              icon={getAccountTypeIcon(account.accountType)}
              onUpdate={fetchAccounts}
            />
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAccountAdded={fetchAccounts}
      />
    </div>
  );
};

export default Accounts;
