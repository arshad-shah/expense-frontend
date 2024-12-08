import React, { useState } from "react";
import { Budget, BudgetPerformance } from "@/types";
import { Info } from "lucide-react";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Dialog } from "@/components/Dialog";

interface BudgetCardProps {
  budget: Budget;
  performance: BudgetPerformance;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, performance }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusBadgeVariant = (status: BudgetPerformance["status"]) => {
    switch (status) {
      case "EXCEEDED":
        return "danger";
      case "WARNING":
        return "warning";
      case "ON_TRACK":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{budget.name}</h3>
            <p className="text-sm text-gray-500">
              Goal: $
              {budget.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <Badge variant={getStatusBadgeVariant(performance.status)}>
            {performance.status.replace("_", " ")}
          </Badge>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Spent</span>
            <span className="font-medium">
              $
              {performance.spent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Remaining</span>
            <span className="font-medium">
              $
              {performance.remaining.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="relative mt-3 h-2 w-full rounded-full bg-gray-200">
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-teal-600"
              style={{ width: `${Math.min(performance.percentageUsed, 100)}%` }}
            />
          </div>
          <p className="text-right text-sm text-gray-500">
            {performance.percentageUsed.toFixed(1)}% used
          </p>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <Button
            variant="link"
            className="inline-flex items-center gap-2 text-sm"
            onClick={() => setIsDetailsOpen(true)}
          >
            <Info className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </div>

{/* Details Dialog */}
<Dialog
  isOpen={isDetailsOpen}
  onClose={() => setIsDetailsOpen(false)}
  title="Budget Details"
>
  <div className="space-y-6">
    {/* Budget Overview */}
    <div>
      <h4 className="text-2xl font-bold text-gray-900">{budget.name}</h4>
      <p className="mt-2 text-sm text-gray-500">
        <strong>Period:</strong> {budget.period}
      </p>
      <p className="text-sm text-gray-500">
        <strong>Duration:</strong> {budget.startDate} - {budget.endDate}
      </p>
    </div>

    {/* Financial Summary */}
      <div className="space-y-3">
        <p className="text-lg font-semibold text-gray-900">
          <span className="text-gray-500 font-medium">Goal:</span> $
          {budget.amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-lg font-semibold text-gray-900">
          <span className="text-gray-500 font-medium">Spent:</span> $
          {performance.spent.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-lg font-semibold text-gray-900">
          <span className="text-gray-500 font-medium">Remaining:</span> $
          {performance.remaining.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-sm font-medium text-gray-600">
          <span>Status:</span>{" "}
          <span
            className={`inline-block px-2 py-1 rounded-full ${
              performance.status === "EXCEEDED"
                ? "bg-red-50 text-red-600"
                : performance.status === "WARNING"
                ? "bg-yellow-50 text-yellow-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {performance.status.replace("_", " ")}
          </span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 w-full rounded-full bg-gray-200">
        <div
          className="absolute left-0 top-0 h-3 rounded-full bg-teal-600"
          style={{ width: `${Math.min(performance.percentageUsed, 100)}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 text-right">
        {performance.percentageUsed.toFixed(1)}% used
      </p>

      {/* Categories Section */}
      <div>
        <h5 className="text-lg font-bold text-gray-900">Categories</h5>
        <div className="mt-4 space-y-4">
          {budget.categories && budget.categories.map((category) => (
            <div
              key={category.category.id}
              className="flex items-center justify-between p-4 rounded-lg shadow-sm border border-gray-200"
              style={{ backgroundColor: category.category.color }}
            >
              <div className="flex items-center">
                <span className="mr-3 text-xl">{category.category.icon}</span>
                <div>
                  <h6 className="text-sm font-semibold text-gray-900">
                    {category.category.name}
                  </h6>
                  <p className="text-xs text-gray-700">
                    Allocated: $
                    {category.allocatedAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-700">
                    Spent: $
                    {category.spentAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-900 font-semibold">
                  {(
                    (category.spentAmount / category.allocatedAmount) *
                    100
                  ).toFixed(1)}
                  % Used
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Dialog>

    </>
  );
};
