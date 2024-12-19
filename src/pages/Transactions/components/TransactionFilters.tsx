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
import { Checkbox } from "@/components/Checkbox";
import { DateRangePicker } from "@/components/DateRangePicker"; // Import the reusable DateRangePicker
import { useAuth } from "@/contexts/AuthContext";
import type {
  Account,
  Category,
  TransactionFilters as FilterType,
  TransactionType,
} from "@/types";
import { getCategories } from "@/services/userService";

interface TransactionFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterType;
  onApplyFilters: (filters: FilterType) => void;
  accounts: Account[];
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  accounts,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);

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
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterType = {
      dateRange: {
        startDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ).toISOString(),
        endDate: new Date().toISOString(),
      },
    };
    setLocalFilters(defaultFilters);
    onApplyFilters(defaultFilters);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Filter Transactions">
      <div className="space-y-4">
        {/* Date Range Filter */}
        <DateRangePicker
          label="Date Range"
          dateRange={localFilters.dateRange || { startDate: "", endDate: "" }}
          onChange={(updatedDateRange) =>
            setLocalFilters({ ...localFilters, dateRange: updatedDateRange })
          }
        />

        {/* Account Filter */}
        <Select
          value={localFilters.accountIds?.[0] || "ALL"}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              accountIds: value === "ALL" ? undefined : [value],
            })
          }
        >
          <SelectTrigger label="Account" className="w-full">
            <SelectValue placeholder="All accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">All accounts</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={localFilters.categoryIds?.[0] || "ALL"}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              categoryIds: value === "ALL" ? undefined : [value],
            })
          }
        >
          <SelectTrigger label="Category" className="w-full">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Transaction Type Filter */}
        <Select
          value={localFilters.types?.[0] || "ALL"}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              types: value === "ALL" ? undefined : [value as TransactionType],
            })
          }
        >
          <SelectTrigger label="Type" className="w-full">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ALL">All types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Amount Range Filter */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            label="Min amount"
            placeholder="Min amount"
            value={localFilters.minAmount || ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                minAmount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <Input
            type="number"
            label="Max amount"
            placeholder="Max amount"
            value={localFilters.maxAmount || ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                maxAmount: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>

        {/* Recurring Transactions */}
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="active"
              label="Recurring"
              checked={localFilters.isRecurring || false}
              onCheckedChange={(checked) =>
                setLocalFilters({
                  ...localFilters,
                  isRecurring: checked as boolean,
                })
              }
            />
            <div className="flex flex-col">
              <p className="text-xs text-gray-500">
                Show transactions that are recurring
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </div>
    </Dialog>
  );
};

export default TransactionFilters;
