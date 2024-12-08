import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc as firestoreDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  Budget,
  BudgetInput,
  BudgetCategory,
  BudgetFilters,
  User,
  Category,
} from "../types";

export const getBudgets = async (
  userId: string,
  filters?: BudgetFilters
): Promise<Budget[]> => {
  let q = query(collection(db, "budgets"), where("userId", "==", userId));

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

  const querySnapshot = await getDocs(q);
  const budgets: Budget[] = [];

  for (const doc of querySnapshot.docs) {
    const data = doc.data();

    // Get user data
    const userDoc = await getDoc(firestoreDoc(db, "users", data.userId));

    // Get budget categories
    const categoriesSnapshot = await getDocs(
      query(
        collection(db, "budgetCategories"),
        where("budget.id", "==", doc.id)
      )
    );

    const categories = await Promise.all(
      categoriesSnapshot.docs.map(async (categoryDoc) => {
        const categoryData = categoryDoc.data();
        const categoryRef = await getDoc(
          firestoreDoc(db, "categories", categoryData.category.id)
        );

        return {
          budget: { id: doc.id, ...data },
          category: categoryRef.data() as Category,
          allocatedAmount: categoryData.allocatedAmount,
          spentAmount: categoryData.spentAmount || 0,
        } as BudgetCategory;
      })
    );

    budgets.push({
      id: doc.id,
      user: userDoc.data() as User,
      name: data.name,
      amount: data.amount,
      period: data.period,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive,
      categories: categories,
    } as Budget);
  }

  return budgets;
};

export const getBudgetById = async (
  budgetId: string
): Promise<Budget | null> => {
  const budgetDoc = await getDoc(firestoreDoc(db, "budgets", budgetId));

  if (!budgetDoc.exists()) {
    return null;
  }

  const data = budgetDoc.data();

  // Get user data
  const userDoc = await getDoc(firestoreDoc(db, "users", data.userId));

  // Get budget categories
  const categoriesSnapshot = await getDocs(
    query(
      collection(db, "budgetCategories"),
      where("budget.id", "==", budgetId)
    )
  );

  const categories = await Promise.all(
    categoriesSnapshot.docs.map(async (categoryDoc) => {
      const categoryData = categoryDoc.data();
      const categoryRef = await getDoc(
        firestoreDoc(db, "categories", categoryData.category.id)
      );

      return {
        budget: { id: budgetId, ...data },
        category: categoryRef.data() as Category,
        allocatedAmount: categoryData.allocatedAmount,
        spentAmount: categoryData.spentAmount || 0,
      } as BudgetCategory;
    })
  );

  return {
    id: budgetDoc.id,
    user: userDoc.data() as User,
    name: data.name,
    amount: data.amount,
    period: data.period,
    startDate: data.startDate,
    endDate: data.endDate,
    isActive: data.isActive,
    categories: categories,
  } as Budget;
};

export const createBudget = async (
  budgetInput: BudgetInput,
  categories: { categoryId: string; allocatedAmount: number }[]
): Promise<Budget> => {
  const batch = writeBatch(db);

  // Create budget document
  const budgetRef = firestoreDoc(collection(db, "budgets"));
  const budget = {
    ...budgetInput,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  batch.set(budgetRef, budget);

  // Create budget categories
  for (const category of categories) {
    const categoryRef = firestoreDoc(collection(db, "budgetCategories"));
    batch.set(categoryRef, {
      budget: { id: budgetRef.id },
      category: { id: category.categoryId },
      allocatedAmount: category.allocatedAmount,
      spentAmount: 0,
    });
  }

  await batch.commit();

  return getBudgetById(budgetRef.id) as Promise<Budget>;
};

export const updateBudget = async (
  budgetId: string,
  updates: Partial<Budget>,
  categoryUpdates?: { categoryId: string; allocatedAmount: number }[]
): Promise<void> => {
  const batch = writeBatch(db);

  // Update budget document
  const budgetRef = firestoreDoc(db, "budgets", budgetId);
  batch.update(budgetRef, updates);

  if (categoryUpdates) {
    // Get existing categories
    const categoriesSnapshot = await getDocs(
      query(
        collection(db, "budgetCategories"),
        where("budget.id", "==", budgetId)
      )
    );

    // Delete existing categories
    categoriesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Create new categories
    for (const category of categoryUpdates) {
      const categoryRef = firestoreDoc(collection(db, "budgetCategories"));
      batch.set(categoryRef, {
        budget: { id: budgetId },
        category: { id: category.categoryId },
        allocatedAmount: category.allocatedAmount,
        spentAmount: 0,
      });
    }
  }

  await batch.commit();
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Soft delete budget
  const budgetRef = firestoreDoc(db, "budgets", budgetId);
  batch.update(budgetRef, { isActive: false });

  // Delete budget categories
  const categoriesSnapshot = await getDocs(
    query(
      collection(db, "budgetCategories"),
      where("budget.id", "==", budgetId)
    )
  );

  categoriesSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

export const updateBudgetCategorySpending = async (
  budgetId: string,
  categoryId: string,
  spentAmount: number
): Promise<void> => {
  const categoriesSnapshot = await getDocs(
    query(
      collection(db, "budgetCategories"),
      where("budget.id", "==", budgetId),
      where("category.id", "==", categoryId)
    )
  );

  if (!categoriesSnapshot.empty) {
    const categoryDoc = categoriesSnapshot.docs[0];
    await updateDoc(categoryDoc.ref, { spentAmount });
  }
};

export const getBudgetCategories = async (
  budgetId: string
): Promise<BudgetCategory[]> => {
  const categoriesSnapshot = await getDocs(
    query(
      collection(db, "budgetCategories"),
      where("budget.id", "==", budgetId)
    )
  );

  const budgetDoc = await getDoc(firestoreDoc(db, "budgets", budgetId));
  if (!budgetDoc.exists()) {
    return [];
  }

  return Promise.all(
    categoriesSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const categoryRef = await getDoc(firestoreDoc(db, "categories", data.category.id));

      return {
        budget: { id: budgetId, ...budgetDoc.data() },
        category: categoryRef.data() as Category,
        allocatedAmount: data.allocatedAmount,
        spentAmount: data.spentAmount || 0,
      } as BudgetCategory;
    })
  );
};
