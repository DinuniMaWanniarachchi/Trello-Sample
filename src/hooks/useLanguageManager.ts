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

  const changeLanguage = useCallback(async (language: SupportedLanguage): Promise<LoadLanguageResult> => {
    if (language === i18n.language) {
      return { success: true };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await loadLanguage(language);
      
      if (result.success) {
        setLoadedLanguages(setLoadedLanguages());
      } else {
        setError(result.error || `Failed to load ${language}`);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    setLoadedLanguages(setLoadedLanguages());
  }, [i18n.language]);

  return {
    currentLanguage: i18n.language,
    loadedLanguages,
    isLoading,
    error,
    changeLanguage,
    clearError
  };
};