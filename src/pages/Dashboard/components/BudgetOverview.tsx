import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getTransactions } from "@/services/TransactionService";
import { getBudgets } from "@/services/BudgetService";
import type { TransactionFilters } from "@/types";
import EmptyState from "@/components/EmptyState";
import { AlertTriangle, Circle, ChevronUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import Alert from "@/components/Alert";

interface BudgetWithSpending {
  id: string;
  category: string;
  spent: number;
  limit: number;
  categoryColor?: string;
  currency: string;
}

const BudgetOverview: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError("");

        // Calculate date range for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch budgets
        const budgetsResponse = await getBudgets(user.id, {
          isActive: true,
        });

        if (!budgetsResponse.data || budgetsResponse.data.length === 0) {
          setBudgets([]);
          return;
        }

        const budgetsData = budgetsResponse.data;

        // Get all unique category IDs from budgets
        const categoryIds = Array.from(
          new Set(
            budgetsData.flatMap((budget) =>
              Object.values(budget.categories).map((c) => c.categoryId),
            ),
          ),
        );

        // Prepare filters for transactions
        const filters: TransactionFilters = {
          dateRange: {
            startDate: startOfMonth.toISOString(),
            endDate: endOfMonth.toISOString(),
          },
          categoryIds,
          types: ["EXPENSE"],
        };

        // Fetch transactions
        const transactionsResponse = await getTransactions(
          user.id,
          filters,
          1,
          1000,
        );
        if (!transactionsResponse.data) {
          throw new Error("Failed to fetch transactions");
        }

        const transactions = transactionsResponse.data.items;

        // Process budget data with spending
        const budgetWithSpending = budgetsData.map((budget) => {
          // Calculate total spending for all categories in this budget
          const spent = Object.entries(budget.categories).reduce(
            (total, [, allocation]) => {
              const categoryTransactions = transactions.filter(
                (t) =>
                  t.categoryId === allocation.categoryId &&
                  t.type === "EXPENSE",
              );
              return (
                total +
                categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
              );
            },
            0,
          );

          // Get first category color for visualization
          const firstCategoryId = Object.keys(budget.categories)[0];
          const firstAllocation = budget.categories[firstCategoryId];

          return {
            id: budget.id,
            category: budget.name,
            spent,
            limit: budget.amount,
            categoryColor: firstAllocation?.status,
            currency: user.preferences.currency,
          };
        });

        // Sort budgets by percentage spent
        setBudgets(
          budgetWithSpending.sort(
            (a, b) => b.spent / b.limit - a.spent / a.limit,
          ),
        );
      } catch (err) {
        console.error("Error fetching budget data:", err);
        setError("Failed to load budget information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [user]);

  const getProgressStyle = (percentage: number): React.CSSProperties => {
    if (percentage > 100) {
      return {
        background: "linear-gradient(to right, #f87171, #ef4444)",
        boxShadow: "0 0 12px rgba(239, 68, 68, 0.15)",
      };
    }
    if (percentage > 85) {
      return {
        background: "linear-gradient(to right, #fbbf24, #f59e0b)",
        boxShadow: "0 0 12px rgba(245, 158, 11, 0.15)",
      };
    }
    if (percentage > 70) {
      return {
        background: "linear-gradient(to right, #34d399, #10b981)",
        boxShadow: "0 0 12px rgba(16, 185, 129, 0.15)",
      };
    }
    return {
      background: "linear-gradient(to right, #60a5fa, #3b82f6)",
      boxShadow: "0 0 12px rgba(59, 130, 246, 0.15)",
    };
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage > 100) return "text-red-600 bg-red-50";
    if (percentage > 85) return "text-amber-600 bg-amber-50";
    if (percentage > 70) return "text-emerald-600 bg-emerald-50";
    return "text-blue-600 bg-blue-50";
  };

  // Calculate total budget and spent
  const totals = budgets.reduce(
    (acc, curr) => ({
      spent: acc.spent + curr.spent,
      limit: acc.limit + curr.limit,
    }),
    { spent: 0, limit: 0 },
  );

  const totalPercentage =
    totals.limit > 0 ? (totals.spent / totals.limit) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="flex-1 p-6 pt-0 animate-pulse space-y-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-6 w-32 bg-gray-200 rounded" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-2 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full p-4">
        <Alert title="Error" variant="error">
          {error}
        </Alert>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          heading="No budgets found"
          message="Create a budget to start tracking your spending"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 p-6 pt-0 overflow-y-auto">
        {/* Total Budget Overview */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-4 mb-8 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Total Budget
            </span>
            <div
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                getStatusColor(totalPercentage),
              )}
            >
              {totalPercentage > 100 ? (
                <span className="flex items-center gap-1">
                  <ChevronUp className="w-3 h-3" />
                  Over Budget
                </span>
              ) : (
                `${totalPercentage.toFixed(1)}%`
              )}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  totals.spent,
                  user?.preferences.currency || "USD",
                )}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                of{" "}
                {formatCurrency(
                  totals.limit,
                  user?.preferences.currency || "USD",
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Individual Budgets */}
        <div className="space-y-6">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const progressStyle = getProgressStyle(percentage);

            return (
              <div key={budget.id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Circle
                      className="w-3 h-3"
                      style={{ color: budget.categoryColor || "#6b7280" }}
                      fill="currentColor"
                    />
                    <span className="font-medium text-gray-900">
                      {budget.category}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(percentage),
                    )}
                  >
                    {percentage.toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 ease-out relative group-hover:opacity-80"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        ...progressStyle,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.1] to-white/0" />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(
                        budget.spent,
                        user?.preferences.currency || "USD",
                      )}
                    </span>
                    <span className="text-xs text-gray-400 mx-1">/</span>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(
                        budget.limit,
                        user?.preferences.currency || "USD",
                      )}
                    </span>
                  </div>
                </div>

                {percentage > 100 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>
                      Over budget by{" "}
                      {formatCurrency(
                        budget.spent - budget.limit,
                        user?.preferences.currency || "USD",
                      )}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;
