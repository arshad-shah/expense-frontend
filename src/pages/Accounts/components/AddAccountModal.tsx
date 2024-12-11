import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { createAccount } from "../../../services/AccountService";
import { Dialog } from "@/components/Dialog"; // Adjust the path if necessary
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
import type { AccountInput } from "../../../types";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountAdded,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<AccountInput>({
    name: "",
    accountType: "CHECKING",
    bankName: "",
    balance: 0,
    currency: "USD",
    userId: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user) {
        await createAccount({
          ...formData,
          userId: user.id,
        });
        onAccountAdded();
        onClose();
        setFormData({
          name: "",
          accountType: "CHECKING",
          bankName: "",
          balance: 0,
          currency: "USD",
          userId: user.id,
        });
      }
    } catch (err) {
      setError("Failed to create account");
      console.error("Error creating account:", err);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Account Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter account name"
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <Select
            value={formData.accountType}
            onValueChange={(value) =>
              setFormData({ ...formData, accountType: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="CHECKING">Checking</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="INVESTMENT">Investment</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Bank Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bank Name
          </label>
          <Input
            type="text"
            value={formData.bankName}
            onChange={(e) =>
              setFormData({ ...formData, bankName: e.target.value })
            }
            required
            placeholder="Enter bank name"
          />
        </div>

        {/* Initial Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Initial Balance
          </label>
          <Input
            type="number"
            value={formData.balance}
            onChange={(e) =>
              setFormData({
                ...formData,
                balance: parseFloat(e.target.value),
              })
            }
            required
            placeholder="Enter initial balance"
            step="0.01"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <Select
            value={formData.currency}
            onValueChange={(value) =>
              setFormData({ ...formData, currency: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-4"
          >
            Cancel
          </Button>
          <Button type="submit" className="px-4">
            Add Account
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddAccountModal;
