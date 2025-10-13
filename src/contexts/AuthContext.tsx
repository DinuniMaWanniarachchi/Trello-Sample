// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name?: string;
  defaultBoardId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User, remember?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Helper function to get cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper function to set cookie with proper attributes
function setCookie(name: string, value: string, days?: number) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = `; expires=${date.toUTCString()}`;
  }
  // CRITICAL: Set SameSite=Lax to ensure cookie works with navigation
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`;
}

// Helper function to delete cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to check if user is authenticated
  const checkAuth = useCallback((): boolean => {
    const token = getCookie('token');
    const savedUser = localStorage.getItem('user');
    return !!(token && savedUser);
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      console.log('🔐 AuthContext: Initializing...');
      
      const token = getCookie('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('🔐 Token exists:', !!token);
      console.log('🔐 Saved user exists:', !!savedUser);
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('🔐 User restored from storage:', userData.email);
          setUser(userData);
        } catch (error) {
          console.error('🔐 Error parsing saved user:', error);
          // Clean up invalid data
          deleteCookie('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('🔐 No valid auth found');
      }
      
      setIsLoading(false);
      console.log('🔐 AuthContext: Initialization complete');
    };

    initAuth();
  }, []);

  const login = useCallback((token: string, userData: User, remember: boolean = false) => {
    console.log('🔐 Login called for:', userData.email);
    
    // Set user in state FIRST
    setUser(userData);
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Set cookie with proper expiration
    if (remember) {
      setCookie('token', token, 7); // 7 days
      console.log('🔐 Token saved with 7 day expiration');
    } else {
      setCookie('token', token); // Session cookie
      console.log('🔐 Token saved as session cookie');
    }
    
    console.log('🔐 Login complete, token:', token.substring(0, 20) + '...');
  }, []);

  const logout = useCallback(() => {
    console.log('🔐 Logout called');
    
    setUser(null);
    localStorage.removeItem('user');
    deleteCookie('token');
    
    router.push('/login');
  }, [router]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) { 
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};