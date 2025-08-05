import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  setLanguageLoading,
  setLanguageSuccess,
  setLanguageError,
  clearLanguageError,
  setLoadedLanguages
} from '@/lib/features/i18nSlice';
import { loadLanguage } from '../i18n-dynamic';
import type { SupportedLanguage, LoadLanguageResult } from '../types/i18n.types';

interface UseLanguageManagerReduxResult {
  currentLanguage: string;
  loadedLanguages: SupportedLanguage[];
  isLoading: boolean;
  error: string | null;
  changeLanguage: (language: SupportedLanguage) => Promise<LoadLanguageResult>;
  clearError: () => void;
}

export const useLanguageManagerRedux = (): UseLanguageManagerReduxResult => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const { isLoading, error, loadedLanguages } = useAppSelector((state) => state.i18n);

  const changeLanguage = useCallback(async (language: SupportedLanguage): Promise<LoadLanguageResult> => {
    if (language === i18n.language) {
      return { success: true };
    }

    dispatch(setLanguageLoading(true));

    try {
      const result = await loadLanguage(language);
      
      if (result.success) {
        dispatch(setLanguageSuccess(language));
        
        // Update loaded languages list
        const availableLanguages = Object.keys(i18n.store.data) as SupportedLanguage[];
        const validLanguages = availableLanguages.filter(lang => 
          i18n.store.data[lang] && 
          Object.keys(i18n.store.data[lang]).length > 0
        );
        dispatch(setLoadedLanguages(validLanguages));
        
        // Save to localStorage
        localStorage.setItem('preferred-language', language);
        
        console.log(`Successfully changed language to: ${language}`);
      } else {
        dispatch(setLanguageError(result.error || `Failed to load ${language}`));
        console.error(`Failed to change language to ${language}:`, result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      dispatch(setLanguageError(errorMessage));
      console.error('Language change error:', err);
      return { success: false, error: errorMessage };
    }
  }, [i18n.language, i18n.store.data, dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearLanguageError());
  }, [dispatch]);

  return {
    currentLanguage: i18n.language,
    loadedLanguages,
    isLoading,
    error,
    changeLanguage,
    clearError
  };
};