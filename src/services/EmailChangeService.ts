import { 
  updateEmail, 
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  updateDoc, 
  serverTimestamp, 
  collection,
  addDoc,
  where,
  query,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { updateUserProfile } from './userService';
import type { ApiResponse } from '../types';
import { FirebaseErrorHandler } from '@/lib/firebase-error-handler';

interface EmailChangeRequest {
  userId: string;
  oldEmail: string;
  newEmail: string;
  status: 'pending' | 'verified';
  createdAt: any;
  expiresAt: any;
}

/**
 * Checks if the user is using email/password authentication
 * @param user - Firebase user object
 * @returns boolean indicating if user is using email auth
 */
const isEmailAuthUser = (user: FirebaseUser): boolean => {
  const providers = user.providerData.map(provider => provider.providerId);
  return providers.includes('password');
};

/**
 * Initiates email change process
 * @param newEmail - The new email address
 * @param currentPassword - User's current password for reauthentication
 */
export const initiateEmailChange = async (
  newEmail: string,
  currentPassword: string
): Promise<ApiResponse<void>> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return {
        status: 401,
        error: 'User not authenticated'
      };
    }

    // Check if user is using email/password authentication
    if (!isEmailAuthUser(currentUser)) {
      return {
        status: 400,
        error: 'Email change is only available for email/password accounts. Please manage your email through your authentication provider.'
      };
    }

    // First, reauthenticate the user
    const credential = EmailAuthProvider.credential(
      currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(currentUser, credential);

    // Check if there's already a pending request
    const pendingRequests = await getDocs(
      query(
        collection(db, 'emailChangeRequests'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'pending')
      )
    );

    // Delete any existing pending requests
    const batch = pendingRequests.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(batch);

    // Create new email change request
    const emailChangeRequest: EmailChangeRequest = {
      userId: currentUser.uid,
      oldEmail: currentUser.email,
      newEmail,
      status: 'pending',
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    // Save the request
    await addDoc(collection(db, 'emailChangeRequests'), emailChangeRequest);

    // Update email in Firebase Auth
    await updateEmail(currentUser, newEmail);
    
    // Send verification email
    await sendEmailVerification(currentUser, {
      url: `${window.location.origin}/verify-email?newEmail=${encodeURIComponent(newEmail)}`,
      handleCodeInApp: true
    });

    return {
      status: 200,
      message: 'Verification email sent to new address'
    };
  } catch (error) {
    console.error('Error initiating email change:', error);
    const errorMessage = FirebaseErrorHandler.auth(error, 'change email');
    return {
      status: 500,
      error: errorMessage.message || 'Failed to initiate email change'
    };
  }
};

/**
 * Completes the email change process after verification
 * @param userId - The user's ID
 * @param newEmail - The new verified email address
 */
export const completeEmailChange = async (
  userId: string,
  newEmail: string
): Promise<ApiResponse<void>> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !isEmailAuthUser(currentUser)) {
      return {
        status: 400,
        error: 'Email change is only available for email/password accounts'
      };
    }

    // Find the pending request
    const requestsSnapshot = await getDocs(
      query(
        collection(db, 'emailChangeRequests'),
        where('userId', '==', userId),
        where('newEmail', '==', newEmail),
        where('status', '==', 'pending')
      )
    );

    if (requestsSnapshot.empty) {
      return {
        status: 404,
        error: 'No pending email change request found'
      };
    }

    const requestDoc = requestsSnapshot.docs[0];
    const request = requestDoc.data() as EmailChangeRequest;

    // Check if request has expired
    if (request.expiresAt.toDate() < new Date()) {
      await deleteDoc(requestDoc.ref);
      return {
        status: 400,
        error: 'Email change request has expired'
      };
    }

    // Update user profile in Firestore
    await updateUserProfile(userId, { email: newEmail });

    // Update request status
    await updateDoc(requestDoc.ref, {
      status: 'verified',
      updatedAt: serverTimestamp()
    });

    return {
      status: 200,
      message: 'Email change completed successfully'
    };
  } catch (error) {
    console.error('Error completing email change:', error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to complete email change'
    };
  }
};

/**
 * Cancels a pending email change request
 * @param userId - The user's ID
 */
export const cancelEmailChange = async (
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !isEmailAuthUser(currentUser)) {
      return {
        status: 400,
        error: 'Email change is only available for email/password accounts'
      };
    }

    const requestsSnapshot = await getDocs(
      query(
        collection(db, 'emailChangeRequests'),
        where('userId', '==', userId),
        where('status', '==', 'pending')
      )
    );

    if (!requestsSnapshot.empty) {
      const batch = requestsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(batch);
    }

    return {
      status: 200,
      message: 'Email change request cancelled'
    };
  } catch (error) {
    console.error('Error cancelling email change:', error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Failed to cancel email change'
    };
  }
};