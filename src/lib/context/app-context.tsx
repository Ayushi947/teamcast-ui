'use client';

import { IAuthToken, IAuthUser } from '@/lib/shared';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useLayoutEffect,
} from 'react';
import { logger } from '../logger';
import { getUser, getToken, clearAuthData } from '../utils/auth-utils';

// Define the shape of our context
interface AppContextType {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // User
  user: IAuthUser | null;
  setUser: (user: IAuthUser | null) => void;

  // Access token
  token: IAuthToken | null;
  setToken: (token: IAuthToken | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Initialization
  isInitialized: boolean;

  // Logout
  logout: () => Promise<void>;

  // Mobile
  isMobile: boolean;

  //Convex User Initialization
  convexUserInitializationLoading: boolean;
  setConvexUserInitializationLoading: (loading: boolean) => void;
}

// Create the context with a default value
const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper function to clear all storage (deprecated - use clearAuthData for auth-specific clearing)
const clearAllStorage = () => {
  if (typeof window === 'undefined') return;

  // Clear auth-specific data using auth-utils
  clearAuthData();

  // Clear other app-specific localStorage items if needed
  const keysToKeep = ['theme', 'language']; // Add keys you want to preserve
  const allKeys = Object.keys(localStorage);

  allKeys.forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  // Clear sessionStorage
  sessionStorage.clear();
};

// Create the provider component
export function AppProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  // User state
  const [user, setUser] = useState<AppContextType['user']>(null);
  const [token, setToken] = useState<AppContextType['token']>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);

  // Convex User Initialization state
  const [convexUserInitializationLoading, setConvexUserInitializationLoading] =
    useState(false);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard

    const detectMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    detectMobile(); // Set before first paint
    window.addEventListener('resize', detectMobile);

    return () => {
      window.removeEventListener('resize', detectMobile);
    };
  }, []);

  // Restore user from localStorage on initial load/page reload
  useEffect(() => {
    try {
      // Get user and token from localStorage using auth-utils
      const storedUser = getUser();
      const storedToken = getToken();

      // Set user and token in state if they exist
      if (storedUser) {
        setUser(storedUser);
      }

      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      logger.error('Error restoring user from localStorage:', error);
      window.location.href = '/app/auth/login';
    } finally {
      // Mark as initialized regardless of success/failure
      setIsInitialized(true);
    }
  }, []);

  // Logout function
  const logout = async () => {
    try {
      // Clear auth data immediately
      clearAllStorage();
      setUser(null);
      setToken(null);

      window.location.replace('/app/auth/login');
    } catch (error) {
      logger.error('Logout error:', error);
      window.location.replace('/app/auth/login');
    }
  };

  // Combine all states and methods into a single value
  const value = {
    theme,
    setTheme,
    user,
    setUser,
    token,
    setToken,
    searchQuery,
    setSearchQuery,
    isLoading,
    setIsLoading,
    isInitialized,
    logout,
    isMobile,
    convexUserInitializationLoading,
    setConvexUserInitializationLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Create a custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
