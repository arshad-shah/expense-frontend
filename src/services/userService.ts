import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type {
  User,
  UserInput,
  Account,
  Transaction,
  Category,
  Budget,
} from "../types";

export const getUser = async (
  userId: string,
  includeRelations: boolean = false
): Promise<User | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  const userData = userSnap.data() as User;

  if (!includeRelations) {
    return {
      id: userSnap.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      currency: userData.currency,
    };
  }

  // Fetch related data
  const [accountsSnap, transactionsSnap, categoriesSnap, budgetsSnap] =
    await Promise.all([
      getDocs(query(collection(db, "accounts"), where("userId", "==", userId))),
      getDocs(
        query(collection(db, "transactions"), where("userId", "==", userId))
      ),
      getDocs(
        query(collection(db, "categories"), where("userId", "==", userId))
      ),
      getDocs(query(collection(db, "budgets"), where("userId", "==", userId))),
    ]);

  return {
    id: userSnap.id,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    currency: userData.currency,
    accounts: accountsSnap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Account)
    ),
    transactions: transactionsSnap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Transaction)
    ),
    categories: categoriesSnap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Category)
    ),
    budgets: budgetsSnap.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Budget)
    ),
  };
};

export const getUserByEmail = async (
  email: string,
  includeRelations: boolean = false
): Promise<User | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const userDoc = querySnapshot.docs[0];
  return getUser(userDoc.id, includeRelations);
};

export const createUser = async (
  userInput: UserInput & { id: string }
): Promise<User> => {
  const user: User = {
    id: userInput.id,
    email: userInput.email,
    firstName: userInput.firstName,
    lastName: userInput.lastName,
    currency: userInput.currency,
  };

  const defaultCategories = [
    // Income Categories
    { name: "Salary", type: "INCOME", icon: "dollar", color: "#4CAF50" },
    {
      name: "Other Income",
      type: "INCOME",
      icon: "plus-circle",
      color: "#8BC34A",
    },
    {
      name: "Investments",
      type: "INCOME",
      icon: "trending-up",
      color: "#66BB6A",
    },
    { name: "Freelance", type: "INCOME", icon: "briefcase", color: "#81C784" },
    { name: "Rental Income", type: "INCOME", icon: "home", color: "#A5D6A7" },

    // Essential Expenses
    {
      name: "Food & Dining",
      type: "EXPENSE",
      icon: "coffee",
      color: "#FF5722",
    },
    {
      name: "Groceries",
      type: "EXPENSE",
      icon: "shopping-cart",
      color: "#FF7043",
    },
    { name: "Transportation", type: "EXPENSE", icon: "car", color: "#2196F3" },
    {
      name: "Bills & Utilities",
      type: "EXPENSE",
      icon: "file-text",
      color: "#607D8B",
    },
    { name: "Rent/Mortgage", type: "EXPENSE", icon: "home", color: "#455A64" },

    // Lifestyle & Shopping
    {
      name: "Shopping",
      type: "EXPENSE",
      icon: "shopping-bag",
      color: "#9C27B0",
    },
    { name: "Entertainment", type: "EXPENSE", icon: "film", color: "#E91E63" },
    {
      name: "Health & Fitness",
      type: "EXPENSE",
      icon: "heart",
      color: "#F44336",
    },
    { name: "Personal Care", type: "EXPENSE", icon: "user", color: "#EC407A" },

    // Services & Education
    { name: "Education", type: "EXPENSE", icon: "book", color: "#3F51B5" },
    {
      name: "Subscriptions",
      type: "EXPENSE",
      icon: "repeat",
      color: "#5C6BC0",
    },
    { name: "Insurance", type: "EXPENSE", icon: "shield", color: "#7986CB" },

    // Savings & Investments
    { name: "Savings", type: "EXPENSE", icon: "piggy-bank", color: "#009688" },
    {
      name: "Investments",
      type: "EXPENSE",
      icon: "bar-chart",
      color: "#26A69A",
    },
    {
      name: "Debt Payment",
      type: "EXPENSE",
      icon: "credit-card",
      color: "#4DB6AC",
    },

    // Miscellaneous
    {
      name: "Gifts & Donations",
      type: "EXPENSE",
      icon: "gift",
      color: "#FFC107",
    },
    { name: "Travel", type: "EXPENSE", icon: "plane", color: "#00BCD4" },
    {
      name: "Others",
      type: "EXPENSE",
      icon: "more-horizontal",
      color: "#9E9E9E",
    },
  ];

  const batch = writeBatch(db);

  // Write the user document
  const userDocRef = doc(db, "users", user.id);
  batch.set(userDocRef, {
    ...user,
    createdAt: new Date().toISOString(),
  });

  // Write default categories with userId
  defaultCategories.forEach((category) => {
    const categoryDocRef = doc(collection(db, "categories"));
    batch.set(categoryDocRef, {
      ...category,
      userId: user.id, // Ensure userId is set
      isDefault: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  });

  await batch.commit();
  return user;
};


export const updateUser = async (
  userId: string,
  updates: Partial<UserInput>
): Promise<void> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteUser = async (userId: string): Promise<void> => {
  // Get all user's data
  const [accountsSnap, transactionsSnap, categoriesSnap, budgetsSnap] =
    await Promise.all([
      getDocs(query(collection(db, "accounts"), where("userId", "==", userId))),
      getDocs(
        query(collection(db, "transactions"), where("userId", "==", userId))
      ),
      getDocs(
        query(collection(db, "categories"), where("userId", "==", userId))
      ),
      getDocs(query(collection(db, "budgets"), where("userId", "==", userId))),
    ]);

  // Delete all related data
  const batch = writeBatch(db);

  accountsSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  transactionsSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  categoriesSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  budgetsSnap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Delete user document
  batch.delete(doc(db, "users", userId));

  await batch.commit();
};

export const getUserStats = async (
  userId: string
): Promise<{
  totalAccounts: number;
  totalTransactions: number;
  totalCategories: number;
  totalBudgets: number;
}> => {
  const [accountsSnap, transactionsSnap, categoriesSnap, budgetsSnap] =
    await Promise.all([
      getDocs(query(collection(db, "accounts"), where("userId", "==", userId))),
      getDocs(
        query(collection(db, "transactions"), where("userId", "==", userId))
      ),
      getDocs(
        query(collection(db, "categories"), where("userId", "==", userId))
      ),
      getDocs(query(collection(db, "budgets"), where("userId", "==", userId))),
    ]);

  return {
    totalAccounts: accountsSnap.size,
    totalTransactions: transactionsSnap.size,
    totalCategories: categoriesSnap.size,
    totalBudgets: budgetsSnap.size,
  };
};
