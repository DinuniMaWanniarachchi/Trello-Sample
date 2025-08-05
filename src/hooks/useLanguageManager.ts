// hooks/useLanguageManager.ts
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage } from '../i18n-dynamic';
import type { SupportedLanguage, LoadLanguageResult } from '../types/i18n.types';

interface UseLanguageManagerResult {
  currentLanguage: string;
  loadedLanguages: SupportedLanguage[];
  isLoading: boolean;
  error: string | null;
  changeLanguage: (language: SupportedLanguage) => Promise<LoadLanguageResult>;
  clearError: () => void;
}

export const useLanguageManager = (): UseLanguageManagerResult => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedLanguages, setLoadedLanguages] = useState<SupportedLanguage[]>([]);

  // Helper function to get currently loaded languages
  const getLoadedLanguages = useCallback((): SupportedLanguage[] => {
    // Get languages that have resources loaded in i18next
    const availableLanguages = Object.keys(i18n.store.data) as SupportedLanguage[];
    return availableLanguages.filter(lang => 
      i18n.store.data[lang] && 
      Object.keys(i18n.store.data[lang]).length > 0
    );
  }, [i18n.store.data]);

  const changeLanguage = useCallback(async (language: SupportedLanguage): Promise<LoadLanguageResult> => {
    if (language === i18n.language) {
      return { success: true };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadLanguage(language);
      
      if (result.success) {
        // Update the loaded languages list after successful load
        setLoadedLanguages(getLoadedLanguages());
        
        // Save to localStorage for persistence
        localStorage.setItem('preferred-language', language);
        
        console.log(`Successfully changed language to: ${language}`);
      } else {
        setError(result.error || `Failed to load ${language}`);
        console.error(`Failed to change language to ${language}:`, result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Language change error:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language, getLoadedLanguages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loaded languages when the current language changes
  useEffect(() => {
    setLoadedLanguages(getLoadedLanguages());
  }, [i18n.language, getLoadedLanguages]);

  // Initialize loaded languages on mount
  useEffect(() => {
    setLoadedLanguages(getLoadedLanguages());
  }, [getLoadedLanguages]);

  return {
    currentLanguage: i18n.language,
    loadedLanguages,
    isLoading,
    error,
    changeLanguage,
    clearError
  };
};