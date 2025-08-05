import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import locales, { SupportedLanguage } from './locales';

// Define the return type for loadLanguage
export interface LoadLanguageResult {
  success: boolean;
  error?: string;
  language?: string;
}

// Initialize i18next with all resources preloaded
const initializeI18n = () => {
  if (!i18next.isInitialized) {
    i18next
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        // Preload all resources from your locales/index.ts
        resources: {
          en: locales.en,
          si: locales.si,
          fr: locales.fr,
        },
        lng: 'en', // Default language
        fallbackLng: 'en',
        debug: process.env.NODE_ENV === 'development',
        
        // Language detection options
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          lookupLocalStorage: 'preferred-language',
          caches: ['localStorage'],
        },
        
        interpolation: {
          escapeValue: false, // React already does escaping
        },
        
        // Namespace configuration
        defaultNS: 'translation',
        ns: ['translation', 'common'],
        
        // React i18next options
        react: {
          useSuspense: false, // Disable suspense to avoid Redux conflicts
        },
      });
  }
};

// Initialize immediately
initializeI18n();

export const loadLanguage = async (language: string): Promise<LoadLanguageResult> => {
  try {
    console.log(`🔄 Changing language to: ${language}`);
    
    // Check if language is supported
    if (!(language in locales)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    // Since resources are preloaded, just change the language
    await i18next.changeLanguage(language);
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language);
    }
    
    console.log(`✅ Successfully changed language to: ${language}`);
    console.log(`📋 Current i18n language: ${i18next.language}`);
    
    // Debug: Check what translations are available
    const commonTranslations = i18next.getResourceBundle(language, 'common');
    const mainTranslations = i18next.getResourceBundle(language, 'translation');
    
    console.log(`📦 Available translations for ${language}:`, {
      common: Object.keys(commonTranslations || {}),
      translation: Object.keys(mainTranslations || {}),
    });
    
    // Specific check for your missing key
    console.log(`🔍 "My Project Board" translation:`, 
      commonTranslations?.['My Project Board'] || mainTranslations?.['My Project Board'] || 'NOT FOUND');
    
    return {
      success: true,
      language: language
    };
  } catch (error) {
    console.error(`❌ Failed to change language to ${language}:`, error);
    
    // Fallback to English if the language fails to load
    if (language !== 'en') {
      console.log('🔄 Falling back to English...');
      return await loadLanguage('en');
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Initialize with saved language from localStorage
if (typeof window !== 'undefined') {
  const savedLanguage = localStorage.getItem('preferred-language');
  if (savedLanguage && savedLanguage in locales) {
    loadLanguage(savedLanguage);
  }
}

export default i18next;