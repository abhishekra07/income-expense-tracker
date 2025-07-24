import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    currency: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  type: 'income' | 'expense' | 'both';
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  categoryId: string;
  label?: string;
  paymentMode: 'cash' | 'online';
  proofUrl?: string;
  userId: string;
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  transactions: Transaction[];
  categories: Category[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_DATE_RANGE'; payload: { start: Date; end: Date } }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'UPDATE_USER_PREFERENCES'; payload: User['preferences'] };

const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  transactions: [],
  categories: [
    { id: '1', name: 'Food & Dining', color: '#FF6B6B', type: 'expense' },
    { id: '2', name: 'Bills & Utilities', color: '#4ECDC4', type: 'expense' },
    { id: '3', name: 'Travel', color: '#45B7D1', type: 'expense' },
    { id: '4', name: 'Shopping', color: '#96CEB4', type: 'expense' },
    { id: '5', name: 'Entertainment', color: '#FFEAA7', type: 'expense' },
    { id: '6', name: 'Healthcare', color: '#DDA0DD', type: 'expense' },
    { id: '7', name: 'Salary', color: '#00B894', type: 'income' },
    { id: '8', name: 'Freelance', color: '#00A085', type: 'income' },
    { id: '9', name: 'Investment', color: '#4CAF50', type: 'income' },
    { id: '10', name: 'Other Income', color: '#8BC34A', type: 'income' },
  ],
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  },
};

// Dummy users for authentication
export const dummyUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    preferences: { currency: 'USD', language: 'en', theme: 'light' },
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    password: 'password123',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b626b343?w=150&h=150&fit=crop&crop=face',
    preferences: { currency: 'EUR', language: 'en', theme: 'light' },
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    preferences: { currency: 'GBP', language: 'en', theme: 'dark' },
  },
];

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateRange: action.payload,
      };
    case 'UPDATE_USER_PREFERENCES':
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, preferences: action.payload }
          : null,
      };
    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  saveToLocalStorage: () => void;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('expense-tracker-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Fix date strings
        if (parsedData.dateRange) {
          parsedData.dateRange.start = new Date(parsedData.dateRange.start);
          parsedData.dateRange.end = new Date(parsedData.dateRange.end);
        }
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    } else {
      // Add sample transactions for demo purposes
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          amount: 3000,
          type: 'income',
          description: 'Monthly Salary',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          categoryId: '7',
          paymentMode: 'online',
          userId: '1',
        },
        {
          id: '2',
          amount: 85.5,
          type: 'expense',
          description: 'Grocery Shopping',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          categoryId: '1',
          paymentMode: 'cash',
          userId: '1',
        },
        {
          id: '3',
          amount: 120,
          type: 'expense',
          description: 'Electricity Bill',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          categoryId: '2',
          paymentMode: 'online',
          userId: '1',
        },
        {
          id: '4',
          amount: 500,
          type: 'income',
          description: 'Freelance Project',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          categoryId: '8',
          paymentMode: 'online',
          userId: '1',
        },
        {
          id: '5',
          amount: 45.3,
          type: 'expense',
          description: 'Coffee and Lunch',
          date: new Date().toISOString(),
          categoryId: '1',
          paymentMode: 'cash',
          userId: '1',
        },
      ];

      dispatch({
        type: 'LOAD_DATA',
        payload: { transactions: sampleTransactions },
      });
    }
  }, []);

  // Save to localStorage whenever state changes
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('expense-tracker-data', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  };

  useEffect(() => {
    saveToLocalStorage();
  }, [state]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = dummyUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      dispatch({ type: 'LOGIN', payload: userWithoutPassword });
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AppContext.Provider
      value={{ state, dispatch, login, logout, saveToLocalStorage }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
