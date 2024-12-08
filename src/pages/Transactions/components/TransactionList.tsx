import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Edit2, Trash2, MoreVertical, ChevronDown } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import type { Transaction } from "@/types";
import EditTransactionModal from "./EditTransactionModal";
import { deleteTransaction } from "@/services/TransactionService";
import { Dropdown, type DropdownItemType } from "@/components/Dropdown";
import { Button } from "@/components/Button";

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onUpdate }) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const handleDelete = async () => {
    if (transactionToDelete) {
      try {
        await deleteTransaction(transactionToDelete.id);
        onUpdate();
      } catch (error) {
        console.error("Error deleting transaction:", error);
      } finally {
        setTransactionToDelete(null);
      }
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
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const getDropdownItems = (transaction: Transaction): DropdownItemType[] => [
    {
      icon: Edit2,
      label: "Edit",
      onClick: () => {
        setEditingTransaction(transaction);
        setActiveDropdown(null);
      }
    },
    {
      icon: Trash2,
      label: "Delete",
      onClick: () => {
        setTransactionToDelete(transaction);
        setActiveDropdown(null);
      },
      variant: "danger"
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
    <div className="relative inline-block text-left">

      <Button
        onClick={(e) => {
          e.stopPropagation();
          setActiveDropdown(activeDropdown === transaction.id ? null : transaction.id);
        }}
        aria-label="Account options"
        size="icon"
        variant="ghost"
        className="hover:bg-gray-100"
      >
        <MoreVertical className="h-5 w-5 text-gray-500" />
      </Button>

      <Dropdown
        show={activeDropdown === transaction.id}
        onClose={() => setActiveDropdown(null)}
        items={getDropdownItems(transaction)}
        position="right"
        size="sm"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
              <tr 
                key={transaction.id} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(transaction.transactionDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        transaction.type === "INCOME" 
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {transaction.description}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${transaction.category.color}15`,
                      color: transaction.category.color
                    }}
                  >
                    {transaction.category.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {transaction.account.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span
                    className={`text-sm font-medium ${
                      transaction.type === "INCOME" 
                        ? "text-emerald-600" 
                        : "text-rose-600"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatAmount(transaction.amount, transaction.account.currency)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <ActionMenu transaction={transaction} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transition-colors duration-150">
            <button
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50"
              onClick={() => setExpandedTransaction(
                expandedTransaction === transaction.id ? null : transaction.id
              )}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    transaction.type === "INCOME" 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {transaction.type === "INCOME" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(transaction.transactionDate)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-sm font-medium ${
                    transaction.type === "INCOME" 
                      ? "text-emerald-600" 
                      : "text-rose-600"
                  }`}
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  {formatAmount(transaction.amount, transaction.account.currency)}
                </span>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    expandedTransaction === transaction.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {expandedTransaction === transaction.id && (
              <div className="px-4 py-3 bg-gray-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Category</span>
                  <span 
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${transaction.category.color}15`,
                      color: transaction.category.color
                    }}
                  >
                    {transaction.category.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account</span>
                  <span className="text-sm text-gray-900">{transaction.account.name}</span>
                </div>
                <div className="flex justify-end pt-2">
                  <ActionMenu transaction={transaction} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingTransaction && (
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          onUpdate={onUpdate}
        />
      )}

      {transactionToDelete && (
        <DeleteConfirmationDialog
          isOpen={!!transactionToDelete}
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