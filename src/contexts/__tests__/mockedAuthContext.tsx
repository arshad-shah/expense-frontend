import React, { createContext, useContext, useState } from 'react';
import type { User, UserInput } from '@/types';
import { vi } from 'vitest';

// Mock user data
export const mockUser: User = {
  id: 'mock-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  preferences: {
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    budgetStartDay: 1,
    weekStartDay: 'monday',
  },
  stats: {
    totalAccounts: 3,
    totalTransactions: 15,
    totalCategories: 5,
    totalBudgets: 2,
    lastActive: new Date().toISOString(),
    signupDate: new Date().toISOString(),
    monthlySpending: 1000,
    monthlyIncome: 2000,
    savingsRate: 0.5,
    lastCalculated: new Date().toISOString(),
  }, // Add appropriate mock stats here
  isActive: true,
};

// Define mock functions with vi.fn()
export const mockAuthFunctions = {
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  resetPassword: vi.fn(),
  setUser: vi.fn(),
};

// Create mock context value
const createMockContextValue = (
  initialUser: User | null = null,
  loading: boolean = false
) => ({
  user: initialUser,
  loading,
  ...mockAuthFunctions
});

// Create the mock context
export const MockAuthContext = createContext(createMockContextValue());

// Mock provider component
interface MockAuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
  loading?: boolean;
  mockImplementations?: Partial<typeof mockAuthFunctions>;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({
  children,
  initialUser = null,
  loading = false,
  mockImplementations = {}
}) => {
  const [user, setUser] = useState<User | null>(initialUser);

  // Default implementations
  const defaultImplementations = {
    login: async (email: string, password: string, rememberMe?: boolean) => {
      if (email === 'test@example.com' && password === 'password') {
        setUser(mockUser);
      } else {
        throw new Error('Invalid credentials');
      }
    },
    loginWithGoogle: async (rememberMe?: boolean) => {
      setUser(mockUser);
    },
    register: async (userInput: UserInput, password: string) => {
      const newUser: User = {
        ...mockUser,
        ...userInput,
        id: 'new-mock-user-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newUser);
    },
    logout: async () => {
      setUser(null);
    },
    resetPassword: async (email: string) => {
      if (!email.includes('@')) {
        throw new Error('Invalid email');
      }
    },
    setUser: setUser,
  };

  // Combine default implementations with provided mock implementations
  const implementations = {
    ...defaultImplementations,
    ...mockImplementations,
  };

  // Update mock functions with implementations
  Object.keys(implementations).forEach((key) => {
    if (key in mockAuthFunctions) {
      mockAuthFunctions[key as keyof typeof mockAuthFunctions].mockImplementation(
        implementations[key as keyof typeof implementations]
      );
    }
  });

  const contextValue = {
    user,
    loading,
    ...mockAuthFunctions,
  };

  return (
    <MockAuthContext.Provider value={contextValue}>
      {children}
    </MockAuthContext.Provider>
  );
};

// Custom hook for using mock auth context
export const useMockAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
};

// Test helper functions
export const mockAuthSetup = () => {
  const mockFunctions = {
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    setUser: vi.fn(),
  };

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockAuthProvider mockImplementations={mockFunctions}>
      {children}
    </MockAuthProvider>
  );

  return {
    wrapper,
    mockFunctions,
  };
}



export const mockAuthScenarios = {
  authenticated: {
    initialUser: mockUser,
    loading: false,
  },
  unauthenticated: {
    initialUser: null,
    loading: false,
  },
  loading: {
    initialUser: null,
    loading: true,
  },
  error: {
    initialUser: null,
    loading: false,
    mockImplementations: {
      register: async () => {
        throw new Error('Auth error');
      },
      loginWithGoogle: async () => {
        throw new Error('Google auth error');
      },
    },
  },
  networkError: {
    initialUser: null,
    loading: false,
    mockImplementations: {
      register: async () => {
        throw new Error('Network error');
      },
      loginWithGoogle: async () => {
        throw new Error('Network error');
      },
    },
  },
  validationError: {
    initialUser: null,
    loading: false,
    mockImplementations: {
      register: async () => {
        throw new Error('Validation failed');
      },
    },
  },
  serverError: {
    initialUser: null,
    loading: false,
    mockImplementations: {
      register: async () => {
        throw new Error('Internal server error');
      },
      loginWithGoogle: async () => {
        throw new Error('Internal server error');
      },
    },
  },
  throttled: {
    initialUser: null,
    loading: false,
    mockImplementations: {
      register: async () => {
        throw new Error('Too many requests');
      },
      loginWithGoogle: async () => {
        throw new Error('Too many requests');
      },
    },
  },
  timeout: {
    initialUser: null,
    loading: false,
    mockImplementations: {
      register: async () => {
        await new Promise(resolve => setTimeout(resolve, 5000));
        throw new Error('Request timeout');
      },
    },
  },
};
