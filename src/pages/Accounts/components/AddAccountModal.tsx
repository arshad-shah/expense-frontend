import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { createAccount } from "../../../services/AccountService";
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
import type { AccountInput, AccountType, Currency } from "../../../types";
import Alert from "@/components/Alert";
import { CURRENCY } from "@/constants";

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdded: () => void;
}

const DEFAULT_FORM_STATE: Omit<AccountInput, "userId"> = {
  name: "",
  accountType: "CHECKING",
  bankName: "",
  balance: 0,
  currency: "USD",
  metadata: {}
};

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountAdded,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<AccountInput, "userId">>(DEFAULT_FORM_STATE);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Call the AccountService createAccount method
      const response = await createAccount(user.id, {
        ...formData,
        userId: user.id
      });

      if (response.status === 201 && response.data) {
        onAccountAdded();
        onClose();
        // Reset form
        setFormData(DEFAULT_FORM_STATE);
      } else {
        setError(response.error || "Failed to create account");
      }
    } catch (err) {
      console.error("Error creating account:", err);
      setError("An unexpected error occurred while creating the account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      accountType: value as AccountType,
      // Reset balance for credit cards
      balance: value === "CREDIT_CARD" ? 0 : prev.balance
    }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      currency: value as Currency
    }));
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <Alert 
            variant="error" 
            title="Error" 
            onDismiss={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Account Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Enter account name"
            disabled={isSubmitting}
          />
        </div>

        {/* Account Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Type
          </label>
          <Select
            value={formData.accountType}
            onValueChange={handleAccountTypeChange}
            disabled={isSubmitting}
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
            onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
            required
            placeholder="Enter bank name"
            disabled={isSubmitting}
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
            onChange={(e) => setFormData(prev => ({
              ...prev,
              balance: parseFloat(e.target.value) || 0
            }))}
            required
            placeholder="Enter initial balance"
            step="0.01"
            disabled={isSubmitting || formData.accountType === "CREDIT_CARD"}
          />
          {formData.accountType === "CREDIT_CARD" && (
            <p className="mt-1 text-sm text-gray-500">
              Credit card accounts start with a zero balance
            </p>
          )}
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Currency
          </label>
          <Select
            value={formData.currency}
            onValueChange={handleCurrencyChange}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CURRENCY.map((currency) => (
                  <SelectItem key={currency.label} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
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
            disabled={isSubmitting}
            className="px-4"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Account..." : "Add Account"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddAccountModal;