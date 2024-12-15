import React, { useEffect, useState } from "react";
import { Dialog } from "@/components/Dialog";
import { Input } from "@/components/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { Button } from "@/components/Button";
import { updateBudget } from "@/services/BudgetService";
import { useAuth } from "@/contexts/AuthContext";
import type { Budget, BudgetPeriod, Category } from "@/types";
import { DollarSign, Save, AlertCircle } from "lucide-react";
import { getCategories } from "@/services/userService";
import { formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/Progressbar";
import Alert from "@/components/Alert";

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  onSave: () => void;
}

const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSave,
}) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    period: "MONTHLY",
    startDate: "",
    endDate: "",
    categoryAllocations: [] as {
      categoryId: string;
      allocatedAmount: number;
    }[],
    categories: [],
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount,
        period: budget.period,
        startDate: budget.startDate.split("T")[0],
        endDate: budget.endDate.split("T")[0],
        categoryAllocations: budget.categoryAllocations.map((alloc) => ({
          categoryId: alloc.categoryId,
          allocatedAmount: alloc.amount,
        })),
        // @ts-expect-error - Type mismatch in categories
        categories: budget.categories,
      });
    }

    const fetchCategories = async () => {
      if (user) {
        const fetchedCategories = await getCategories(user.id);
        if (fetchedCategories.data) {
          fetchedCategories.data = fetchedCategories.data.filter(
            (category) => category.type === "EXPENSE",
          );
          setCategories(fetchedCategories.data);
        }
      }
    };

    fetchCategories();
  }, [budget, user]);

  const totalAllocated = formData.categoryAllocations.reduce(
    (sum, alloc) => sum + alloc.allocatedAmount,
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
      )?.allocatedAmount || 0;

    const potentialTotal = totalAllocated - currentAllocation + newAmount;

    if (potentialTotal > formData.amount) {
      setError(
        `Cannot allocate more than the total budget amount (${formatCurrency(formData.amount, user?.preferences.currency || "USD")})`,
      );
      return;
    }

    setError(null);
    setFormData((prev) => {
      const updatedAllocations = prev.categoryAllocations.filter(
        (alloc) => alloc.categoryId !== categoryId,
      );
      if (newAmount > 0) {
        updatedAllocations.push({ categoryId, allocatedAmount: newAmount });
      }
      return { ...prev, categoryAllocations: updatedAllocations };
    });
  };

  const handleBudgetAmountChange = (newAmount: number) => {
    if (newAmount < totalAllocated) {
      setError(
        "Cannot set budget amount lower than current allocations. Please reduce category allocations first.",
      );
      return;
    }
    setError(null);
    setFormData((prev) => ({ ...prev, amount: newAmount }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || !user?.id) return;

    if (totalAllocated > formData.amount) {
      setError(
        "Total allocations exceed budget amount. Please adjust allocations.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updateBudget(
        user?.id,
        budget.id,
        // @ts-expect-error - Type mismatch in formData
        {
          ...formData,
          period: formData.period as BudgetPeriod,
        },
      );
      onSave();
      onClose();
    } catch (err) {
      console.error("Error updating budget:", err);
      setError("Failed to update budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Budget">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert
            variant="error"
            title="Failed to update budget"
            icon={<AlertCircle className="w-5 h-5" />}
          >
            {error}
          </Alert>
        )}

        {/* Main Budget Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-indigo-900">
              Budget Details
            </h3>
          </div>

          {/* Budget Name */}
          <div className="space-y-1">
            <Input
              type="text"
              label="Budget Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Monthly Expenses"
            />
          </div>

          {/* Amount and Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  min={totalAllocated}
                  label="Budget Amount"
                  icon={<DollarSign className="h-5 w-5 text-gray-500" />}
                  value={formData.amount}
                  onChange={(e) =>
                    handleBudgetAmountChange(parseFloat(e.target.value))
                  }
                  required
                  className="w-full pl-8 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Period
              </label>
              <Select
                value={formData.period}
                onValueChange={(value) =>
                  setFormData({ ...formData, period: value })
                }
              >
                <SelectTrigger className="w-full border-indigo-200">
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

          {/* Category Allocations */}
          <div className="bg-white rounded-xl shadow-md mt-6">
            <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-xl">
              <h3 className="text-lg font-semibold text-teal-900">
                Category Allocations
              </h3>
            </div>

            <div className="max-h-48 sm:max-h-64 overflow-y-auto p-4 space-y-2">
              {categories.map((category) => {
                const currentAllocation =
                  formData.categoryAllocations.find(
                    (alloc) => alloc.categoryId === category.id,
                  )?.allocatedAmount || 0;
                const maxAllocation = currentAllocation + remainingAmount;

                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {category.name}
                    </span>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={maxAllocation}
                        value={currentAllocation}
                        placeholder="0.00"
                        className="w-full pl-8 text-right border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                        onChange={(e) =>
                          handleCategoryAllocation(
                            category.id,
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced allocation progress */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Allocation Progress
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(Number(allocationPercentage), 100)}
                  variant={
                    Number(allocationPercentage) === 100
                      ? "success"
                      : Number(allocationPercentage) > 100
                        ? "danger"
                        : "info"
                  }
                  showPercentage
                  animated={Number(allocationPercentage) < 100}
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Allocated:{" "}
                    {formatCurrency(
                      totalAllocated,
                      user?.preferences.currency || "USD",
                    )}
                  </span>
                  <span className="text-gray-600">
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
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || totalAllocated > formData.amount}
            className="w-full sm:w-auto"
          >
            {loading ? (
              "Saving Changes..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default EditBudgetModal;
