import React, { useState } from "react";
import { Dialog } from "@/components/Dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { updateTransaction } from "@/services/TransactionService";
import { useAuth } from "@/contexts/AuthContext";
import type { Transaction, Account, Category, TransactionInput } from "@/types";
import { SingleDatePicker } from "@/components/SingleDatePicker";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  categories: Category[];
  accounts: Account[];
  onUpdate: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  categories,
  accounts,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TransactionInput>>({
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description,
    transactionDate: transaction.transactionDate.split("T")[0],
    isRecurring: transaction.isRecurring,
    metadata: transaction.metadata,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Find the selected account
      const selectedAccount = accounts.find(
        (account) => account.id === formData.accountId,
      );

      if (!selectedAccount) {
        setError("Invalid account selected.");
        return;
      }

      // Check if the transaction amount exceeds the account balance
      if (
        formData.type === "EXPENSE" &&
        formData.amount &&
        formData.amount > selectedAccount.balance
      ) {
        setError(
          `Insufficient funds! The selected account only has ${selectedAccount.balance.toFixed(2)} available.`,
        );
        return;
      }

      // Get the selected category
      const selectedCategory = categories.find(
        (category) => category.id === formData.categoryId,
      );

      if (!selectedCategory) {
        setError("Invalid category selected.");
        return;
      }

      // Call the updated transaction service
      const response = await updateTransaction(user.id, transaction.id, {
        ...formData,
        // Include denormalized fields required by the new service
        accountName: selectedAccount.name,
        categoryName: selectedCategory.name,
      });

      if (response.status === 200) {
        onUpdate();
        onClose();
      } else {
        throw new Error(response.error || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update transaction",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Account Selection */}
        <Select
          value={formData.accountId}
          onValueChange={(value) =>
            setFormData({ ...formData, accountId: value })
          }
        >
          <SelectTrigger label="Account" className="w-full">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Category Selection */}
        <Select
          value={formData.categoryId}
          onValueChange={(value) =>
            setFormData({ ...formData, categoryId: value })
          }
        >
          <SelectTrigger label="Category" className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories
                .filter((category) => category.type === formData.type)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Transaction Type */}
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              type: value as "INCOME" | "EXPENSE",
              // Reset category when type changes as they're filtered by type
              categoryId: undefined,
            })
          }
        >
          <SelectTrigger label="Type" className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Amount Input */}
        <Input
          type="number"
          label="Amount"
          step="0.01"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: parseFloat(e.target.value) })
          }
          required
        />

        {/* Description Input */}
        <Input
          type="text"
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />

        {/* Transaction Date */}
        <SingleDatePicker
          label="Transaction Date"
          selectedDate={formData.transactionDate || ""}
          onChange={(date) =>
            setFormData({ ...formData, transactionDate: date })
          }
        />

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} isLoading={loading}>
            Update
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default EditTransactionModal;
