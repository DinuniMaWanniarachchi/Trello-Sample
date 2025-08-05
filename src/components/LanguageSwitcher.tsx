'use client';
import { useLanguageManagerRedux } from '@/hooks/useLanguageManagerRedux';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '@/types/i18n.types';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

export default function LanguageSwitcher() {
  useTranslation('common');
  const { 
    currentLanguage, 
    isLoading, 
    error, 
    changeLanguage, 
    clearError 
  } = useLanguageManagerRedux();

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (error) clearError();
    
    try {
      const result = await changeLanguage(language);
      if (!result.success) {
        console.error('Failed to change language:', result.error);
      }
    } catch (err) {
      console.error('Error in language change:', err);
    }
  };

  return (
    <div className="relative">
      {/* Dropdown Language Switcher */}
      <div className="flex items-center gap-2">
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
          disabled={isLoading}
          className={`
            px-3 py-2 border rounded-md bg-white dark:bg-gray-800 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          `}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.flag} {option.name}
            </option>
          ))}
        </select>
        
        {isLoading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded-md text-sm text-red-700 z-10">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// Alternative: Button-style Language Switcher
export function LanguageSwitcherButtons() {
  const { 
    currentLanguage, 
    isLoading, 
    error, 
    changeLanguage, 
    clearError 
  } = useLanguageManagerRedux();

  const handleLanguageChange = async (language: SupportedLanguage) => {
    if (error) clearError();
    await changeLanguage(language);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
            disabled={isLoading}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${currentLanguage === option.code
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {option.flag} {option.code.toUpperCase()}
          </button>
        ))}
      </div>
      
      {error && (
        <div className="p-2 bg-red-100 border border-red-300 rounded-md text-sm text-red-700">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      
      {isLoading && (
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading language...
        </div>
      )}
    </div>
  );
}

// Debug Component to show current state
export function LanguageDebugInfo() {
  const { 
    currentLanguage, 
    loadedLanguages, 
    isLoading, 
    error 
  } = useLanguageManagerRedux();

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-black bg-opacity-75 text-white text-xs rounded-lg">
      <div>Current: {currentLanguage}</div>
      <div>Loaded: {loadedLanguages.join(', ')}</div>
      <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
      {error && <div className="text-red-300">Error: {error}</div>}
    </div>
  );
}