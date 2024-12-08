import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Edit2, Trash2, MoreVertical } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import type { Transaction } from "@/types";
import EditTransactionModal from "./EditTransactionModal";
import { deleteTransaction } from "@/services/TransactionService";

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onUpdate }) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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

  if (transactions.length === 0) {
    return (
      <EmptyState
        heading="No Transactions Found"
        message="Start managing your finances by adding your first transaction."
      />
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(transaction.transactionDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === "INCOME" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {transaction.type === "INCOME" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    {transaction.description}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {transaction.category.name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.account.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <span
                  className={
                    transaction.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }
                >
                  {transaction.type === "INCOME" ? "+" : "-"}
                  ${Math.abs(transaction.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative inline-block text-left">
                  <button
                    onClick={() =>
                      setActiveDropdown(
                        activeDropdown === transaction.id ? null : transaction.id
                      )
                    }
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>

                  {activeDropdown === transaction.id && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setEditingTransaction(transaction);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setTransactionToDelete(transaction);
                            setActiveDropdown(null);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
