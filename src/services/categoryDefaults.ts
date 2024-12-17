// src/services/categoryDefaults.ts
import {
  collection,
  writeBatch,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { Category, CategoryInput, CategoryType } from "../types";

// Default expense categories
const DEFAULT_EXPENSE_CATEGORIES: Partial<CategoryInput>[] = [
  {
    name: "Housing",
    type: "EXPENSE",
    icon: "home",
    color: "#4A5568",
    isDefault: true,
  },
  {
    name: "Transportation",
    type: "EXPENSE",
    icon: "car",
    color: "#3182CE",
    isDefault: true,
  },
  {
    name: "Food & Dining",
    type: "EXPENSE",
    icon: "utensils",
    color: "#48BB78",
    isDefault: true,
  },
  {
    name: "Shopping",
    type: "EXPENSE",
    icon: "shopping-bag",
    color: "#ED64A6",
    isDefault: true,
  },
  {
    name: "Entertainment",
    type: "EXPENSE",
    icon: "film",
    color: "#9F7AEA",
    isDefault: true,
  },
  {
    name: "Healthcare",
    type: "EXPENSE",
    icon: "heart",
    color: "#F56565",
    isDefault: true,
  },
  {
    name: "Education",
    type: "EXPENSE",
    icon: "book",
    color: "#ECC94B",
    isDefault: true,
  },
  {
    name: "Personal Care",
    type: "EXPENSE",
    icon: "smile",
    color: "#B794F4",
    isDefault: true,
  },
  {
    name: "Bills & Utilities",
    type: "EXPENSE",
    icon: "file-text",
    color: "#4299E1",
    isDefault: true,
  },
  {
    name: "Insurance",
    type: "EXPENSE",
    icon: "shield",
    color: "#48BB78",
    isDefault: true,
  },
  {
    name: "Other Expenses",
    type: "EXPENSE",
    icon: "more-horizontal",
    color: "#718096",
    isDefault: true,
  },
  {
    name: "Subscription",
    type: "EXPENSE",
    icon: "credit-card",
    color: "#E53E3E",
    isDefault: true,
  },
];

// Default income categories
const DEFAULT_INCOME_CATEGORIES: Partial<CategoryInput>[] = [
  {
    name: "Salary",
    type: "INCOME",
    icon: "dollar-sign",
    color: "#38A169",
    isDefault: true,
  },
  {
    name: "Investments",
    type: "INCOME",
    icon: "trending-up",
    color: "#2B6CB0",
    isDefault: true,
  },
  {
    name: "Freelance",
    type: "INCOME",
    icon: "briefcase",
    color: "#805AD5",
    isDefault: true,
  },
  {
    name: "Gifts",
    type: "INCOME",
    icon: "gift",
    color: "#D53F8C",
    isDefault: true,
  },
  {
    name: "Other Income",
    type: "INCOME",
    icon: "plus-circle",
    color: "#718096",
    isDefault: true,
  },
];

/**
 * Creates a category document in Firestore
 */
const createCategory = async (
  userId: string,
  categoryInput: Partial<CategoryInput>
): Promise<Partial<Category>> => {
  return {
    ...categoryInput,
    userId,
    createdAt: serverTimestamp(),
    isActive: true,
  };
};

/**
 * Creates all default categories for a new user
 */
export const createDefaultCategories = async (
  userId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const categoriesRef = collection(db, `users/${userId}/categories`);

    // Create expense categories
    for (const category of DEFAULT_EXPENSE_CATEGORIES) {
      const categoryId = `${category.type}_${category.name
        ?.replace(/\s+/g, "_")
        .toLowerCase()}`;
      const categoryRef = doc(categoriesRef, categoryId);
      const newCategory = await createCategory(userId, category);
      batch.set(categoryRef, newCategory);
    }

    // Create income categories
    for (const category of DEFAULT_INCOME_CATEGORIES) {
      const categoryId = `${category.type}_${category.name
        ?.replace(/\s+/g, "_")
        .toLowerCase()}`;
      const categoryRef = doc(categoriesRef, categoryId);
      const newCategory = await createCategory(userId, category);
      batch.set(categoryRef, newCategory);
    }

    await batch.commit();
  } catch (error) {
    console.error("Error creating default categories:", error);
    throw new Error("Failed to create default categories");
  }
};

/**
 * Get default categories by type
 */
export const getDefaultCategories = (type: CategoryType) => {
  return type === "EXPENSE"
    ? DEFAULT_EXPENSE_CATEGORIES
    : DEFAULT_INCOME_CATEGORIES;
};
