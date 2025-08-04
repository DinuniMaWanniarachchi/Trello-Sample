import { useCallback, useState } from 'react';
import { loadLanguage } from '../i18n-dynamic';
import type { SupportedLanguage } from '../types/i18n.types';

interface PreloadOptions {
  languages?: SupportedLanguage[];
  delay?: number;
  concurrent?: boolean;
}

// Preload translations in the background
export const preloadAllLanguages = async (options: PreloadOptions = {}): Promise<void> => {
  const { 
    languages = ['fr'] as SupportedLanguage[], // Don't preload 'en' as it's already loaded
    delay = 0,
    concurrent = false 
  } = options;
  
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  if (concurrent) {
    // Load all languages simultaneously
    const promises = languages.map(async (lang) => {
      try {
        const result = await loadLanguage(lang);
        if (result.success) {
          console.log(`Preloaded ${lang}`);
        } else {
          console.log(`Failed to preload ${lang}: ${result.error}`);
        }
      } catch (error) {
        console.log(`Failed to preload ${lang}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
  } else {
    // Load them one by one to avoid overwhelming the network
    for (const lang of languages) {
      try {
        const result = await loadLanguage(lang);
        if (result.success) {
          console.log(`Preloaded ${lang}`);
        } else {
          console.log(`Failed to preload ${lang}: ${result.error}`);
        }
      } catch (error) {
        console.log(`Failed to preload ${lang}:`, error);
      }
    }
  }
};

// Hook for preloading in React components
export const usePreloadTranslations = (options: PreloadOptions = {}) => {
  const [isPreloading, setIsPreloading] = useState<boolean>(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const startPreload = useCallback(async () => {
    setIsPreloading(true);
    setPreloadError(null);
    
    try {
      await preloadAllLanguages(options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Preload failed';
      setPreloadError(errorMessage);
    } finally {
      setIsPreloading(false);
    }
  }, [options]);

  return { startPreload, isPreloading, preloadError };
};