// src/services/userService.ts
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  increment,
  writeBatch,
  collection,
  getDocs,
} from "firebase/firestore";
import { createDefaultCategories } from "./categoryDefaults";
import { db } from "../config/firebase";
import {
  type User,
  type UserInput,
  type UserStats,
  type UserPreferences,
  type ApiResponse,
  type Category,
  CollectionPaths,
} from "../types";

const DEFAULT_USER_STATS: UserStats = {
  totalAccounts: 0,
  totalTransactions: 0,
  totalCategories: 16,
  totalBudgets: 0,
  lastActive: new Date().toISOString(),
  signupDate: new Date().toISOString(),
  monthlySpending: 0,
  monthlyIncome: 0,
  savingsRate: 0,
  lastCalculated: serverTimestamp(),
};

/**
 * Creates a new user document in Firestore
 */
export const createUser = async (
  userInput: UserInput & { id: string }
): Promise<User> => {
  try {
    // Start a batch write
    const batch = writeBatch(db);
    const userRef = doc(db, "users", userInput.id);

    const newUser: User = {
      id: userInput.id,
      email: userInput.email,
      firstName: userInput.firstName,
      lastName: userInput.lastName,
      preferences: {
        currency: userInput.preferences.currency,
        dateFormat: userInput.preferences.dateFormat,
        budgetStartDay: userInput.preferences.budgetStartDay,
        weekStartDay: userInput.preferences.weekStartDay,
      },
      stats: DEFAULT_USER_STATS,
      createdAt: serverTimestamp(),
      isActive: true,
    };

    // Add user document to batch
    batch.set(userRef, newUser);

    // Commit the batch
    await batch.commit();

    // Create default categories
    await createDefaultCategories(userInput.id);

    // Convert serverTimestamp back to string for frontend use
    return {
      ...newUser,
      createdAt: new Date().toISOString(),
      stats: {
        ...DEFAULT_USER_STATS,
        lastCalculated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

/**
 * Retrieves a user document from Firestore
 */
export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const userData = userSnap.data() as User;
    return {
      ...userData,
      id: userSnap.id,
      createdAt: userData.createdAt.toString(),
      updatedAt: userData.updatedAt?.toString(),
      deletedAt: userData.deletedAt?.toString(),
      stats: {
        ...userData.stats,
        lastCalculated: userData.stats.lastCalculated.toString(),
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user");
  }
};

/**
 * Updates a user's profile information
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserInput>
): Promise<ApiResponse<User>> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        status: 404,
        error: "User not found",
      };
    }

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);

    const updatedUser = await getUser(userId);
    if (!updatedUser) {
      throw new Error("Failed to fetch updated user");
    }

    return {
      status: 200,
      data: updatedUser,
      message: "User profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      status: 500,
      error: "Failed to update user profile",
    };
  }
};

/**
 * Updates user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<ApiResponse<UserPreferences>> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        status: 404,
        error: "User not found",
      };
    }

    const currentPrefs = userSnap.data()?.preferences || {};

    await updateDoc(userRef, {
      preferences: {
        ...currentPrefs,
        ...preferences,
      },
      updatedAt: serverTimestamp(),
    });

    const updatedUser = await getUser(userId);
    if (!updatedUser) {
      throw new Error("Failed to fetch updated user preferences");
    }

    return {
      status: 200,
      data: updatedUser.preferences,
      message: "User preferences updated successfully",
    };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return {
      status: 500,
      error: "Failed to update user preferences",
    };
  }
};

/**
 * Updates user statistics
 */
export const updateUserStats = async (
  userId: string,
  statsUpdate: Partial<UserStats>
): Promise<ApiResponse<UserStats>> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        status: 404,
        error: "User not found",
      };
    }

    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
      "stats.lastCalculated": serverTimestamp(),
    };

    // Handle atomic updates for numerical fields
    if (typeof statsUpdate.totalAccounts === "number") {
      updates["stats.totalAccounts"] = increment(statsUpdate.totalAccounts);
    }
    if (typeof statsUpdate.totalTransactions === "number") {
      updates["stats.totalTransactions"] = increment(
        statsUpdate.totalTransactions
      );
    }
    if (typeof statsUpdate.totalCategories === "number") {
      updates["stats.totalCategories"] = increment(statsUpdate.totalCategories);
    }
    if (typeof statsUpdate.totalBudgets === "number") {
      updates["stats.totalBudgets"] = increment(statsUpdate.totalBudgets);
    }

    // Handle direct updates for other fields
    if (statsUpdate.monthlySpending !== undefined) {
      updates["stats.monthlySpending"] = statsUpdate.monthlySpending;
    }
    if (statsUpdate.monthlyIncome !== undefined) {
      updates["stats.monthlyIncome"] = statsUpdate.monthlyIncome;
    }
    if (statsUpdate.savingsRate !== undefined) {
      updates["stats.savingsRate"] = statsUpdate.savingsRate;
    }
    if (statsUpdate.lastActive) {
      updates["stats.lastActive"] = statsUpdate.lastActive;
    }

    await updateDoc(userRef, updates);

    const updatedUser = await getUser(userId);
    if (!updatedUser) {
      throw new Error("Failed to fetch updated user stats");
    }

    return {
      status: 200,
      data: updatedUser.stats,
      message: "User stats updated successfully",
    };
  } catch (error) {
    console.error("Error updating user stats:", error);
    return {
      status: 500,
      error: "Failed to update user stats",
    };
  }
};

/**
 * Deactivates a user account (soft delete)
 */
export const deactivateUser = async (
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        status: 404,
        error: "User not found",
      };
    }

    await updateDoc(userRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      status: 200,
      message: "User deactivated successfully",
    };
  } catch (error) {
    console.error("Error deactivating user:", error);
    return {
      status: 500,
      error: "Failed to deactivate user",
    };
  }
};

/**
 * Reactivates a previously deactivated user account
 */
export const reactivateUser = async (
  userId: string
): Promise<ApiResponse<User>> => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        status: 404,
        error: "User not found",
      };
    }

    await updateDoc(userRef, {
      isActive: true,
      deletedAt: null,
      updatedAt: serverTimestamp(),
    });

    const updatedUser = await getUser(userId);
    if (!updatedUser) {
      throw new Error("Failed to fetch reactivated user");
    }

    return {
      status: 200,
      data: updatedUser,
      message: "User reactivated successfully",
    };
  } catch (error) {
    console.error("Error reactivating user:", error);
    return {
      status: 500,
      error: "Failed to reactivate user",
    };
  }
};
// get the categories
/**
 * Retrieves a list of categories for the specified user
 * @param userId - The ID of the user
 * @param options - Optional filtering parameters
 * @returns ApiResponse containing an array of categories
 */
export const getCategories = async (
  userId: string,
): Promise<ApiResponse<Category[]>> => {
  try {
    const docSnap = await getDocs(collection(db, CollectionPaths.categories(userId)));
    const categories: Category[] = [];
    docSnap.forEach((doc) => {
      const categoryData = doc.data() as Category;
      categories.push({
        ...categoryData,
        id: doc.id,
        createdAt: categoryData.createdAt.toString(),
        updatedAt: categoryData.updatedAt?.toString(),
        deletedAt: categoryData.deletedAt?.toString(),
      });
    });
    return {
      status: 200,
      data: categories,
      message: `Retrieved ${categories.length} categories successfully`
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      status: 500,
      error: 'Failed to fetch categories'
    };
  }
};


// get categories for given ids
/**
 * Retrieves a list of categories for the specified user
 * @param userId - The ID of the user
 * @param categoryIds - An array of category IDs to fetch
 * @returns ApiResponse containing an array of categories
 */
export const getCategoriesByIds = async (
  userId: string,
  categoryIds: string[]
): Promise<ApiResponse<Category[]>> => {
  try {
    const categories: Category[] = [];

    for (const categoryId of categoryIds) {
      const categoryRef = doc(db, CollectionPaths.categories(userId), categoryId);
      const categorySnap = await getDoc(categoryRef);

      if (categorySnap.exists()) {
        const categoryData = categorySnap.data() as Category;
        categories.push({
          ...categoryData,
          id: categorySnap.id,
          createdAt: categoryData.createdAt.toString(),
          updatedAt: categoryData.updatedAt?.toString(),
          deletedAt: categoryData.deletedAt?.toString(),
        });
      }
    }

    return {
      status: 200,
      data: categories,
      message: `Retrieved ${categories.length} categories successfully`
    };
  } catch (error) {
    console.error('Error fetching categories by IDs:', error);
    return {
      status: 500,
      error: 'Failed to fetch categories by IDs'
    };
  }
};