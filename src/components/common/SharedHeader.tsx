/* eslint-disable @next/next/no-html-link-for-pages */
// components/common/SharedHeader.tsx
"use client";

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { 
  Star, 
  Users, 
  MoreHorizontal, 
  Globe, 
  Loader2,
  Plus,
  Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
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
  const [loading, setLoading] = useState<SupportedLanguage | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          className="text-foreground hover:bg-accent"
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
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => {
          const isActive = i18n.language === language.code;
          const isLoading = loading === language.code;
          
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer ${isActive ? 'bg-accent' : ''}`}
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

  if (variant === 'main') {
    return (
      <header className="bg-zinc-900 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-white">Kanban</span>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-white hover:text-blue-200 flex items-center space-x-1">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
                <a href="#" className="text-white hover:text-blue-200">Boards</a>
                <a href="#" className="text-white hover:text-blue-200">Templates</a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageDropdown />
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
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
    <div className="px-6 py-4 border-b border-border bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">Kanban</span>
          </div>
          
          {title && (
            <h1 className="text-2xl font-bold text-white">
              {t(title, { defaultValue: title })}
            </h1>
          )}
          
          {showBoardActions && (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Users className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
                
        <div className="flex items-center space-x-2">
          <nav className="hidden md:flex space-x-4 mr-4">
            <a href="/" className="text-white hover:text-blue-200 flex items-center space-x-1">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </a>
            <a href="#" className="text-white hover:text-blue-200">Boards</a>
            <a href="#" className="text-white hover:text-blue-200">Templates</a>
          </nav>
          
          <LanguageDropdown />
          <ThemeToggle />
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};