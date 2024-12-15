// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { updateUserProfile, updateUserPreferences, updateUserStats, getUser } from '../services/userService';
import type { 
  User, 
  UserPreferences, 
  UserStats, 
  UserInput,
  ApiResponse 
} from '../types';

interface UserContextType {
  updateProfile: (updates: Partial<UserInput>) => Promise<ApiResponse<User>>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<ApiResponse<UserPreferences>>;
  updateStats: (stats: Partial<UserStats>) => Promise<ApiResponse<UserStats>>;
  isUpdating: boolean;
}

const UserContext = createContext<UserContextType>({} as UserContextType);

export const useUser = () => useContext(UserContext);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshUser = useCallback(async (userId: string) => {
    try {
      setIsUpdating(true);
      const refreshedUser = await getUser(userId);
      if (refreshedUser) {
        setUser(refreshedUser);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [setUser]);

  const updateProfile = useCallback(async (updates: Partial<UserInput>) => {
    if (!user) {
      return {
        status: 401,
        error: 'User not authenticated'
      };
    }

    setIsUpdating(true);
    try {
      const response = await updateUserProfile(user.id, updates);
      if (response.status === 200 && response.data) {
        setUser(response.data);
      } else {
        await refreshUser(user.id);
      }
      return response;
    } finally {
      setIsUpdating(false);
    }
  }, [user, setUser, refreshUser]);

  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (!user) {
      return {
        status: 401,
        error: 'User not authenticated'
      };
    }

    setIsUpdating(true);
    try {
      const response = await updateUserPreferences(user.id, preferences);
      if (response.status === 200 && response.data) {
        setUser(prev => prev ? {
          ...prev,
          preferences: {
            ...prev.preferences,
            ...response.data
          }
        } : null);
      } else {
        await refreshUser(user.id);
      }
      return response;
    } finally {
      setIsUpdating(false);
    }
  }, [user, setUser, refreshUser]);

  const updateStats = useCallback(async (stats: Partial<UserStats>) => {
    if (!user) {
      return {
        status: 401,
        error: 'User not authenticated'
      };
    }

    setIsUpdating(true);
    try {
      const response = await updateUserStats(user.id, stats);
      if (response.status === 200 && response.data) {
        setUser(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            ...response.data
          }
        } : null);
      } else {
        await refreshUser(user.id);
      }
      return response;
    } finally {
      setIsUpdating(false);
    }
  }, [user, setUser, refreshUser]);

  const value = {
    updateProfile,
    updatePreferences,
    updateStats,
    isUpdating
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;