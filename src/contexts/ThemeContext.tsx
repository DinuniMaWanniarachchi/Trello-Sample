// contexts/ThemeContext.tsx
"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useTheme } from 'next-themes';

interface SharedThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const SharedThemeContext = createContext<SharedThemeContextType | undefined>(undefined);

export const useSharedTheme = () => {
  const context = useContext(SharedThemeContext);
  if (context === undefined) {
    throw new Error('useSharedTheme must be used within a SharedThemeProvider');
  }
  return context;
};

interface SharedThemeProviderProps {
  children: React.ReactNode;
}

export const SharedThemeProvider: React.FC<SharedThemeProviderProps> = ({ children }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const isDarkMode = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Apply styles to SharedHeader components
  useEffect(() => {
    const applySharedHeaderStyles = () => {
      const sharedHeaders = document.querySelectorAll('[data-shared-header]');
      sharedHeaders.forEach(header => {
        if (isDarkMode) {
          header.classList.add('theme-dark');
          header.classList.remove('theme-light');
        } else {
          header.classList.add('theme-light');
          header.classList.remove('theme-dark');
        }
      });
    };

    // Initial application
    applySharedHeaderStyles();

    // Watch for new SharedHeader components being added
    const observer = new MutationObserver(() => {
      applySharedHeaderStyles();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [isDarkMode]);

  return (
    <SharedThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <style jsx global>{`
        /* Styles for SharedHeader when theme changes */
        [data-shared-header].theme-dark {
          background-color: rgba(24, 24, 27, 0.95) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        [data-shared-header].theme-dark h1,
        [data-shared-header].theme-dark span,
        [data-shared-header].theme-dark div {
          color: white !important;
        }
        
        [data-shared-header].theme-dark button {
          color: rgb(209, 213, 219) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        [data-shared-header].theme-dark button:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
        }
        
        [data-shared-header].theme-dark [data-radix-popper-content-wrapper] > div {
          background-color: rgb(39, 39, 42) !important;
          border-color: rgb(63, 63, 70) !important;
        }
        
        [data-shared-header].theme-light {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border-color: rgb(229, 231, 235) !important;
        }
        
        [data-shared-header].theme-light h1,
        [data-shared-header].theme-light span,
        [data-shared-header].theme-light div {
          color: rgb(17, 24, 39) !important;
        }
        
        [data-shared-header].theme-light button {
          color: rgb(75, 85, 99) !important;
          border-color: rgb(229, 231, 235) !important;
        }
        
        [data-shared-header].theme-light button:hover {
          background-color: rgb(243, 244, 246) !important;
          color: rgb(17, 24, 39) !important;
        }

        /* Dark mode background for the entire app */
        .dark {
          background-color: rgb(30, 30, 30);
        }
        
        .dark body {
          background-color: rgb(30, 30, 30);
        }
      `}</style>
      {children}
    </SharedThemeContext.Provider>
  );
};

export { useTheme };
