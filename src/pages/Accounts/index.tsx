import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { 
  CreditCard, 
  PiggyBank, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Briefcase,
  Loader2
} from "lucide-react";
import AccountCard from "./components/AccountCard";
import AddAccountModal from "./components/AddAccountModal";
import type { Account, PaginatedResponse, Transaction } from "../../types";
import { getAccounts } from "@/services/AccountService";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/Button";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import { getTransactions } from "@/services/TransactionService";
import AccountHeader from "@/pages/Accounts/components/AccountHeader";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 9; // 3x3 grid

const Accounts: React.FC = () => {
  const { user } = useAuth();
  const [accountsData, setAccountsData] = useState<PaginatedResponse<Account>>({
    items: [],
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    hasMore: false
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchAccounts = async (page: number = 1) => {
    try {
      if (!user?.id) return;
      
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getAccounts(user.id, page, ITEMS_PER_PAGE);
      
      if (response.status === 200 && response.data) {
        if (page === 1) {
          setAccountsData(response.data);
        } else {
          setAccountsData(prev => ({
            items: [...prev.items, ...(response.data?.items || [])],
            total: response.data?.total || prev.total,
            page: response.data?.page || prev.page,
            limit: response.data?.limit || prev.limit,
            hasMore: response.data?.hasMore || prev.hasMore,
          }));
        }
      } else {
        setError(response.error || "Failed to load accounts");
      }
    } catch (err) {
      setError("Failed to load accounts");
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchTransactions = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch last 2 months of transactions
      const now = new Date();
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      
      const response = await getTransactions(user.id, {
        dateRange: {
          startDate: startOfLastMonth.toISOString(),
          endDate: now.toISOString()
        }
      });
      
      if (response.status === 200 && response.data) {
        setTransactions(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAccounts();
      fetchTransactions();
    }
  }, [user?.id]);

  const handleLoadMore = () => {
    if (accountsData.hasMore) {
      fetchAccounts(accountsData.page + 1);
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.preferences?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalBalance = () => {
    const totalBalance = accountsData.items.reduce((sum, account) => sum + account.balance, 0);
    return formatCurrency(totalBalance);
  };

  if (loading) {
    return <PageLoader text="Loading your accounts..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load accounts" onRetry={() => fetchAccounts()} />;
  }

  return (
    <div className="space-y-6 p-2">
      <AccountHeader onAddAccount={() => setIsAddModalOpen(true)} />

      {/* Total Balance Card */}
      {accountsData.items.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl shadow-lg overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500" />
          
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-transparent to-cyan-500/50 opacity-30" />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 blur-xl opacity-20" />
          
          {/* Content */}
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-medium">Total Balance</h2>
            </div>
            
            <p className="text-3xl font-bold tracking-tight">
              {getTotalBalance()}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm opacity-75">
                Across {accountsData.total} account{accountsData.total !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Accounts Grid or Empty State */}
      {accountsData.items.length === 0 ? (
        <EmptyState
          heading="No Accounts Found"
          message="Start managing your finances by adding your first account."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accountsData.items.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                icon={getAccountTypeIcon(account.accountType)}
                onUpdate={() => fetchAccounts(1)}
                transactions={transactions.filter(t => t.accountId === account.id)}
              />
            ))}
          </div>
          
          {/* Load More Button */}
          {accountsData.hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Accounts'
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAccountAdded={() => fetchAccounts()}
      />
    </div>
  );
};

export default Accounts;