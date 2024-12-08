import React, { useState } from "react";
import { DateRange, BudgetFilters, BudgetPeriod } from "@/types";
import { Filter } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/Select";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";

interface BudgetFiltersProps {
  filters: BudgetFilters;
  onFiltersChange: (filters: BudgetFilters) => void;
}

export const BudgetFiltersComponent: React.FC<BudgetFiltersProps> = ({ filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState<BudgetFilters>(filters);
  const periods: BudgetPeriod[] = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

  const handleFilterChange = (changes: Partial<BudgetFilters>) => {
    const newFilters = { ...localFilters, ...changes };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="rounded-lg bg-white shadow-md p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-teal-600" />
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
      </div>

      {/* Filters Section */}
      <div className="space-y-6">
        {/* Period Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Period</label>
          <Select
            value={localFilters.period || "ALL_PERIODS"} // Default to "ALL_PERIODS" if no value is set
            onValueChange={(value) =>
              handleFilterChange({ period: value === "ALL_PERIODS" ? undefined : (value as BudgetPeriod) })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="ALL_PERIODS">All Periods</SelectItem>
                {periods.map((period) => (
                  <SelectItem key={period} value={period}>
                    {period.charAt(0) + period.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Range</label>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <Input
              type="date"
              value={localFilters.dateRange?.startDate || ""}
              onChange={(e) =>
                handleFilterChange({
                  dateRange: { ...localFilters.dateRange, startDate: e.target.value } as DateRange,
                })
              }
            />
            <Input
              type="date"
              value={localFilters.dateRange?.endDate || ""}
              onChange={(e) =>
                handleFilterChange({
                  dateRange: { ...localFilters.dateRange, endDate: e.target.value } as DateRange,
                })
              }
            />
          </div>
        </div>

        {/* Active Budgets Filter */}
        <div className="flex items-center">
          <Checkbox
            checked={localFilters.isActive || false}
            onCheckedChange={(checked) =>
              handleFilterChange({ isActive: checked === true })
            }
            id="active-only"
          />
          <label htmlFor="active-only" className="ml-3 text-sm text-gray-700">
            Show active budgets only
          </label>
        </div>
      </div>
    </div>
  );
};
