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
import { Account, AccountInput, AccountType } from "@/types";
import { updateAccount } from "@/services/AccountService";
import { CURRENCY } from "@/constants";
import Alert from "@/components/Alert";
import { useAuth } from "@/contexts/AuthContext";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSave: () => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSave,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<AccountInput, "userId">>({
    name: "",
    accountType: "CHECKING",
    bankName: "",
    balance: 0,
    currency: "USD",
    metadata: {},
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        accountType: account.accountType,
        bankName: account.bankName,
        balance: account.balance,
        currency: account.currency,
        metadata: account.metadata || {},
      });
    }
  }, [account]);

  const handleInputChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "balance" ? parseFloat(value as string) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !user?.id) return;

    setError("");
    setLoading(true);

    try {
      const response = await updateAccount(user.id, account.id, formData);

      if (response.status === 200) {
        onSave();
        onClose();
      } else {
        setError(response.error || "Failed to save account changes.");
      }
    } catch (err) {
      console.error("Error updating account:", err);
      setError("An unexpected error occurred while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountTypeChange = (value: string) => {
    // Reset balance for credit cards
    setFormData((prev) => ({
      ...prev,
      accountType: value as AccountType,
      balance: value === "CREDIT_CARD" ? 0 : prev.balance,
    }));
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <Alert variant="error" title="Error" onDismiss={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Account Name */}
        <div>
          <Input
            type="text"
            label="Account Name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            placeholder="Enter account name"
            disabled={loading}
          />
        </div>

        {/* Account Type */}

        <Select
          value={formData.accountType}
          onValueChange={handleAccountTypeChange}
          disabled={loading}
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
          onChange={(e) => handleInputChange("bankName", e.target.value)}
          required
          placeholder="Enter bank name"
          disabled={loading}
        />

        {/* Balance and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Balance"
            value={formData.balance}
            onChange={(e) => handleInputChange("balance", e.target.value)}
            step="0.01"
            required
            placeholder="Enter balance"
            disabled={loading || formData.accountType === "CREDIT_CARD"}
          />
          {formData.accountType === "CREDIT_CARD" && (
            <p className="mt-1 text-sm text-gray-500">
              Credit card accounts have a zero base balance
            </p>
          )}

          <Select
            value={formData.currency}
            onValueChange={(value) => handleInputChange("currency", value)}
            disabled={loading}
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
        </div>

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
          <Button type="submit" disabled={loading}>
            {loading ? <>Saving...</> : <>Save</>}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default EditAccountModal;
