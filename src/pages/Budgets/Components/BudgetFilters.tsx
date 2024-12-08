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
import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Calendar, Clock, CheckCircle, RefreshCw } from "lucide-react";
import type { BudgetFilters as FilterType, BudgetPeriod } from "@/types";

interface BudgetFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterType;
  onApplyFilters: (filters: FilterType) => void;
}

export const BudgetFilters: React.FC<BudgetFiltersProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterType>(filters);
  const periods: BudgetPeriod[] = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];

  // Ensure dates are properly formatted when component mounts or filters change
  useEffect(() => {
    const initialDateRange = {
      startDate: filters.dateRange?.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      endDate: filters.dateRange?.endDate || new Date().toISOString()
    };

    setLocalFilters({
      ...filters,
      dateRange: initialDateRange
    });
  }, [filters]);

  const handleApply = () => {
    // Ensure dates are in ISO format before applying
    const formattedFilters = {
      ...localFilters,
      dateRange: {
        startDate: localFilters.dateRange?.startDate 
          ? new Date(localFilters.dateRange.startDate).toISOString()
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        endDate: localFilters.dateRange?.endDate
          ? new Date(localFilters.dateRange.endDate).toISOString()
          : new Date().toISOString()
      }
    };
    onApplyFilters(formattedFilters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: FilterType = {
      dateRange: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        endDate: new Date().toISOString(),
      },
    };
    setLocalFilters(defaultFilters);
    onApplyFilters(defaultFilters);
    onClose();
  };

  const handleDateRangeChange = (dateRange: { startDate: string; endDate: string }) => {
    try {
      // Ensure both dates are valid before updating
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      
      setLocalFilters(prev => ({
        ...prev,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      }));
    } catch (error) {
      console.error('Invalid date format:', error);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.dateRange?.startDate || localFilters.dateRange?.endDate) count++;
    if (localFilters.period) count++;
    if (localFilters.isActive) count++;
    return count;
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Filter Budgets">
      <div className="space-y-6">
        {/* Header with active filters count */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Budget Filters</h2>
            <p className="text-sm text-gray-500">
              {getActiveFiltersCount()} active filters
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>

        {/* Filters Grid */}
        <div className="grid gap-6">
          {/* Date Range Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium">Date Range</h3>
            </div>
            <DateRangePicker
              dateRange={localFilters.dateRange || {
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
                endDate: new Date().toISOString()
              }}
              onChange={handleDateRangeChange}
            />
          </div>

          {/* Period Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium">Budget Period</h3>
            </div>
            <Select
              value={localFilters.period || "ALL"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  period: value === "ALL" ? undefined : value as BudgetPeriod,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">All periods</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period.charAt(0) + period.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Status Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <h3 className="font-medium">Budget Status</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="active"
                  checked={localFilters.isActive || false}
                  onCheckedChange={(checked) =>
                    setLocalFilters({
                      ...localFilters,
                      isActive: checked as boolean,
                    })
                  }
                />
                <div className="flex flex-col">
                  <label
                    htmlFor="active"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Active Budgets Only
                  </label>
                  <p className="text-xs text-gray-500">
                    Show budgets that are currently active
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={handleApply} className="bg-indigo-600 hover:bg-indigo-700">
            Apply Filters
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default BudgetFilters;