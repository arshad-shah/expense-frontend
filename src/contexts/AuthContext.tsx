// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { getUser, createUser, updateUserStats } from "../services/userService";
import type { User, UserInput, WeekDay } from "../types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  register: (userInput: UserInput, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createNewUser = async (
    firebaseUser: FirebaseUser,
    additionalData?: Partial<UserInput>,
  ) => {
    const userInput: UserInput & { id: string } = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      firstName:
        additionalData?.firstName ||
        firebaseUser.displayName?.split(" ")[0] ||
        "",
      lastName:
        additionalData?.lastName ||
        firebaseUser.displayName?.split(" ").slice(1).join(" ") ||
        "",
      preferences: {
        currency: additionalData?.preferences?.currency || "USD",
        dateFormat: additionalData?.preferences?.dateFormat || "MM/DD/YYYY",
        budgetStartDay: additionalData?.preferences?.budgetStartDay || 1,
        weekStartDay:
          additionalData?.preferences?.weekStartDay || ("monday" as WeekDay),
      },
    };

    return await createUser(userInput);
  };

  const updateUserActivity = async (userId: string) => {
    await updateUserStats(userId, {
      lastActive: new Date().toISOString(),
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            let userData = await getUser(firebaseUser.uid);

            if (!userData && firebaseUser.email) {
              userData = await createNewUser(firebaseUser);
            }

            if (userData) {
              setUser(userData);
              await updateUserActivity(userData.id);
            }
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
    );

    return unsubscribe;
  }, []);

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
  ) => {
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userData = await getUser(userCredential.user.uid);

      if (!userData) {
        throw new Error("User data not found");
      }

      setUser(userData);
      await updateUserActivity(userData.id);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithGoogle = async (rememberMe: boolean = false) => {
    try {
      await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      let userData = await getUser(userCredential.user.uid);

      if (!userData && userCredential.user.email) {
        userData = await createNewUser(userCredential.user);
      }

      if (!userData) {
        throw new Error("Failed to create or fetch user data");
      }

      setUser(userData);
      await updateUserActivity(userData.id);
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const register = async (userInput: UserInput, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userInput.email,
        password,
      );

      const userData = await createNewUser(userCredential.user, userInput);
      setUser(userData);
      await updateUserActivity(userData.id);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await updateUserActivity(user.id);
      }
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };
  const value = {
    user,
    firebaseUser: auth.currentUser,
    setUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
