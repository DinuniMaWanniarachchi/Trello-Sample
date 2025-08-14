// File: contexts/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const savedTheme = localStorage.getItem('theme') as Theme;
        let initialTheme: Theme;

        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          initialTheme = savedTheme;
        } else {
          // Check system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          initialTheme = systemPrefersDark ? 'dark' : 'light';
        }

        setThemeState(initialTheme);
        applyThemeToDOM(initialTheme);
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
        setThemeState('dark');
        applyThemeToDOM('dark');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  // Function to apply theme to DOM
  const applyThemeToDOM = (newTheme: Theme) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(newTheme);
    body.classList.add(newTheme);
    
    // Set CSS custom property for additional styling
    root.style.setProperty('--theme', newTheme);
    
    // Save to localStorage
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  // Apply theme changes to DOM
  useEffect(() => {
    if (!isLoading) {
      applyThemeToDOM(theme);
    }
  }, [theme, isLoading]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    if (newTheme !== theme) {
      setThemeState(newTheme);
    }
  };

  // Prevent flash of wrong theme during hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLoading }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};