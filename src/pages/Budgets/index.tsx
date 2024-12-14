import { useEffect, useState, useCallback } from "react";
import type { Budget, BudgetFilters, BudgetPerformance, Transaction, ApiResponse, PaginatedResponse, CategoryPerformance } from "@/types";
import { getBudgets } from "@/services/BudgetService";
import { getTransactions } from "@/services/TransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { BudgetFilters as BudgetFiltersComponent } from "./Components/BudgetFilters";
import { BudgetCard } from "./Components/BudgetCard";
import AddBudgetModal from "./Components/AddBudgetModal";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import PageLoader from "@/components/PageLoader";
import BudgetHeader from "./Components/BudgetHeader";
import { Button } from "@/components/Button";

const Budgets: React.FC = () => {
  // State Management
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

  const userId = user?.id;

  // Calculate budget performance based on transactions
  const calculateBudgetPerformance = useCallback((
    budget: Budget,
    transactions: Transaction[]
  ): BudgetPerformance => {
    const relevantTransactions = transactions.filter(t =>
      budget.categories?.some(cat => cat.category.id === t.category.id)
    );

    const spent = relevantTransactions.reduce(
      (total, transaction) => 
        transaction.type === 'EXPENSE' ? total + transaction.amount : total,
      0
    );

    const allocated = budget.amount;
    const remaining = allocated - spent;
    const percentageUsed = (spent / allocated) * 100;
    const categoryPerformance = budget.categories?.reduce((acc, cat) => {
      const id = cat.category.id;
      const categoryTransactions = relevantTransactions.filter(t => t.category.id === id);
      const spentAmount = categoryTransactions.reduce((total, transaction) => total + transaction.amount, 0);
      cat.spentAmount = spentAmount;
      acc[id] = {
        id,
        name: cat.category.name,
        allocated: cat.allocatedAmount,
        spent: cat.spentAmount,
        percentageUsed: (cat.spentAmount / cat.allocatedAmount) * 100,
      };

      return acc;
    }, {} as Record<string, CategoryPerformance>) || {};

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      allocated,
      spent,
      remaining,
      percentageUsed,
      status:
        spent > allocated
          ? "EXCEEDED"
          : percentageUsed > 80
          ? "WARNING"
          : "ON_TRACK",
      categoryPerformance,
    };
  }, []);

  // Fetch budgets and calculate performance
  const fetchBudgetsAndPerformance = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch budgets
      const fetchedBudgets = await getBudgets(userId, filters);
      
      if (!fetchedBudgets || !Array.isArray(fetchedBudgets)) {
        throw new Error('Failed to fetch budgets');
      }

      // Get all unique category IDs from budgets
      const categoryIds = [...new Set(
        fetchedBudgets.flatMap(budget =>
          budget.categories?.map(cat => cat.category.id) || []
        )
      )];

      if (categoryIds.length === 0) {
        setBudgets(fetchedBudgets);
        setPerformance([]);
        return;
      }

      // Fetch transactions
      const transactionsResponse: ApiResponse<PaginatedResponse<Transaction>> = 
        await getTransactions({
          dateRange: filters.dateRange,
          categoryIds,
        }, 1, 1000); // Adjust limit based on your needs

        
      if (!transactionsResponse.data) {
        throw new Error('Failed to fetch transactions');
      }

      const transactions = transactionsResponse.data.items;

      // Calculate performance for each budget
      const calculatedPerformance = fetchedBudgets.map(budget =>
        calculateBudgetPerformance(budget, transactions)
      );

      setBudgets(fetchedBudgets);
      setPerformance(calculatedPerformance);
    } catch (err) {
      console.error("Error fetching budgets and performance:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to fetch budget data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [userId, filters, calculateBudgetPerformance]);

  // Effect to fetch data when filters or userId changes
  useEffect(() => {
    fetchBudgetsAndPerformance();
  }, [fetchBudgetsAndPerformance]);

  // Modal handlers
  const handleOpenAddModal = () => setIsAddModalOpen(true);
  const handleCloseAddModal = () => setIsAddModalOpen(false);
  const handleOpenFilter = () => setIsFilterOpen(true);
  const handleCloseFilter = () => setIsFilterOpen(false);

  if (loading) {
    return <PageLoader text="Loading budgets..." />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error}
        onRetry={fetchBudgetsAndPerformance}
        title="Failed to load budgets"
        supportMessage="Please try again or contact support if the problem persists"
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <BudgetHeader
        onOpenFilter={handleOpenFilter}
        onAddBudget={handleOpenAddModal}
      />

      {/* Filters */}
      <BudgetFiltersComponent
        filters={filters}
        onApplyFilters={setFilters}
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
      />

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <EmptyState
          heading="No Budgets Found"
          message="Start managing your expenses by creating your first budget."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map(budget => {
            const budgetPerformance = performance.find(
              p => p.budgetId === budget.id
            );

            if (!budgetPerformance) return null;

            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                performance={budgetPerformance}
                onUpdate={fetchBudgetsAndPerformance}
              />
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onBudgetAdded={fetchBudgetsAndPerformance}
      />
    </div>
  );
};

export default Budgets;