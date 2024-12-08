import React, { useState } from "react";
import { User, UserInput, Currency } from "@/types";
import { Input } from "@/components/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/Select";
import { Button } from "@/components/Button";

interface ProfileFormProps {
  user: User;
  onSave: (data: UserInput) => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState<UserInput>({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    currency: user.currency,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currencies: Currency[] = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CNY"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <div className="mt-1 text-gray-900">{user.firstName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <div className="mt-1 text-gray-900">{user.lastName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 text-gray-900">{user.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <div className="mt-1 text-gray-900">{user.currency}</div>
          </div>
        </div>
        <Button onClick={() => setIsEditing(true)} variant="primary" size="md">
          Edit Profile
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <Select
            value={formData.currency}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" variant="primary" size="md" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
