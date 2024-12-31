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
  metadata: {},
};

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountAdded,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] =
    useState<Omit<AccountInput, "userId">>(DEFAULT_FORM_STATE);
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
        userId: user.id,
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
    setFormData((prev) => ({
      ...prev,
      accountType: value as AccountType,
      // Reset balance for credit cards
      balance: value === "CREDIT_CARD" ? 0 : prev.balance,
    }));
  };

  const handleCurrencyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      currency: value as Currency,
    }));
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Account">
      <form onSubmit={handleSubmit}>
        {/* Error Message */}
        {error && (
          <Alert variant="error" title="Error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Account Name */}
        <Input
          type="text"
          label="Account Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          placeholder="Enter account name"
          disabled={isSubmitting}
        />

        {/* Account Type */}
        <Select
          value={formData.accountType}
          onValueChange={handleAccountTypeChange}
          disabled={isSubmitting}
        >
          <SelectTrigger label="Account Type" className="w-full">
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

        {/* Bank Name */}
        <Input
          type="text"
          label="Bank Name"
          value={formData.bankName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, bankName: e.target.value }))
          }
          required
          placeholder="Enter bank name"
          disabled={isSubmitting}
        />

        {/* Initial Balance */}
        <Input
          type="number"
          label="Initial Balance"
          value={formData.balance}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              balance: parseFloat(e.target.value),
            }))
          }
          required
          placeholder="Enter initial balance"
          step="0.01"
          disabled={isSubmitting}
        />

        {/* Currency */}

        <Select
          value={formData.currency}
          onValueChange={handleCurrencyChange}
          disabled={isSubmitting}
        >
          <SelectTrigger label="Currency" className="w-full">
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
            isLoading={isSubmitting}
          >
            Add Account
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddAccountModal;
