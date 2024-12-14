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
import { getCategories } from "@/services/CategoryService";
import { useAuth } from "@/contexts/AuthContext";
import type { Category } from "@/types";
import { DollarSign } from "lucide-react";

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
  const [formData, setFormData] = useState({
    name: "",
    amount: 0,
    period: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    categoryAllocations: [] as { categoryId: string; allocatedAmount: number }[],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      if (user) {
        try {
          const fetchedCategories = await getCategories(user.id);

          setCategories(fetchedCategories);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      }
    };
    fetchCategories();
  }, [user]);


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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBudget(
        {
          name: formData.name,
          amount: formData.amount,
          period: formData.period,
          startDate: formData.startDate.split("T")[0],
          endDate: formData.endDate || calculateEndDate(formData.startDate, formData.period),
          userId: user?.id as string,
        },
        formData.categoryAllocations
      );
      onBudgetAdded();
      onClose();
      setFormData({
        name: "",
        amount: 0,
        period: "MONTHLY",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        categoryAllocations: [],
      });
    } catch (error) {
      console.error("Error creating budget:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAllocated = formData.categoryAllocations
    .reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
  
  const remainingAmount = formData.amount - totalAllocated;
  const allocationPercentage = formData.amount > 0 
    ? ((totalAllocated / formData.amount) * 100).toFixed(1) 
    : 0;
  
  const isFullyAllocated = totalAllocated >= formData.amount;

  const handleCategoryAllocation = (categoryId: string, newAmount: number) => {
    // Get current allocation for this category
    const currentAllocation = formData.categoryAllocations.find(
      alloc => alloc.categoryId === categoryId
    )?.allocatedAmount || 0;

    // Calculate what the total would be with the new amount
    const potentialTotal = totalAllocated - currentAllocation + newAmount;

    // Only allow the change if it wouldn't exceed the total budget
    if (potentialTotal <= formData.amount) {
      setFormData((prev) => {
        const updatedAllocations = prev.categoryAllocations.filter(
          (alloc) => alloc.categoryId !== categoryId
        );
        if (newAmount > 0) {
          updatedAllocations.push({ categoryId, allocatedAmount: newAmount });
        }
        return { ...prev, categoryAllocations: updatedAllocations };
      });
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };


  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Budget">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Budget Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-indigo-900">Budget Details</h3>
          </div>
          
          {/* Budget Name - Full width on all screens */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Budget Name</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Monthly Expenses"
            />
          </div>

          {/* Amount and Period - Stack on mobile, side by side on tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                  className="w-full pl-8 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Period</label>
              <Select
                value={formData.period}
                onValueChange={(value) => setFormData({ ...formData, period: value })}
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

          {/* Dates - Stack on mobile, side by side on tablet+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Category Allocations */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl border border-gray-200 ">
            <h3 className="text-lg font-semibold text-teal-900">Category Allocations</h3>
          </div>

          <div className="max-h-48 sm:max-h-64 overflow-y-auto p-2 space-y-1">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800">{category.name}</span>
              <div className="relative w-32">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 text-right border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  onChange={(e) =>
                    handleCategoryAllocation(category.id, parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
          ))}
        </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-teal-100 rounded-t-xl">
            <p className="text-sm text-teal-600 mt-1">
              {isFullyAllocated 
                ? "Budget fully allocated. Adjust existing allocations to make changes."
                : "Distribute your budget across categories"}
            </p>
          </div>

          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-teal-50 to-teal-100 
          rounded-b-xl
          ">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-sm text-teal-900">Total Allocated:</span>
                <span className="text-lg font-semibold text-teal-900">
                  {formatCurrency(totalAllocated)}
                  <span className="text-sm font-normal text-teal-700 ml-2">
                    ({allocationPercentage}% of budget)
                  </span>
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-sm text-teal-900">Remaining Amount:</span>
                <span className={`text-lg font-semibold ${remainingAmount >= 0 ? 'text-teal-900' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(remainingAmount))}
                  <span className="text-sm font-normal ml-2">
                    ({remainingAmount >= 0 ? 'available' : 'over budget'})
                  </span>
                </span>
              </div>

              <div className="w-full bg-teal-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    remainingAmount >= 0 ? 'bg-teal-600' : 'bg-red-600'
                  }`}
                  style={{ 
                    width: `${Math.min(Number(allocationPercentage), 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Actions - Full width buttons on mobile */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
          >
            {loading ? "Creating Budget..." : "Create Budget"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddBudgetModal;