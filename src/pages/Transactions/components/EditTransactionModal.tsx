import React, { useState, useEffect } from "react";
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
import { getAccounts } from "@/services/AccountService";
import type { 
  Transaction, 
  Account, 
  Category, 
  TransactionInput,
} from "@/types";
import { getCategories } from "@/services/userService";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onUpdate: () => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
    metadata: transaction.metadata
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const [accountsResponse, categoriesResponse] = await Promise.all([
          getAccounts(user.id),
          getCategories(user.id),
        ]);

        if (Array.isArray(accountsResponse.data)) {
          setAccounts(accountsResponse.data);
        }

        if ('data' in categoriesResponse && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load account and category data");
      }
    };
    fetchData();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);

    try {
      // Find the selected account
      const selectedAccount = accounts.find(
        (account) => account.id === formData.accountId
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
        setError(`Insufficient funds! The selected account only has ${selectedAccount.balance.toFixed(2)} available.`);
        return;
      }

      // Get the selected category
      const selectedCategory = categories.find(
        (category) => category.id === formData.categoryId
      );

      if (!selectedCategory) {
        setError("Invalid category selected.");
        return;
      }

      // Call the updated transaction service
      const response = await updateTransaction(
        user.id,
        transaction.id,
        {
          ...formData,
          // Include denormalized fields required by the new service
          accountName: selectedAccount.name,
          categoryName: selectedCategory.name
        }
      );

      if (response.status === 200) {
        onUpdate();
        onClose();
      } else {
        throw new Error(response.error || "Failed to update transaction");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      setError(error instanceof Error ? error.message : "Failed to update transaction");
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
        <div>
          <label className="block text-sm font-medium text-gray-700">Account</label>
          <Select
            value={formData.accountId}
            onValueChange={(value) => setFormData({ ...formData, accountId: value })}
          >
            <SelectTrigger className="w-full">
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
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger className="w-full">
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
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ 
              ...formData, 
              type: value as "INCOME" | "EXPENSE",
              // Reset category when type changes as they're filtered by type
              categoryId: undefined 
            })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        {/* Transaction Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <Input
            type="date"
            value={formData.transactionDate}
            onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default EditTransactionModal;