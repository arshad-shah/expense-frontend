// src/services/DeleteUserService.ts
import {
  collection,
  writeBatch,
  getDocs,
  query,
  where,
  doc,
} from "firebase/firestore";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
} from "firebase/auth";
import { db } from "../config/firebase";
import type { ApiResponse } from "../types";

/**
 * Re-authenticates a user based on their provider
 */
const reauthorizeUser = async (
  providerId: string,
  password?: string,
): Promise<void> => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser || !currentUser.email) {
    throw new Error("No authenticated user found");
  }

  switch (providerId) {
    case "password": {
      if (!password) {
        throw new Error("Password required for email authentication");
      }
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password,
      );
      await reauthenticateWithCredential(currentUser, credential);
      break;
    }

    case "google.com": {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      break;
    }

    default:
      throw new Error("Unsupported authentication provider");
  }
};

/**
 * Deletes all user data from Firestore and Firebase Auth
 * Handles multiple authentication providers
 */
export const deleteUserAccount = async (
  userId: string,
  password?: string,
): Promise<ApiResponse<void>> => {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return {
        status: 401,
        error: "User not authenticated",
      };
    }

    // Get the user's primary authentication provider
    const providerId = currentUser.providerData[0]?.providerId;
    if (!providerId) {
      return {
        status: 400,
        error: "No authentication provider found",
      };
    }

    // Re-authenticate based on provider
    await reauthorizeUser(providerId, password);

    // Start a batch write for Firestore operations
    const batch = writeBatch(db);

    // Delete accounts and their transactions
    const accountsSnapshot = await getDocs(
      collection(db, `users/${userId}/accounts`),
    );
    for (const accountDoc of accountsSnapshot.docs) {
      // Delete all transactions for this account
      const transactionsSnapshot = await getDocs(
        collection(
          db,
          `users/${userId}/accounts/${accountDoc.id}/transactions`,
        ),
      );
      transactionsSnapshot.docs.forEach((transactionDoc) => {
        batch.delete(transactionDoc.ref);
      });
      batch.delete(accountDoc.ref);
    }

    // Delete budgets
    const budgetsSnapshot = await getDocs(
      collection(db, `users/${userId}/budgets`),
    );
    budgetsSnapshot.docs.forEach((budgetDoc) => {
      batch.delete(budgetDoc.ref);
    });

    // Delete categories
    const categoriesSnapshot = await getDocs(
      collection(db, `users/${userId}/categories`),
    );
    categoriesSnapshot.docs.forEach((categoryDoc) => {
      batch.delete(categoryDoc.ref);
    });

    // Delete email change requests if any
    const emailRequestsSnapshot = await getDocs(
      query(
        collection(db, "emailChangeRequests"),
        where("userId", "==", userId),
      ),
    );
    emailRequestsSnapshot.docs.forEach((requestDoc) => {
      batch.delete(requestDoc.ref);
    });

    // Delete user document
    batch.delete(doc(db, "users", userId));

    // Commit all Firestore deletions
    await batch.commit();

    // Finally, delete the user from Firebase Auth
    await deleteUser(currentUser);

    return {
      status: 200,
      message: "Account successfully deleted",
    };
  } catch (error) {
    console.error("Error deleting user account:", error);
    return {
      status: 500,
      error:
        error instanceof Error ? error.message : "Failed to delete account",
    };
  }
};
