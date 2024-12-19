import { FirebaseError } from "firebase/app";

// Type for auth error codes
type AuthErrorCode =
  | "auth/email-already-in-use"
  | "auth/invalid-email"
  | "auth/operation-not-allowed"
  | "auth/weak-password"
  | "auth/user-disabled"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-verification-code"
  | "auth/invalid-verification-id"
  | "auth/invalid-credential"
  | "auth/credential-already-in-use"
  | "auth/expired-action-code"
  | "auth/invalid-action-code"
  | "auth/requires-recent-login"
  | "auth/too-many-requests"
  | "auth/network-request-failed"
  | "auth/popup-closed-by-user"
  | "auth/provider-already-linked"
  | "auth/quota-exceeded"
  | "auth/timeout";

// Type for Firestore error codes
type FirestoreErrorCode =
  | "cancelled"
  | "unknown"
  | "invalid-argument"
  | "deadline-exceeded"
  | "not-found"
  | "already-exists"
  | "permission-denied"
  | "resource-exhausted"
  | "failed-precondition"
  | "aborted"
  | "out-of-range"
  | "unimplemented"
  | "internal"
  | "unavailable"
  | "data-loss"
  | "unauthenticated";

// Interface for error response
export interface ErrorResponse {
  title: string;
  message: string;
}

// Auth error messages mapping
const authErrorMessages: Record<AuthErrorCode, ErrorResponse> = {
  "auth/email-already-in-use": {
    title: "Email Already Registered",
    message:
      "This email address is already registered. Please use a different email or try logging in.",
  },
  "auth/invalid-email": {
    title: "Invalid Email",
    message: "Please enter a valid email address.",
  },
  "auth/operation-not-allowed": {
    title: "Operation Not Allowed",
    message: "This operation is not allowed. Please contact support.",
  },
  "auth/weak-password": {
    title: "Weak Password",
    message:
      "Please choose a stronger password. It should be at least 8 characters long.",
  },
  "auth/user-disabled": {
    title: "Account Disabled",
    message: "This account has been disabled. Please contact support.",
  },
  "auth/user-not-found": {
    title: "Invalid Credentials",
    message:
      "The provided credentials are invalid. Please check your email and password",
  },
  "auth/wrong-password": {
    title: "Incorrect Password",
    message: "Incorrect password. Please try again or reset your password.",
  },
  "auth/invalid-verification-code": {
    title: "Invalid Code",
    message: "Invalid verification code. Please try again.",
  },
  "auth/invalid-verification-id": {
    title: "Invalid Verification",
    message: "Invalid verification ID. Please request a new verification code.",
  },
  "auth/invalid-credential": {
    title: "Invalid Credentials",
    message: "The provided credentials are invalid. Please try again.",
  },
  "auth/credential-already-in-use": {
    title: "Credentials In Use",
    message: "These credentials are already associated with another account.",
  },
  "auth/expired-action-code": {
    title: "Link Expired",
    message: "This link has expired. Please request a new one.",
  },
  "auth/invalid-action-code": {
    title: "Invalid Link",
    message: "This link is invalid or has already been used.",
  },
  "auth/requires-recent-login": {
    title: "Re-authentication Required",
    message:
      "This operation requires recent authentication. Please log in again.",
  },
  "auth/too-many-requests": {
    title: "Too Many Attempts",
    message: "Too many unsuccessful attempts. Please try again later.",
  },
  "auth/network-request-failed": {
    title: "Network Error",
    message: "Network error. Please check your internet connection.",
  },
  "auth/popup-closed-by-user": {
    title: "Sign-in Cancelled",
    message: "Sign-in popup was closed before completing. Please try again.",
  },
  "auth/provider-already-linked": {
    title: "Provider Already Linked",
    message: "This account is already linked with another provider.",
  },
  "auth/quota-exceeded": {
    title: "Quota Exceeded",
    message: "Operation quota exceeded. Please try again later.",
  },
  "auth/timeout": {
    title: "Operation Timeout",
    message: "The operation has timed out. Please try again.",
  },
};

// Firestore error messages mapping
const firestoreErrorMessages: Record<FirestoreErrorCode, ErrorResponse> = {
  cancelled: {
    title: "Operation Cancelled",
    message: "The operation was cancelled.",
  },
  unknown: {
    title: "Unknown Error",
    message: "An unknown error occurred. Please try again.",
  },
  "invalid-argument": {
    title: "Invalid Input",
    message: "Invalid input provided. Please check your data.",
  },
  "deadline-exceeded": {
    title: "Operation Timeout",
    message: "The operation timed out. Please try again.",
  },
  "not-found": {
    title: "Not Found",
    message: "The requested resource was not found.",
  },
  "already-exists": {
    title: "Resource Exists",
    message: "The resource already exists.",
  },
  "permission-denied": {
    title: "Permission Denied",
    message: "You don't have permission to perform this action.",
  },
  "resource-exhausted": {
    title: "Resource Exhausted",
    message: "Resource quota has been exceeded. Please try again later.",
  },
  "failed-precondition": {
    title: "Operation Failed",
    message: "The operation failed due to a conflict with current state.",
  },
  aborted: {
    title: "Operation Aborted",
    message: "The operation was aborted.",
  },
  "out-of-range": {
    title: "Invalid Range",
    message: "Operation specified an invalid range.",
  },
  unimplemented: {
    title: "Not Supported",
    message: "This operation is not implemented or supported.",
  },
  internal: {
    title: "Internal Error",
    message: "An internal error occurred. Please try again.",
  },
  unavailable: {
    title: "Service Unavailable",
    message: "The service is currently unavailable. Please try again later.",
  },
  "data-loss": {
    title: "Data Loss",
    message: "Unrecoverable data loss or corruption occurred.",
  },
  unauthenticated: {
    title: "Authentication Required",
    message: "Please sign in to perform this action.",
  },
};

interface ErrorHandlerOptions {
  defaultTitle?: string;
  defaultMessage?: string;
  logError?: boolean;
}

/**
 * Converts Firebase errors into user-friendly messages with titles
 */
export const getFirebaseError = (
  error: unknown,
  options: ErrorHandlerOptions = {},
): ErrorResponse => {
  const {
    defaultTitle = "Error",
    defaultMessage = "An unexpected error occurred. Please try again.",
    logError = true,
  } = options;

  // Log the error if enabled
  if (logError) {
    console.error("Firebase Error:", error);
  }

  // Handle Firebase errors
  if (error instanceof FirebaseError) {
    // Extract the error code without the prefix
    const authCode = error.code as AuthErrorCode;
    const firestoreCode = error.code.replace(
      "firestore/",
      "",
    ) as FirestoreErrorCode;

    // Check for auth errors
    if (authCode in authErrorMessages) {
      return authErrorMessages[authCode];
    }

    // Check for Firestore errors
    if (firestoreCode in firestoreErrorMessages) {
      return firestoreErrorMessages[firestoreCode];
    }

    // If code isn't in our mappings but we have a message from Firebase
    if (error.message) {
      return {
        title: "Firebase Error",
        message: error.message,
      };
    }
  }

  // Handle non-Firebase errors with message property
  if (error instanceof Error) {
    return {
      title: "Error",
      message: error.message,
    };
  }

  // Return default message for unknown errors
  return {
    title: defaultTitle,
    message: defaultMessage,
  };
};

/**
 * Error helper for common Firebase operations
 */
export const FirebaseErrorHandler = {
  // Auth operation helper
  auth: (error: unknown, operation: string): ErrorResponse => {
    return getFirebaseError(error, {
      defaultTitle: `${operation} Error`,
      defaultMessage: `Failed to ${operation.toLowerCase()}. Please try again.`,
    });
  },

  // Firestore operation helper
  firestore: (error: unknown, operation: string): ErrorResponse => {
    return getFirebaseError(error, {
      defaultTitle: `${operation} Error`,
      defaultMessage: `Failed to ${operation.toLowerCase()}. Please try again.`,
    });
  },

  // Generic operation helper
  generic: (error: unknown, operation: string): ErrorResponse => {
    return getFirebaseError(error, {
      defaultTitle: `${operation} Error`,
      defaultMessage: `Failed to ${operation.toLowerCase()}. Please try again.`,
    });
  },
};

// Usage examples:
/*
try {
  // Auth operation
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  const { title, message } = FirebaseErrorHandler.auth(error, 'Sign In');
  // Use with alert/toast:
  // showAlert({ title, message });
  // Example output:
  // title: "Incorrect Password"
  // message: "Incorrect password. Please try again or reset your password."
}

try {
  // Firestore operation
  await addDoc(collection(db, 'users'), userData);
} catch (error) {
  const { title, message } = FirebaseErrorHandler.firestore(error, 'Save User Data');
  // Example output:
  // title: "Permission Denied"
  // message: "You don't have permission to perform this action."
}

// Direct usage
try {
  await someFirebaseOperation();
} catch (error) {
  const { title, message } = getFirebaseError(error, {
    defaultTitle: 'Custom Error Title',
    defaultMessage: 'Custom fallback message',
    logError: true
  });
}
*/
