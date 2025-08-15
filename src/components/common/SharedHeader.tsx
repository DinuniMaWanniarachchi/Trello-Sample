// components/common/SharedHeader.tsx
"use client";

import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Globe, 
  Loader2,
  Plus} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext'; // Add this import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { SupportedLanguage } from '@/i18n';

interface SharedHeaderProps {
  title?: string;
  variant?: 'main' | 'board';
  showBoardActions?: boolean;
}

interface Language {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

const LanguageDropdown = () => {
  const { i18n, ready } = useTranslation();
  const { theme } = useTheme(); // Add theme context
  const [loading, setLoading] = useState<SupportedLanguage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isDarkMode = theme === 'dark';

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  // Don't render if i18n is not ready
  if (!ready || !i18n) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleLanguageChange = useCallback(async (languageCode: SupportedLanguage) => {
    if (languageCode === i18n.language || loading) return;

    setLoading(languageCode);
    setError(null);

    try {
      console.log(`Changing language to: ${languageCode}`);
      
      // Change language using i18n directly
      await i18n.changeLanguage(languageCode);
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('preferred-language', languageCode);
      }
      
      console.log(`Successfully changed language to: ${languageCode}`);
      console.log(`Current i18n language: ${i18n.language}`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change language';
      setError(errorMessage);
      console.error('Language change error:', err);
    } finally {
      setLoading(null);
    }
  }, [i18n, loading]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`transition-colors ${
            isDarkMode 
              ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          disabled={loading !== null}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={`w-48 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}
      >
        {languages.map((language) => {
          const isActive = i18n.language === language.code;
          const isLoading = loading === language.code;
          
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer transition-colors ${
                isActive 
                  ? (isDarkMode ? 'bg-gray-700' : 'bg-gray-100')
                  : (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50')
              } ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
              disabled={loading !== null}
            >
              <span className="mr-2">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              <div className="flex items-center gap-1">
                {isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                {isActive && !isLoading && (
                  <span className="text-green-600">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        {error && (
          <div className="px-2 py-1 text-xs text-red-500 border-t">
            {error}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const SharedHeader: React.FC<SharedHeaderProps> = ({ 
  title, 
  variant = 'main',
  showBoardActions = false 
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme(); // Add theme context
  const isDarkMode = theme === 'dark';

  if (variant === 'main') {
    return (
      <header className={`backdrop-blur-sm border-b transition-colors ${
        isDarkMode 
          ? 'border-gray-700' 
          : 'bg-white border-gray-200'
      }`}
      style={isDarkMode ? { backgroundColor: 'rgb(30, 30, 30)' } : {}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* <div className="flex items-center space-x-2">
                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Kanban
                </span>
              </div> */}
              
              {/* <nav className="hidden md:flex space-x-8">
                <a href="#" className={`flex items-center space-x-1 transition-colors ${
                  isDarkMode 
                    ? 'text-white hover:text-blue-200' 
                    : 'text-gray-900 hover:text-blue-600'
                }`}>
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a href="#" className={`transition-colors ${
                  isDarkMode 
                    ? 'text-white hover:text-blue-200' 
                    : 'text-gray-900 hover:text-blue-600'
                }`}>Boards</a>
                <a href="#" className={`transition-colors ${
                  isDarkMode 
                    ? 'text-white hover:text-blue-200' 
                    : 'text-gray-900 hover:text-blue-600'
                }`}>Templates</a>
              </nav> */}
            </div>

            <div className="flex items-center space-x-4">
              <LanguageDropdown />
              <Button 
                variant="ghost" 
                size="sm" 
                className={`transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Board variant
  return (
    <div className={`px-6 py-4 border-b transition-colors ${
      isDarkMode 
        ? 'border-gray-700' 
        : 'bg-white border-gray-200'
    }`}
    style={isDarkMode ? { backgroundColor: 'rgb(30, 30, 30)' } : {}}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* <div className="flex items-center space-x-2">
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Kanban
            </span>
          </div> */}
          
          {title && (
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t(title, { defaultValue: title })}
            </h1>
          )}
          
          {showBoardActions && (
            <div className="flex items-center space-x-2">
              {/* <Button variant="ghost" size="sm" className={`transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className={`transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Users className="h-4 w-4" />
              </Button> */}
            </div>
          )}
        </div>
                
        <div className="flex items-center space-x-2">
          {/* <nav className="hidden md:flex space-x-4 mr-4">
            <a href="/" className={`flex items-center space-x-1 transition-colors ${
              isDarkMode 
                ? 'text-white hover:text-blue-200' 
                : 'text-gray-900 hover:text-blue-600'
            }`}>
              <Home className="h-4 w-4" />
              <span>Home</span>
            </a>
            <a href="#" className={`transition-colors ${
              isDarkMode 
                ? 'text-white hover:text-blue-200' 
                : 'text-gray-900 hover:text-blue-600'
            }`}>Boards</a>
            <a href="#" className={`transition-colors ${
              isDarkMode 
                ? 'text-white hover:text-blue-200' 
                : 'text-gray-900 hover:text-blue-600'
            }`}>Templates</a>
          </nav> */}
          
          <LanguageDropdown />
          {/* <Button variant="ghost" size="sm" className={`transition-colors ${
            isDarkMode 
              ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}>
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button> */}
          <Button 
            variant="ghost" 
            size="sm" 
            className={`transition-colors ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};