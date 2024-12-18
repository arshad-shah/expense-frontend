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
import { createTransaction } from "@/services/TransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { updateAccount } from "@/services/AccountService";
import type { Account, Category, TransactionType } from "@/types";
import { getCategories } from "@/services/userService";
import Alert from "@/components/Alert";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionAdded: () => void;
  accounts: Account[];
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onTransactionAdded,
  accounts: initialAccounts,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    accountId: "",
    categoryId: "",
    amount: 0,
    type: "EXPENSE" as TransactionType,
    description: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const [fetchedCategories] = await Promise.all([
            getCategories(user.id),
          ]);
          if (fetchedCategories.data) {
            setCategories(fetchedCategories.data);
          }
          // Set default account if available
          if (initialAccounts.length > 0) {
            setFormData((prev) => ({
              ...prev,
              accountId: initialAccounts[0].id,
            }));
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Error fetching data. Please try again.");
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
      const selectedAccount = initialAccounts.find(
        (account) => account.id === formData.accountId,
      );

      if (!selectedAccount) {
        alert("Invalid account selected.");
        return;
      }

      // Check if the transaction amount exceeds the account balance
      if (
        formData.type === "EXPENSE" &&
        formData.amount > selectedAccount.balance
      ) {
        alert(
          `Insufficient funds! The selected account only has ${selectedAccount.balance.toFixed(2)} available.`,
        );
        return;
      }

      // Proceed with creating the transaction
      if (user?.id) {
        await createTransaction(user.id, {
          ...formData,
          userId: user.id,
          isRecurring: false, // or set this based on your logic
          metadata: {}, // or set this based on your logic
          categoryName:
            categories.find((category) => category.id === formData.categoryId)
              ?.name || "",
          accountName:
            initialAccounts.find((account) => account.id === formData.accountId)
              ?.name || "",
        });
      } else {
        console.error("User ID is undefined");
      }

      // make sure we remove the amount from the account balance
      if (formData.type === "EXPENSE") {
        if (user?.id) {
          await updateAccount(user.id, selectedAccount.id, {
            balance: selectedAccount.balance - formData.amount,
          });
        }
      } else {
        if (user?.id) {
          await updateAccount(user.id, selectedAccount.id, {
            balance: selectedAccount.balance + formData.amount,
          });
        } else {
          console.error("User ID is undefined");
        }
      }

      onTransactionAdded();
      onClose();

      // Reset form
      setFormData({
        accountId: initialAccounts[0]?.id || "",
        categoryId: "",
        amount: 0,
        type: "EXPENSE",
        description: "",
        transactionDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Transaction">
      {error && (
        <Alert variant="error" onDismiss={() => setError("")}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
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
              {initialAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (Balance: ${account.balance.toFixed(2)})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* Warning */}
        {formData.type === "EXPENSE" && formData.amount > 0 && (
          <p className="text-sm text-red-600 mt-1">
            {initialAccounts &&
              initialAccounts.find((acc) => acc.id === formData.accountId)
                ?.balance !== undefined &&
              initialAccounts.find((acc) => acc.id === formData.accountId)!
                .balance < formData.amount &&
              `Insufficient funds! The available balance is ${initialAccounts
                .find((acc) => acc.id === formData.accountId)!
                .balance.toFixed(2)}.`}
          </p>
        )}

        {/* Transaction Type */}
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({
              ...formData,
              type: value as TransactionType,
              categoryId: "",
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

        {/* Amount Input */}
        <Input
          type="number"
          step="0.01"
          label="Amount"
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

        {/* Date Input */}
        <Input
          type="date"
          label="Transaction Date"
          value={formData.transactionDate}
          onChange={(e) =>
            setFormData({ ...formData, transactionDate: e.target.value })
          }
          required
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} isLoading={loading}>
            Add Transaction
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddTransactionModal;
