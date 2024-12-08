import { useEffect, useState } from "react";
import { Budget, BudgetFilters, BudgetPerformance } from "@/types";
import { getBudgets } from "@/services/BudgetService"; // Adjust the path as necessary
import { BudgetFiltersComponent } from "./Components/BudgetFilters";
import { BudgetCard } from "./Components/BudgetCard";
import AddBudgetModal from "./Components/AddBudgetModal"; // Adjust the path
import { useAuth } from "@/contexts/AuthContext";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal visibility state

  const userId = user?.id!;

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch budgets from Firebase
      const fetchedBudgets = await getBudgets(userId, filters);
      // Mock data for budgets
      const fetchedBudgetsMocked: Budget[] = [
        {
          id: "1",
          name: "Groceries",
          amount: 500,
          period: "MONTHLY",
          startDate: "2023-01-01",
          endDate: "2023-01-31",
          isActive: true,
          categories: [
            {
              budget: {
                id: "1",
                name: "Groceries",
                amount: 500,
                period: "MONTHLY",
                startDate: "2023-01-01",
                endDate: "2023-01-31",
                isActive: true,
              },
              category: {
                id: "1",
                name: "Food",
                type: "Expense",
                icon: "🍔",
                color: "#FF6347",
                isDefault: true,
                isActive: true,
              },
              allocatedAmount: 300,
              spentAmount: 250,
            },
          ],
        },
        {
          id: "2",
          name: "Utilities",
          amount: 200,
          period: "MONTHLY",
          startDate: "2023-01-01",
          endDate: "2023-01-31",
          isActive: true,
          categories: [
            {
              budget: {
                id: "2",
                name: "Utilities",
                amount: 200,
                period: "MONTHLY",
                startDate: "2023-01-01",
                endDate: "2023-01-31",
                isActive: true,
              },
              category: {
                id: "2",
                name: "Electricity",
                type: "Expense",
                icon: "💡",
                color: "#FFD700",
                isDefault: true,
                isActive: true,
              },
              allocatedAmount: 100,
              spentAmount: 80,
            },
          ],
        },
        {
          id: "3",
          name: "Entertainment",
          amount: 300,
          period: "MONTHLY",
          startDate: "2023-01-01",
          endDate: "2023-01-31",
          isActive: true,
          categories: [
            {
              budget: {
          id: "3",
          name: "Entertainment",
          amount: 300,
          period: "MONTHLY",
          startDate: "2023-01-01",
          endDate: "2023-01-31",
          isActive: true,
              },
              category: {
          id: "3",
          name: "Movies",
          type: "Expense",
          icon: "🎬",
          color: "#FF4500",
          isDefault: true,
          isActive: true,
              },
              allocatedAmount: 150,
              spentAmount: 120,
            },
            {
              budget: {
          id: "3",
          name: "Entertainment",
          amount: 300,
          period: "MONTHLY",
          startDate: "2023-01-01",
          endDate: "2023-01-31",
          isActive: true,
              },
              category: {
          id: "4",
          name: "Games",
          type: "Expense",
          icon: "🎮",
          color: "#32CD32",
          isDefault: true,
          isActive: true,
              },
              allocatedAmount: 150,
              spentAmount: 100,
            },
          ],
        },
      ];
      // Update state
      setBudgets(fetchedBudgets);

      // Optionally, calculate performance metrics based on fetched data
      const calculatedPerformance = fetchedBudgets.map((budget) => {
        const spent = budget.categories?.reduce((acc, cat) => acc + cat.spentAmount, 0) || 0;
        return {
          budgetId: budget.id,
          budgetName: budget.name, // Assuming budget has a name property
          allocated: budget.amount, // Assuming budget has an amount property
          spent,
          remaining: budget.amount - spent,
          percentageUsed: (spent / budget.amount) * 100,
          status: spent > budget.amount ? "EXCEEDED" : (spent / budget.amount) * 100 > 80 ? "WARNING" : "ON_TRACK" as "EXCEEDED" | "WARNING" | "ON_TRACK",
        };
      });

      setPerformance(calculatedPerformance);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError("Failed to fetch budgets. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [filters, userId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Your Budgets</h1>
          <p className="text-sm text-gray-600 mt-2">Track your expenses and stay on top of your financial goals.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)} // Open the modal
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <BudgetFiltersComponent filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Budget Cards */}
        <div className="lg:col-span-3">
          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-600">No budgets found. Start tracking your expenses today!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  performance={performance.find((p) => p.budgetId === budget.id)!}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)} // Close the modal
        onBudgetAdded={fetchBudgets} // Refresh budgets after adding
      />
    </div>
  );
};

export default Budgets;
