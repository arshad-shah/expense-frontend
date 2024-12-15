import React, { useState } from "react";
import { MoreVertical, Edit2, Trash2, ExternalLink, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Account, Transaction } from "@/types";
import EditAccountModal from "./EditAccountModal";
import { deleteAccount } from "@/services/AccountService";
import { Button } from "@/components/Button";
import { Dropdown, DropdownItemType } from "@/components/Dropdown";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import Alert from "@/components/Alert";
import { motion } from "framer-motion";
import { cn, formatCurrency, formatDate, parseTimestamp } from "@/lib/utils";
import AccountDetailsModal from "@/pages/Accounts/components/AccountDetails";
import { useAuth } from "@/contexts/AuthContext";

interface AccountCardProps {
  account: Account;
  icon: React.FC<{ className?: string }>;
  onUpdate: () => void;
  transactions: Transaction[];
}

const getAccountTypeStyles = (type: string): { 
  gradient: string;
  iconBg: string;
  iconColor: string;
  accent: string;
} => {
  switch (type.toUpperCase()) {
    case 'CHECKING':
      return {
        gradient: 'from-blue-50 to-indigo-50',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        accent: 'bg-blue-600'
      };
    case 'SAVINGS':
      return {
        gradient: 'from-emerald-50 to-teal-50',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        accent: 'bg-emerald-600'
      };
    case 'CREDIT_CARD':
      return {
        gradient: 'from-purple-50 to-pink-50',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        accent: 'bg-purple-600'
      };
    case 'INVESTMENT':
      return {
        gradient: 'from-amber-50 to-orange-50',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        accent: 'bg-amber-600'
      };
    default:
      return {
        gradient: 'from-gray-50 to-slate-50',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        accent: 'bg-gray-600'
      };
  }
};

const AccountCard: React.FC<AccountCardProps> = ({ account, icon: Icon, onUpdate, transactions }) => {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const styles = getAccountTypeStyles(account.accountType);

  const handleDelete = async () => {
    if (!user?.id) return;
    
    try {
      const response = await deleteAccount(user.id, account.id);
      
      if (response.status === 200) {
        onUpdate();
      } else {
        setDeleteError(response.error || "Failed to delete account");
      }
    } catch (error) {
      setDeleteError("An unexpected error occurred");
      console.error("Error deleting account:", error);
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const dropdownItems: DropdownItemType[] = [
    {
      icon: Edit2,
      label: "Edit Account",
      onClick: () => {
        setShowDropdown(false);
        setShowEditModal(true);
      },
    },
    {
      icon: ExternalLink,
      label: "View Details",
      onClick: () => {
        setShowDropdown(false);
        setIsDetailsOpen(true);
      },
    },
    {
      icon: Trash2,
      label: "Delete Account",
      onClick: () => {
        setShowDropdown(false);
        setShowDeleteDialog(true);
      },
      variant: "danger",
    }
  ];
// Usage in your component
const lastSyncDate = account.stats?.lastSync 
  ? parseTimestamp(account.stats.lastSync)
  : new Date();

  // Calculate the monthly change from transactions
  const calculateMonthlyChange = (): { isPositive: boolean; percentage: number } => {
    // Get start of current and previous month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Filter transactions for current and previous month
    const currentMonthTransactions = transactions.filter(t => 
      new Date(t.transactionDate) >= startOfMonth
    );
    const lastMonthTransactions = transactions.filter(t => 
      new Date(t.transactionDate) >= startOfLastMonth &&
      new Date(t.transactionDate) <= endOfLastMonth
    );

    // Calculate net change for each month
    const calculateNetChange = (txns: Transaction[]): number => 
      txns.reduce((sum, t) => {
        const amount = t.amount;
        return t.type === 'INCOME' ? sum + amount : sum - amount;
      }, 0);

    const currentMonthChange = calculateNetChange(currentMonthTransactions);
    const lastMonthChange = calculateNetChange(lastMonthTransactions);
    
    // Calculate percentage change
    const percentageChange = lastMonthChange !== 0 
      ? ((currentMonthChange - lastMonthChange) / Math.abs(lastMonthChange)) * 100 
      : currentMonthChange > 0 ? 100 : 0;
    
    return {
      isPositive: percentageChange >= 0,
      percentage: Math.abs(Number(percentageChange.toFixed(1)))
    };
  };

  const { isPositive: isPositiveChange, percentage: changePercentage } = calculateMonthlyChange();

  return (
    <>
      <motion.div
        className={cn(
          "relative rounded-xl shadow-sm transition-all duration-300",
          "bg-gradient-to-br",
          styles.gradient,
          isHovered && "shadow-lg shadow-gray-100/50"
        )}
        whileHover={{ scale: 1.01 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Accent Line */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1 rounded-t-xl",
            styles.accent
          )} 
        />

        {deleteError && (
          <Alert
            title="Failed to delete account"
            variant="error"
            actions={[
              {
                label: "Retry",
                onClick: handleDelete,
                variant: "primary",
              },
              {
                label: "Dismiss",
                onClick: () => setDeleteError(""),
                variant: "secondary",
              }
            ]}
            className="rounded-t-xl"
          >
            {deleteError}
          </Alert>
        )}
        
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={cn(
                "p-2.5 rounded-xl",
                styles.iconBg,
                "transition-transform duration-300",
                isHovered && "scale-110"
              )}>
                <Icon className={cn("h-6 w-6", styles.iconColor)} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  {account.bankName}
                  <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
                  <span className="capitalize">{account.accountType.toLowerCase().replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            {/* Actions Dropdown */}
            <div className="relative">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                aria-label="Account options"
                size="icon"
                variant="ghost"
                className={cn(
                  "hover:bg-white/50",
                  isHovered && "opacity-100",
                  !isHovered && "opacity-0"
                )}
              >
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
              
              <Dropdown
                show={showDropdown}
                onClose={() => setShowDropdown(false)}
                items={dropdownItems}
                position="right"
                size="md"
                width="md"
                className="shadow-xl shadow-gray-200/20"
              />
            </div>
          </div>
          
          {/* Balance Section */}
          <div className="mt-6 space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">
                  {formatCurrency(account.balance, account.currency)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    isPositiveChange ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"
                  )}>
                    {isPositiveChange ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {changePercentage}%
                  </div>
                  <span className="text-sm text-gray-500">this month</span>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="w-24 h-12 flex items-end">
                <div className="relative w-full h-full">
                  <TrendingUp 
                    className={cn(
                      "w-full h-full stroke-[1.5]",
                      isPositiveChange ? "text-emerald-500" : "text-red-500",
                      "opacity-25"
                    )} 
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <span>Last updated:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(lastSyncDate.toISOString())}
                </span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {showEditModal && (<EditAccountModal
        isOpen={true}
        onClose={() => setShowEditModal(false)}
        account={account}
        onSave={onUpdate}
      />)}

      {showDeleteDialog && (<DeleteConfirmationDialog 
        isOpen={true} 
        onClose={() => setShowDeleteDialog(false)} 
        onConfirm={handleDelete} 
        entityName={account.name}
        description="All associated transactions will be archived. This action cannot be undone."
      />)}

      {isDetailsOpen && (<AccountDetailsModal
        isOpen={true}
        onClose={() => setIsDetailsOpen(false)}
        account={account}
        transactions={transactions}
      />)}
    </>
  );
};

export default AccountCard;