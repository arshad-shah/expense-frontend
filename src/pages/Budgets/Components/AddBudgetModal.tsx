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
import { createBudget } from "@/services/BudgetService";
import { useAuth } from "@/contexts/AuthContext";
import type { BudgetCategoryAllocation, Category } from "@/types";
import { BudgetPeriod } from "@/types";
import { DollarSign } from "lucide-react";
import { getCategories } from "@/services/userService";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/Progressbar";
import Alert from "@/components/Alert";
import DateRangePicker from "@/components/DateRangePicker";

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetAdded: () => void;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  onBudgetAdded,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    period: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    categoryAllocations: [] as { categoryId: string; amount: number }[],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      if (user) {
        const fetchedCategories = await getCategories(user.id);
        if (fetchedCategories.data) {
          setCategories(
            fetchedCategories.data.filter((cat) => cat.type === "EXPENSE"),
          );
        }
      }
    };
    fetchCategories();
  }, [user]);

  // Calculate end date based on period
  const calculateEndDate = (startDate: string, period: string): string => {
    const start = new Date(startDate);
    let end: Date;

    switch (period) {
      case "DAILY":
        end = new Date(start);
        end.setDate(start.getDate() + 1);
        break;
      case "WEEKLY":
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;
      case "MONTHLY":
        end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        break;
      case "YEARLY":
        end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);
        break;
      default:
        end = new Date(start);
    }

    return end.toISOString().split("T")[0];
  };

  const totalAllocated = formData.categoryAllocations.reduce(
    (sum, alloc) => sum + alloc.amount,
    0,
  );
  const remainingAmount = formData.amount - totalAllocated;
  const allocationPercentage =
    formData.amount > 0
      ? ((totalAllocated / formData.amount) * 100).toFixed(1)
      : 0;

  const handleCategoryAllocation = (categoryId: string, newAmount: number) => {
    if (newAmount < 0) {
      setError("Cannot allocate negative amounts");
      return;
    }

    const currentAllocation =
      formData.categoryAllocations.find(
        (alloc) => alloc.categoryId === categoryId,
      )?.amount || 0;

    const potentialTotal = totalAllocated - currentAllocation + newAmount;

    if (potentialTotal > formData.amount) {
      setError(
        `Cannot exceed total budget of ${formatCurrency(formData.amount, user?.preferences.currency || "USD")}`,
      );
      return;
    }

    setError(null);
    setFormData((prev) => {
      const updatedAllocations = prev.categoryAllocations.filter(
        (alloc) => alloc.categoryId !== categoryId,
      );
      if (newAmount > 0) {
        updatedAllocations.push({ categoryId, amount: newAmount });
      }
      return { ...prev, categoryAllocations: updatedAllocations };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.amount <= 0) {
      setError("Budget amount must be greater than 0");
      return;
    }

    if (totalAllocated !== formData.amount) {
      setError("Please allocate the entire budget amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const categoriesAllocated = formData.categoryAllocations.reduce(
        (acc, alloc) => {
          const category = categories.find(
            (cat) => cat.id === alloc.categoryId,
          );
          if (category) {
            acc[category.name] = {
              categoryId: alloc.categoryId,
              amount: alloc.amount,
              spent: 0,
              remaining: alloc.amount,
              status: "ON_TRACK",
            };
          }
          return acc;
        },
        {} as Record<string, BudgetCategoryAllocation>,
      );

      await createBudget(
        user.id,
        {
          ...formData,
          userId: user.id,
          rollover: true,
          period: formData.period as BudgetPeriod,
          endDate: dateRange.endDate
            ? dateRange.endDate
            : calculateEndDate(formData.startDate, formData.period),
          categoryAllocations: formData.categoryAllocations,
          startDate: dateRange.startDate,
        },
        categoriesAllocated,
      );

      onBudgetAdded();
      onClose();
    } catch (error) {
      console.error("Error creating budget:", error);
      setError("Failed to create budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Budget">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}

        {/* Main Budget Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 md:p-6 space-y-4">
          {/* Form Fields */}
          <div className="space-y-4">
            <Input
              type="text"
              label="Budget Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full"
              placeholder="e.g., Monthly Expenses"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.01"
                label="Budget Amount"
                icon={<DollarSign className="h-5 w-5 text-gray-400" />}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value),
                  })
                }
                required
                placeholder="0.00"
              />

              <div className="space-y-1">
                <Select
                  value={formData.period}
                  onValueChange={(value) =>
                    setFormData({ ...formData, period: value })
                  }
                >
                  <SelectTrigger label="Period" className="w-full">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DateRangePicker
              dateRange={dateRange}
              onChange={({ startDate, endDate }) =>
                setDateRange((prev) => ({
                  ...prev,
                  startDate: startDate,
                  endDate: endDate,
                }))
              }
            />
          </div>
        </div>

        {/* Category Allocations */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-xl border-b border-teal-200" />

          <div className="max-h-48 sm:max-h-64 overflow-y-auto p-4 space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800">
                  {category.name}
                </span>
                <div className="relative w-32">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.amount}
                    value={
                      formData.categoryAllocations.find(
                        (alloc) => alloc.categoryId === category.id,
                      )?.amount || ""
                    }
                    placeholder="0.00"
                    className="w-full pl-8 text-right"
                    onChange={(e) =>
                      handleCategoryAllocation(
                        category.id,
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Allocation Progress */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100 rounded-b-xl">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-teal-900">
                  Allocation Progress
                </span>
              </div>

              <ProgressBar
                value={Number(allocationPercentage)}
                variant={
                  Number(allocationPercentage) === 100 ? "success" : "info"
                }
                showPercentage
                animated={Number(allocationPercentage) < 100}
                size="md"
              />

              <div className="flex justify-between text-sm">
                <span className="text-teal-700">
                  Allocated:{" "}
                  {formatCurrency(
                    totalAllocated,
                    user?.preferences.currency || "USD",
                  )}
                </span>
                <span className="text-teal-700">
                  Remaining:{" "}
                  {formatCurrency(
                    Math.abs(remainingAmount),
                    user?.preferences.currency || "USD",
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || remainingAmount !== 0}
            isLoading={loading}
          >
            Create Budget
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddBudgetModal;
