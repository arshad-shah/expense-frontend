import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getUser } from "./userService";
import {
  type Budget,
  type BudgetInput,
  type BudgetFilters,
  type ApiResponse,
  type BudgetStats,
  type BudgetCategoryAllocation,
  type DateRange,
  type PaginatedResponse,
  type User,
  CollectionPaths,
} from "../types";

const DEFAULT_BUDGET_STATS: BudgetStats = {
  totalAllocated: 0,
  totalSpent: 0,
  totalRemaining: 0,
  complianceRate: 0,
  historicalPerformance: {},
};

/**
 * Validate user exists and is active
 */
const validateUser = async (userId: string): Promise<User> => {
  const user = await getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.isActive) {
    throw new Error("User account is inactive");
  }
  return user;
};

/**
 * Get all budgets for a user with optional filters
 */
export const getBudgets = async (
  userId: string,
  filters?: BudgetFilters
): Promise<ApiResponse<Budget[]>> => {

  try {
    // First validate user exists and is active
    await validateUser(userId);

    let q = query(collection(db, `users/${userId}/budgets`));

    if (filters?.isActive !== undefined) {
      q = query(q, where("isActive", "==", filters.isActive));
    }

    if (filters?.period) {
      q = query(q, where("period", "==", filters.period));
    }

    if (filters?.dateRange) {
      q = query(
        q,
        where("startDate", ">=", filters.dateRange.startDate),
        where("endDate", "<=", filters.dateRange.endDate)
      );
    }

    if (filters?.status) {
      q = query(q, where("stats.status", "==", filters.status));
    }

    const querySnapshot = await getDocs(q);
    const budgets: Budget[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as Budget;
      budgets.push({
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toString(),
        updatedAt: data.updatedAt?.toString(),
        deletedAt: data.deletedAt?.toString(),
      });
    });

    return {
      status: 200,
      data: budgets,
    };
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch budgets",
    };
  }
};

/**
 * Get paginated budgets
 */
export const getPaginatedBudgets = async (
  userId: string,
  page: number,
  limit: number,
  filters?: BudgetFilters
): Promise<ApiResponse<PaginatedResponse<Budget>>> => {
  try {
    // First validate user exists and is active
    await validateUser(userId);

    const { data: allBudgets } = await getBudgets(userId, filters);

    if (!allBudgets) {
      throw new Error("Failed to fetch budgets");
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBudgets = allBudgets.slice(startIndex, endIndex);

    return {
      status: 200,
      data: {
        items: paginatedBudgets,
        total: allBudgets.length,
        page,
        limit,
        hasMore: endIndex < allBudgets.length,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated budgets:", error);
    return {
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch paginated budgets",
    };
  }
};

/**
 * Get a specific budget by ID
 */
export const getBudgetById = async (
  userId: string,
  budgetId: string
): Promise<ApiResponse<Budget>> => {
  try {
    // First validate user exists and is active
    await validateUser(userId);

    const budgetRef = doc(db, `users/${userId}/budgets`, budgetId);
    const budgetSnap = await getDoc(budgetRef);

    if (!budgetSnap.exists()) {
      return {
        status: 404,
        error: "Budget not found",
      };
    }

    const data = budgetSnap.data() as Budget;
    return {
      status: 200,
      data: {
        ...data,
        id: budgetSnap.id,
        createdAt: data.createdAt.toString(),
        updatedAt: data.updatedAt?.toString(),
        deletedAt: data.deletedAt?.toString(),
      },
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to fetch budget",
    };
  }
};

/**
 * Create a new budget
 */
export const createBudget = async (
  userId: string,
  budgetInput: BudgetInput,
  categories: Record<string, BudgetCategoryAllocation>
): Promise<ApiResponse<Budget>> => {
  try {
    // First validate user exists and is active
    await validateUser(userId);

    // Start a batch write
    const batch = writeBatch(db);

    // Get current budget count for the user
    const { data: existingBudgets } = await getBudgets(userId, {
      isActive: true,
    });
    const currentBudgetCount = existingBudgets?.length || 0;

    const budgetRef = doc(collection(db, `users/${userId}/budgets`));

    const newBudget: Budget = {
      ...budgetInput,
      id: budgetRef.id,
      userId,
      categories,
      stats: {
        ...DEFAULT_BUDGET_STATS,
        totalAllocated: Object.values(categories).reduce(
          (total, category) => total + category.amount,
          0
        ),
      },
      createdAt: serverTimestamp(),
      isActive: true,
    };

    batch.set(budgetRef, newBudget);

    // Update user stats
    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      "stats.totalBudgets": currentBudgetCount + 1,
      "stats.lastCalculated": serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    const { data: createdBudget } = await getBudgetById(userId, budgetRef.id);

    if (!createdBudget) {
      throw new Error("Failed to fetch created budget");
    }

    return {
      status: 200,
      data: createdBudget,
      message: "Budget created successfully",
    };
  } catch (error) {
    console.error("Error creating budget:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to create budget",
    };
  }
};

/**
 * Update an existing budget
 */
export const updateBudget = async (
  userId: string,
  budgetId: string,
  updates: Partial<Omit<Budget, "id" | "userId" | "stats">>
): Promise<ApiResponse<Budget>> => {
  try {
    // First validate user exists and is active
    await validateUser(userId);

    // Get the current budget state
    const { data: currentBudget } = await getBudgetById(userId, budgetId);

    if (!currentBudget) {
      return {
        status: 404,
        error: "Budget not found",
      };
    }

    const budgetRef = doc(db, `users/${userId}/budgets`, budgetId);

    // Merge current state with updates
    const updatedData = {
      ...currentBudget,
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(budgetRef, updatedData);

    const { data: updatedBudget } = await getBudgetById(userId, budgetId);

    if (!updatedBudget) {
      throw new Error("Failed to fetch updated budget");
    }

    return {
      status: 200,
      data: updatedBudget,
      message: "Budget updated successfully",
    };
  } catch (error) {
    console.error("Error updating budget:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Failed to update budget",
    };
  }
};

/**
 * Deactivate (soft delete) a budget
 */
export const deactivateBudget = async (
  userId: string,
  budgetId: string
): Promise<ApiResponse<void>> => {
  try {
    // First validate user exists and is active
    await validateUser(userId);

    // Get the current budget state
    const { data: currentBudget } = await getBudgetById(userId, budgetId);

    if (!currentBudget) {
      return {
        status: 404,
        error: "Budget not found",
      };
    }

    // Start a batch write
    const batch = writeBatch(db);

    const budgetRef = doc(db, `users/${userId}/budgets`, budgetId);
    batch.update(budgetRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Get current budget count for the user
    const { data: activeBudgets } = await getBudgets(userId, {
      isActive: true,
    });
    const currentBudgetCount = activeBudgets?.length || 0;

    // Update user stats
    const userRef = doc(db, "users", userId);
    batch.update(userRef, {
      "stats.totalBudgets": Math.max(0, currentBudgetCount - 1),
      "stats.lastCalculated": serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return {
      status: 200,
      message: "Budget deactivated successfully",
    };
  } catch (error) {
    console.error("Error deactivating budget:", error);
    return {
      status: 500,
      error:
        error instanceof Error ? error.message : "Failed to deactivate budget",
    };
  }
};

/**
 * Update budget category allocations
 */
export const updateBudgetCategories = async (
  userId: string,
  budgetId: string,
  categories: Record<string, BudgetCategoryAllocation>
): Promise<ApiResponse<Budget>> => {
  try {
    const budgetRef = doc(db, CollectionPaths.budgets(userId), budgetId);
    const budgetSnap = await getDoc(budgetRef);

    if (!budgetSnap.exists()) {
      return { status: 404, error: "Budget not found" };
    }

    const batch = writeBatch(db);

    // Update budget categories
    batch.update(budgetRef, {
      categories,
      updatedAt: serverTimestamp(),
      stats: {
        totalRemaining: Object.values(categories).reduce(
          (total, category) => total + category.amount,
          0
        ),
        totalSpent: budgetSnap.data().stats.totalAllocated - Object.values(categories).reduce(
          (total, category) => total + category.amount,
          0
        ),
      },
    });

    await batch.commit();

    const updatedBudget = await getBudgetById(userId, budgetId);
    return updatedBudget;
  } catch (error) {
    console.error("Error updating budget categories:", error);
    return {
      status: 500,
      error: "Failed to update budget categories",
    };
  }
};

/**
 * Get budgets by date range
 */
export const getBudgetsByDateRange = async (
  userId: string,
  dateRange: DateRange
): Promise<ApiResponse<Budget[]>> => {
  try {
    // First validate user exists and is active
    await validateUser(userId);

    const { data: budgets } = await getBudgets(userId, {
      dateRange,
      isActive: true,
    });

    if (!budgets) {
      throw new Error("Failed to fetch budgets");
    }

    return {
      status: 200,
      data: budgets,
    };
  } catch (error) {
    console.error("Error fetching budgets by date range:", error);
    return {
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch budgets by date range",
    };
  }
};
