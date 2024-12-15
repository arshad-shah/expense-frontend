import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBudgets } from "@/services/BudgetService";
import { getTransactions } from "@/services/TransactionService";
import type { 
  Budget,
  BudgetFilters,
  Transaction,
  BudgetStatus,
} from "@/types";
import PageLoader from "@/components/PageLoader";
import ErrorState from "@/components/ErrorState";
import BudgetHeader from "./Components/BudgetHeader";
import {BudgetFilters as Filters} from "./Components/BudgetFilters";
import EmptyState from "@/components/EmptyState";
import { BudgetCard } from "./Components/BudgetCard";
import AddBudgetModal from "./Components/AddBudgetModal";

// Types specific to this component
interface CategoryPerformance {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  percentageUsed: number;
}

interface BudgetPerformance {
  budgetId: string;
  budgetName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: BudgetStatus;
  categoryPerformance: Record<string, CategoryPerformance>;
}

const Budgets: React.FC = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [performance, setPerformance] = useState<BudgetPerformance[]>([]);
  const [filters, setFilters] = useState<BudgetFilters>({
    period: "MONTHLY",
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const calculateBudgetPerformance = useCallback((
    budget: Budget,
    transactions: Transaction[]
  ): BudgetPerformance => {
    // Filter transactions that belong to the budget's categories
    const relevantTransactions = transactions.filter(t =>
      Object.values(budget.categories).some(c => c.categoryId === t.categoryId)
    );

    const spent = relevantTransactions.reduce(
      (total, transaction) => 
        transaction.type === 'EXPENSE' ? total + transaction.amount : total,
      0
    );

    const allocated = budget.amount;
    const remaining = allocated - spent;
    const percentageUsed = (spent / allocated) * 100;

    // Calculate performance for each category
    const categoryPerformance = Object.entries(budget.categories).reduce((acc, [categoryId, allocation]) => {
      const categoryTransactions = relevantTransactions.filter(t => t.categoryId === categoryId);
      const categorySpent = categoryTransactions.reduce((total, t) => total + t.amount, 0);
      
      acc[categoryId] = {
        id: categoryId,
        name: allocation.categoryId, // You might want to fetch category names separately
        allocated: allocation.amount,
        spent: categorySpent,
        percentageUsed: (categorySpent / allocation.amount) * 100
      };

      return acc;
    }, {} as Record<string, CategoryPerformance>);

    // Determine budget status
    let status: BudgetStatus = "ON_TRACK";
    if (spent > allocated) {
      status = "EXCEEDED";
    } else if (percentageUsed > 80) {
      status = "WARNING";
    }

    return {
      budgetId: budget.id,
      budgetName: budget.name,
      allocated,
      spent,
      remaining,
      percentageUsed,
      status,
      categoryPerformance
    };
  }, []);

  const fetchBudgetsAndPerformance = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch budgets
      const budgetsResponse = await getBudgets(user.id, filters);
      
      if (!budgetsResponse.data || budgetsResponse.error) {
        throw new Error(budgetsResponse.error || 'Failed to fetch budgets');
      }

      const fetchedBudgets = budgetsResponse.data;

      // Get all unique category IDs from budgets
      const categoryIds = [...new Set(
        fetchedBudgets.flatMap(budget => Object.values(budget.categories).map(c => c.categoryId))
      )];

      if (categoryIds.length === 0) {
        setBudgets(fetchedBudgets);
        setPerformance([]);
        return;
      }

      // Fetch transactions for the categories
      const transactionsResponse = await getTransactions(user.id, {
        categoryIds,
        dateRange: filters.dateRange,
        types: ["EXPENSE"]
      });
      

      if (!transactionsResponse.data || transactionsResponse.error) {
        throw new Error(transactionsResponse.error || 'Failed to fetch transactions');
      }

      // Calculate performance for each budget
      const calculatedPerformance = fetchedBudgets.map(budget =>
        calculateBudgetPerformance(budget, transactionsResponse.data?.items || [])
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
  }, [user?.id, filters, calculateBudgetPerformance]);

  useEffect(() => {
    fetchBudgetsAndPerformance();
  }, [fetchBudgetsAndPerformance]);

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
      <BudgetHeader
        onOpenFilter={handleOpenFilter}
        onAddBudget={handleOpenAddModal}
      />

      <Filters
        filters={filters}
        onApplyFilters={setFilters}
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
      />

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

      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onBudgetAdded={fetchBudgetsAndPerformance}
      />
    </div>
  );
};

export default Budgets;