import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Dialog } from "@/components/Dialog"; // Adjust path as needed
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
import { Account, AccountInput, AccountType, Currency } from "@/types";
import { updateAccount } from "@/services/AccountService";
import { CURRENCY } from "@/constants";

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
  const [formData, setFormData] = useState<Omit<AccountInput, "userId">>({
    name: "",
    accountType: "CHECKING",
    bankName: "",
    balance: 0,
    currency: "USD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const accountTypes: AccountType[] = [
    "CHECKING",
    "SAVINGS",
    "CREDIT_CARD",
    "CASH",
    "INVESTMENT",
  ];

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        accountType: account.accountType as AccountType,
        bankName: account.bankName,
        balance: account.balance,
        currency: account.currency as Currency,
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
    if (!account) return;

    try {
      setError("");
      setLoading(true);
      await updateAccount(account.id, { ...formData });
      onSave();
      onClose();
    } catch (err) {
      setError("Failed to save account changes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Account">
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
            onChange={(e) => handleInputChange("name", e.target.value)}
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
            onValueChange={(value) => handleInputChange("accountType", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {accountTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace("_", " ")}
                  </SelectItem>
                ))}
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
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            required
            placeholder="Enter bank name"
          />
        </div>

        {/* Balance and Currency */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Balance
            </label>
            <Input
              type="number"
              value={formData.balance}
              onChange={(e) => handleInputChange("balance", e.target.value)}
              step="0.01"
              required
              placeholder="Enter balance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange("currency", value)}
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
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default EditAccountModal;
