// i18n-dynamic.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import locales, { SupportedLanguage } from './locales';

// Define the return type for loadLanguage
interface LoadLanguageResult {
  success: boolean;
  error?: string;
  language?: string;
}

// Initialize i18next if not already initialized
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {}, // We'll add resources dynamically
  });
}

export const loadLanguage = async (language: string): Promise<LoadLanguageResult> => {
  try {
    console.log(`Loading ${language} translations...`);
    
    // Check if language is supported
    if (!(language in locales)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    
    const languageData = locales[language as SupportedLanguage];
    
    // Add resources to i18next
    i18next.addResourceBundle(language, 'translation', languageData.translation, true, true);
    i18next.addResourceBundle(language, 'common', languageData.common, true, true);
    
    // Change the language
    await i18next.changeLanguage(language);
    
    console.log(`Successfully loaded ${language} translations`);
    
    return {
      success: true,
      language: language
    };
    
  } catch (error) {
    console.error(`Failed to load ${language}:`, error);
    
    // Fallback to English if the language fails to load
    if (language !== 'en') {
      console.log('Falling back to English...');
      return await loadLanguage('en');
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Preload default language
loadLanguage('en');

export default i18next;