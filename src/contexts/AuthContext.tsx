// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUser, createUser } from '../services/userService';
import type { User, UserInput, WeekDay } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  register: (userInput: UserInput, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userData = await getUser(firebaseUser.uid);
          if (userData) {
            setUser(userData);
          } else if (firebaseUser.email) {
            const newUser = await createUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              currency: 'USD',
              dateFormat: 'MM/DD/YYYY',
              budgetStartDay: 1,
              weekStartDay: "monday" as WeekDay,
            });
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      // Set persistence based on rememberMe flag
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getUser(userCredential.user.uid);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (rememberMe: boolean = false) => {
    try {
      // Set persistence based on rememberMe flag
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const existingUser = await getUser(userCredential.user.uid);
      
      if (!existingUser && userCredential.user.email) {
        const newUser = await createUser({
              id: userCredential.user.uid,
              email: userCredential.user.email,
              firstName: userCredential.user.displayName?.split(' ')[0] || '',
              lastName: userCredential.user.displayName?.split(' ').slice(1).join(' ') || '',
              currency: 'USD',
              dateFormat: 'MM/DD/YYYY',
              budgetStartDay: 1,
              weekStartDay: "monday" as WeekDay,
            });
        setUser(newUser);
      } else {
        setUser(existingUser);
      }
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const register = async (userInput: UserInput, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userInput.email,
      password
    );
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    const userData = await createUser({
      ...userInput,
      id: userCredential.user.uid,
    });
    setUser(userData);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
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