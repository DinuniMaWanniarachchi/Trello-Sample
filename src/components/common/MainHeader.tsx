/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-html-link-for-pages */
// components/common/MainHeader.tsx
"use client";

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { 
  Globe, 
  Loader2,
  Plus,
  Home,
  Layout,
  FileText} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { SupportedLanguage } from '@/i18n';

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
      <Button variant="ghost" size="sm" disabled className="text-white/70 h-8">
        <Globe className="h-3.5 w-3.5" />
      </Button>
    );
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

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
          className="text-white/80 hover:text-white hover:bg-white/10 h-8 px-2 text-xs font-medium"
          disabled={loading !== null}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Globe className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
              <span className="sm:hidden">{currentLanguage.flag}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-zinc-800 border-zinc-700">
        {languages.map((language) => {
          const isActive = i18n.language === language.code;
          const isLoading = loading === language.code;
          
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`cursor-pointer text-white hover:bg-zinc-700 text-sm ${
                isActive ? 'bg-zinc-700' : ''
              }`}
              disabled={loading !== null}
            >
              <span className="mr-2">{language.flag}</span>
              <span className="flex-1">{language.name}</span>
              <div className="flex items-center gap-1">
                {isLoading && (
                  <Loader2 className="h-3 w-3 animate-spin text-blue-400" />
                )}
                {isActive && !isLoading && (
                  <span className="text-green-400 text-xs">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        {error && (
          <>
            <DropdownMenuSeparator className="bg-zinc-700" />
            <div className="px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const CreateButton = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Create
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-zinc-800 border-zinc-700">
        <DropdownMenuItem className="text-white hover:bg-zinc-700 cursor-pointer text-sm">
          <Layout className="h-3.5 w-3.5 mr-2" />
          Create Board
        </DropdownMenuItem>
        <DropdownMenuItem className="text-white hover:bg-zinc-700 cursor-pointer text-sm">
          <FileText className="h-3.5 w-3.5 mr-2" />
          Create Template
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-zinc-700" />
        <DropdownMenuItem className="text-white hover:bg-zinc-700 cursor-pointer text-sm">
          <Plus className="h-3.5 w-3.5 mr-2" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const MainHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto pl-0 pr-0 -ml-0">
        <div className="flex items-center justify-between h-10">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <div className="flex items-center space-x-0">
              {/* <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <Layout className="h-3.5 w-3.5 text-white" />
              </div> */}
              <span className="text-lg font-semibold text-white">
                Kanban
              </span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <a 
                href="/" 
                className="text-white/80 hover:text-white flex items-center space-x-1.5 px-2 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{t('home', { defaultValue: 'Home' })}</span>
              </a>
              <a 
                href="#" 
                className="text-white/80 hover:text-white px-2 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium"
              >
                {t('boards', { defaultValue: 'Boards' })}
              </a>
              <a 
                href="#" 
                className="text-white/80 hover:text-white px-2 py-1.5 rounded-md transition-colors duration-150 text-sm font-medium"
              >
                {t('templates', { defaultValue: 'Templates' })}
              </a>
            </nav>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <LanguageDropdown />
            
            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            {/* Create Button */}
            <CreateButton />
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden text-white hover:bg-white/10 p-1.5"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};