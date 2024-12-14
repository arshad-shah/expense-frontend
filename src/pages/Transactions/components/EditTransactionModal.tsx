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
import { getCategories } from "@/services/CategoryService";
import type { Transaction, Account, Category } from "@/types";

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
  const [formData, setFormData] = useState({
    accountId: transaction.account.id,
    categoryId: transaction.category.id,
    amount: transaction.amount,
    type: transaction.type,
    description: transaction.description,
    transactionDate: transaction.transactionDate.split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [fetchedAccounts, fetchedCategories] = await Promise.all([
            getAccounts(user.id),
            getCategories(user.id),
          ]);
          setAccounts(fetchedAccounts.items);
          setCategories(fetchedCategories);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [user]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Find the selected account
    const selectedAccount = accounts.find(
      (account) => account.id === formData.accountId
    );

    if (!selectedAccount) {
      alert("Invalid account selected.");
      return;
    }

    // Check if the transaction amount exceeds the account balance
    if (formData.type === "EXPENSE" && formData.amount > selectedAccount.balance) {
      alert(
        `Insufficient funds! The selected account only has ${selectedAccount.balance.toFixed(2)} available.`
      );
      return;
    }

    // Proceed with updating the transaction
    await updateTransaction(transaction.id, {
      ...formData,
      userId: user?.id as string,
    });

    onUpdate();
    onClose();
  } catch (error) {
    console.error("Error updating transaction:", error);
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
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
            onValueChange={(value) => setFormData({ ...formData, type: value })}
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
