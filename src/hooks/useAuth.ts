// hooks/useAuth.ts
'use client';

import { useState, useCallback, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call - Replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login - Replace with actual API call
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        const userData: User = {
          id: '1',
          username: credentials.username,
          email: 'admin@example.com',
          role: 'admin'
        };
        
        setUser(userData);
        
        if (credentials.remember) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        return userData;
      } else {
        throw new Error('Invalid username or password');
      }
      
      // For real implementation, replace the above with:
      /*
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const userData = await response.json();
      setUser(userData);
      
      if (credentials.remember) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return userData;
      */
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
    
    // For real implementation, you might want to call logout API:
    /*
    fetch('/api/auth/logout', { method: 'POST' })
      .catch(err => console.error('Logout API error:', err));
    */
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };
};