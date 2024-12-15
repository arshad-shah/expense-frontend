import React, { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  ChevronDown,
  PiggyBank as Bank,
  Calendar,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "@/components/EmptyState";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import type {Transaction } from "@/types";
import EditTransactionModal from "./EditTransactionModal";
import { deleteTransaction } from "@/services/TransactionService";
import { Dropdown, type DropdownItemType } from "@/components/Dropdown";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import type { Category } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onUpdate: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories,  onUpdate }) => {
  const getCategory = (categoryId: string) => 
    categories.find(category => category.id === categoryId);
  const { user } = useAuth();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user?.id || !transactionToDelete) return;

    try {
      const response = await deleteTransaction(
        user.id,
        transactionToDelete.accountId,
        transactionToDelete.id
      );

      if (response.status === 200) {
        onUpdate();
      } else {
        throw new Error(response.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      // Here you might want to show an error toast or message
    } finally {
      setTransactionToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getDropdownItems = (transaction: Transaction): DropdownItemType[] => [
    {
      icon: Edit2,
      label: "Edit Transaction",
      onClick: () => {
        setEditingTransaction(transaction);
        setActiveDropdown(null);
      },
    },
    {
      icon: Trash2,
      label: "Delete Transaction",
      onClick: () => {
        setTransactionToDelete(transaction);
        setActiveDropdown(null);
      },
      variant: "danger",
    }
  ];

  if (transactions.length === 0) {
    return (
      <EmptyState
        heading="No Transactions Found"
        message="Start managing your finances by adding your first transaction."
      />
    );
  }

  const ActionMenu = ({ transaction }: { transaction: Transaction }) => (
    <div className="relative">
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setActiveDropdown(activeDropdown === transaction.id ? null : transaction.id);
        }}
        aria-label="Transaction options"
        size="icon"
        variant="ghost"
        className="hover:bg-gray-100"
      >
        <MoreVertical className="h-5 w-5 text-gray-500" />
      </Button>

      <div className="absolute right-0 top-0 z-[100]">
        <Dropdown
          show={activeDropdown === transaction.id}
          onClose={() => setActiveDropdown(null)}
          items={getDropdownItems(transaction)}
          position="right"
          size="sm"
          width="md"
          className="shadow-lg shadow-gray-200/20"
        />
      </div>
    </div>
  );

  const TransactionTypeIcon = ({ type }: { type: string }) => (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-xl",
        type === "INCOME" 
          ? "bg-emerald-50 text-emerald-600" 
          : "bg-rose-50 text-rose-600"
      )}
    >
      {type === "INCOME" ? (
        <ArrowUpRight className="h-5 w-5" />
      ) : (
        <ArrowDownRight className="h-5 w-5" />
      )}
    </motion.div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto overflow-y-visible">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-white">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <motion.tr 
                key={transaction.id}
                onHoverStart={() => setHoveredRow(transaction.id)}
                onHoverEnd={() => setHoveredRow(null)}
                className={cn(
                  "transition-colors duration-150",
                  hoveredRow === transaction.id ? "bg-gray-50" : "hover:bg-gray-50"
                )}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {formatDate(transaction.transactionDate)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <TransactionTypeIcon type={transaction.type} />
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {transaction.description}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                      "transition-opacity duration-150",
                      "shadow-sm",
                      hoveredRow === transaction.id ? "opacity-100" : "opacity-90"
                    )}
                    style={{
                      backgroundColor: `${getCategory(transaction.categoryId)?.color || '#6B7280'}15`,
                      color: getCategory(transaction.categoryId)?.color || '#6B7280'
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    {transaction.categoryName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Bank className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {transaction.accountName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span
                    className={cn(
                      "text-sm font-medium px-3 py-1 rounded-lg",
                      transaction.type === "INCOME" 
                        ? "text-emerald-700 bg-emerald-50" 
                        : "text-rose-700 bg-rose-50"
                    )}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatAmount(transaction.amount, user?.preferences?.currency || 'USD')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right relative">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredRow === transaction.id ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ActionMenu transaction={transaction} />
                  </motion.div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id}>
            <motion.button
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50/80"
              onClick={() => setExpandedTransaction(
                expandedTransaction === transaction.id ? null : transaction.id
              )}
              initial={false}
            >
              <div className="flex items-center space-x-3">
                <TransactionTypeIcon type={transaction.type} />
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(transaction.transactionDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={cn(
                    "text-sm font-medium px-2.5 py-1 rounded-lg",
                    transaction.type === "INCOME" 
                      ? "text-emerald-700 bg-emerald-50" 
                      : "text-rose-700 bg-rose-50"
                  )}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatAmount(transaction.amount, user?.preferences?.currency || 'USD')}
                </span>
                <motion.div
                  animate={{ rotate: expandedTransaction === transaction.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </motion.div>
              </div>
            </motion.button>

            <AnimatePresence>
              {expandedTransaction === transaction.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-3 bg-gray-50/50 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-400" />
                        Category
                      </span>
                      <span 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategory(transaction.categoryId)?.color || '#6B7280'}15`,
                          color: getCategory(transaction.categoryId)?.color || '#6B7280'
                        }}
                      >
                        {transaction.categoryName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center gap-2">
                        <Bank className="w-4 h-4 text-gray-400" />
                        Account
                      </span>
                      <span className="text-sm text-gray-900">{transaction.accountName}</span>
                    </div>
                    <div className="flex justify-end pt-2 relative">
                      <ActionMenu transaction={transaction} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {editingTransaction && (
        <EditTransactionModal
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          onUpdate={onUpdate}
        />
      )}

      {transactionToDelete && (
        <DeleteConfirmationDialog
          isOpen={true}
          onClose={() => setTransactionToDelete(null)}
          onConfirm={handleDelete}
          entityName={transactionToDelete.description}
          description="This action will permanently delete the transaction."
        />
      )}
    </div>
  );
};

export default TransactionList;