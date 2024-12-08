import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  Plus, 
  CreditCard, 
  PiggyBank, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Briefcase,
  Download,
  FileText
} from "lucide-react";
import AccountCard from "./components/AccountCard";
import AddAccountModal from "./components/AddAccountModal";
import type { Account } from "../../types";
import { getAccounts } from "@/services/AccountService";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/Button";

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
        const fetchedAccounts = await getAccounts(user.id);
        setAccounts(fetchedAccounts);
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
        return AlertCircle;
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
      <div className="space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            Accounts
          </h1>
          <p className="mt-1 text-sm text-gray-500 hidden sm:block">
            Manage your financial accounts
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Mobile view: Action buttons in a grid */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            <Button
              variant="info"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full col-span-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>

          {/* Desktop view: Action buttons in a row */}
          <div className="hidden sm:flex sm:items-center sm:space-x-3">
            <Button
              variant="info"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Account
            </Button>
          </div>
        </div>
      </div>

      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
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