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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBudget(
        {
          name: formData.name,
          amount: formData.amount,
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate || "",
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

  const handleCategoryAllocation = (categoryId: string, allocatedAmount: number) => {
    setFormData((prev) => {
      const updatedAllocations = prev.categoryAllocations.filter(
        (alloc) => alloc.categoryId !== categoryId
      );
      if (allocatedAmount > 0) {
        updatedAllocations.push({ categoryId, allocatedAmount });
      }
      return { ...prev, categoryAllocations: updatedAllocations };
    });
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Budget">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Budget Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Budget Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        {/* Budget Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
            required
          />
        </div>

        {/* Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Period</label>
          <Select
            value={formData.period}
            onValueChange={(value) => setFormData({ ...formData, period: value })}
          >
            <SelectTrigger className="w-full">
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

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

{/* Category Allocations */}
<div>
  <label className="block text-lg font-semibold text-gray-800 mb-4">
    Category Allocations
  </label>
  <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
    <div className="max-h-64 overflow-y-auto p-4 space-y-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3 shadow-sm hover:bg-gray-100"
        >
          {/* Category Name */}
          <span className="text-sm font-medium text-gray-800">{category.name}</span>

          {/* Allocation Input */}
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-28 text-right"
            onChange={(e) =>
              handleCategoryAllocation(category.id, parseFloat(e.target.value) || 0)
            }
          />
        </div>
      ))}
    </div>

    {/* Total Allocations */}
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <span className="text-sm text-gray-600">
        Total Allocated:{" "}
        <span className="font-medium text-gray-900">
          {formData.categoryAllocations
            .reduce((sum, alloc) => sum + alloc.allocatedAmount, 0)
            .toFixed(2)}{" "}
          USD
        </span>
      </span>
    </div>
  </div>
</div>



        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Budget"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AddBudgetModal;
