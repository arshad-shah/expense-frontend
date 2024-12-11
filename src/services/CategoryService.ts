import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc as firestoreDoc,
  getDoc,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  Category,
  CategoryInput,
  Transaction,
  User,
  CategoryType,
} from "../types";

export const getCategories = async (
  userId: string,
  includeTransactions: boolean = false
): Promise<Category[]> => {
  const categoriesRef = collection(db, "categories");
  const q = query(
    categoriesRef,
    where("userId", "==", userId),
    where("isActive", "==", true),
    orderBy("name")
  );

  const querySnapshot = await getDocs(q);
  const categories: Category[] = [];

  for (const doc of querySnapshot.docs) {
    const data = doc.data();

    // Get user data
    const userDoc = await getDoc(firestoreDoc(db, "users", data.userId));

    let transactions: Transaction[] | undefined;
    if (includeTransactions) {
      // Get transactions for this category
      const transactionsSnapshot = await getDocs(
        query(
          collection(db, "transactions"),
          where("categoryId", "==", doc.id),
          orderBy("transactionDate", "desc")
        )
      );
      transactions = transactionsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Transaction)
      );
    }

    categories.push({
      id: doc.id,
      user: userDoc.data() as User,
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      isDefault: data.isDefault || false,
      isActive: data.isActive,
      transactions,
    } as Category);
  }

  return categories;
};

export const getCategoryById = async (
  categoryId: string,
  includeTransactions: boolean = false
): Promise<Category | null> => {
  const categoryDoc = await getDoc(firestoreDoc(db, "categories", categoryId));

  if (!categoryDoc.exists()) {
    return null;
  }

  const data = categoryDoc.data();

  // Get user data
  const userDoc = await getDoc(firestoreDoc(db, "users", data.userId));

  let transactions: Transaction[] | undefined;
  if (includeTransactions) {
    // Get transactions for this category
    const transactionsSnapshot = await getDocs(
      query(
        collection(db, "transactions"),
        where("categoryId", "==", categoryId),
        orderBy("transactionDate", "desc")
      )
    );
    transactions = transactionsSnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Transaction)
    );
  }

  return {
    id: categoryDoc.id,
    user: userDoc.data() as User,
    name: data.name,
    type: data.type,
    icon: data.icon,
    color: data.color,
    isDefault: data.isDefault || false,
    isActive: data.isActive,
    transactions,
  } as Category;
};

export const getCategoriesByType = async (
  userId: string,
  type: CategoryType
): Promise<Category[]> => {
  const categoriesRef = collection(db, "categories");
  const q = query(
    categoriesRef,
    where("userId", "==", userId),
    where("type", "==", type),
    where("isActive", "==", true),
    orderBy("name")
  );

  const querySnapshot = await getDocs(q);
  const categories: Category[] = [];

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const userDoc = await getDoc(firestoreDoc(db, "users", data.userId));

    categories.push({
      id: doc.id,
      user: userDoc.data() as User,
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      isDefault: data.isDefault || false,
      isActive: data.isActive,
    } as Category);
  }

  return categories;
};

export const getDefaultCategories = async (
  userId: string
): Promise<Category[]> => {
  const categoriesRef = collection(db, "categories");
  const q = query(
    categoriesRef,
    where("userId", "==", userId),
    where("isDefault", "==", true),
    where("isActive", "==", true)
  );

  const querySnapshot = await getDocs(q);
  const categories: Category[] = [];

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const userDoc = await getDoc(firestoreDoc(db, "users", data.userId));

    categories.push({
      id: doc.id,
      user: userDoc.data() as User,
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      isDefault: true,
      isActive: true,
    } as Category);
  }

  return categories;
};

export const createCategory = async (
  categoryInput: CategoryInput
): Promise<Category> => {
  // Check if default category with same name exists
  if (!categoryInput.isDefault) {
    const existingQuery = query(
      collection(db, "categories"),
      where("userId", "==", categoryInput.userId),
      where("name", "==", categoryInput.name),
      where("isActive", "==", true)
    );
    const existing = await getDocs(existingQuery);
    if (!existing.empty) {
      throw new Error(
        `Category with name "${categoryInput.name}" already exists`
      );
    }
  }

  const categoryRef = await addDoc(collection(db, "categories"), {
    ...categoryInput,
    isActive: true,
    isDefault: categoryInput.isDefault || false,
    createdAt: new Date().toISOString(),
  });

  return getCategoryById(categoryRef.id) as Promise<Category>;
};

export const updateCategory = async (
  categoryId: string,
  updates: Partial<Category>
): Promise<void> => {
  const categoryRef = firestoreDoc(db, "categories", categoryId);
  const categoryDoc = await getDoc(categoryRef);

  if (!categoryDoc.exists()) {
    throw new Error("Category not found");
  }

  const currentData = categoryDoc.data();

  // Don't allow modification of default categories except for color and icon
  if (currentData.isDefault) {
    const allowedUpdates = ["color", "icon"];
    const attemptedUpdates = Object.keys(updates);
    const invalidUpdates = attemptedUpdates.filter(
      (update) => !allowedUpdates.includes(update)
    );

    if (invalidUpdates.length > 0) {
      throw new Error(
        `Cannot modify ${invalidUpdates.join(", ")} of default category`
      );
    }
  }

  // Check for name conflicts if name is being updated
  if (updates.name) {
    const existingQuery = query(
      collection(db, "categories"),
      where("userId", "==", currentData.userId),
      where("name", "==", updates.name),
      where("isActive", "==", true)
    );
    const existing = await getDocs(existingQuery);
    if (!existing.empty && existing.docs[0].id !== categoryId) {
      throw new Error(`Category with name "${updates.name}" already exists`);
    }
  }

  await updateDoc(categoryRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Get category data
  const categoryRef = firestoreDoc(db, "categories", categoryId);
  const categoryDoc = await getDoc(categoryRef);

  if (!categoryDoc.exists()) {
    throw new Error("Category not found");
  }

  const categoryData = categoryDoc.data();

  // Don't allow deletion of default categories
  if (categoryData.isDefault) {
    throw new Error("Cannot delete default category");
  }

  // Soft delete the category
  batch.update(categoryRef, {
    isActive: false,
    deletedAt: new Date().toISOString(),
  });

  // Get all transactions with this category
  const transactionsSnapshot = await getDocs(
    query(collection(db, "transactions"), where("categoryId", "==", categoryId))
  );

  // Get default category of the same type
  const defaultCategorySnapshot = await getDocs(
    query(
      collection(db, "categories"),
      where("userId", "==", categoryData.userId),
      where("type", "==", categoryData.type),
      where("isDefault", "==", true),
      where("isActive", "==", true)
    )
  );

  if (defaultCategorySnapshot.empty) {
    throw new Error("No default category found for transaction reassignment");
  }

  const defaultCategoryId = defaultCategorySnapshot.docs[0].id;

  // Reassign all transactions to the default category
  transactionsSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { categoryId: defaultCategoryId });
  });

  await batch.commit();
};
