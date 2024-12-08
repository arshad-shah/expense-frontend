import { useEffect, useState } from "react";
import { Budget, BudgetFilters, BudgetPerformance } from "@/types";
import { getBudgets } from "@/services/BudgetService";
import { getTransactions } from "@/services/TransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { BudgetFilters as BudgetFiltersComponent } from "./Components/BudgetFilters";
import { BudgetCard } from "./Components/BudgetCard";
import AddBudgetModal from "./Components/AddBudgetModal";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import PageLoader from "@/components/PageLoader";
import { BudgetHeader } from "./Components/BudgetHeader";

const Budgets: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [performance, setPerformance] = useState<BudgetPerformance[]>([]);
  const [filters, setFilters] = useState<BudgetFilters>({
    period: "MONTHLY",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const userId = user?.id!;

  const fetchBudgetsAndPerformance = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const fetchedBudgets = await getBudgets(userId, filters);
      const categoryIds = fetchedBudgets.flatMap(budget =>
        budget.categories?.map(cat => cat.category.id) || []
      );

      const transactions = await getTransactions({
        dateRange: filters.dateRange,
        categoryIds,
      });

      const calculatedPerformance = fetchedBudgets.map(budget => {
        const relevantTransactions = transactions.filter(t =>
          budget.categories?.some(cat => cat.category.id === t.category.id)
        );

        const spent = relevantTransactions.reduce(
          (total, transaction) => total + transaction.amount,
          0
        );

        return {
          budgetId: budget.id,
          budgetName: budget.name,
          allocated: budget.amount,
          spent,
          remaining: budget.amount - spent,
          percentageUsed: (spent / budget.amount) * 100,
          status:
            spent > budget.amount
              ? "EXCEEDED" as "EXCEEDED"
              : (spent / budget.amount) * 100 > 80
              ? "WARNING" as "WARNING"
              : "ON_TRACK" as "ON_TRACK",
        };
      });

      setBudgets(fetchedBudgets);
      setPerformance(calculatedPerformance);
    } catch (err) {
      console.error("Error fetching budgets and performance:", err);
      setError("Failed to fetch budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetsAndPerformance();
  }, [filters, userId]);

  if (loading) {
    return (
      <PageLoader text="Loading budgets..." />
    );
  }

  if (error) {
    return (
      <ErrorState message={error}  onRetry={fetchBudgetsAndPerformance} />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <BudgetHeader  onOpenFilter={() => setIsFilterOpen(true)} onAddBudget={() => setIsAddModalOpen(true)} />

      {/* Filters */}
      <BudgetFiltersComponent filters={filters} onApplyFilters={setFilters} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

      {/* Budgets */}
      {budgets.length === 0 ? (
        <EmptyState
          heading="No Budgets Found"
          message="Start managing your expenses by creating your first budget."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              performance={performance.find(p => p.budgetId === budget.id)!}
              onUpdate={fetchBudgetsAndPerformance} // Pass the callback here
            />
          ))}
        </div>
      )}

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onBudgetAdded={fetchBudgetsAndPerformance}
      />
    </div>
  );
};

export default Budgets;
