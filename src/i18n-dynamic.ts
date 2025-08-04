import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { SupportedLanguage, TranslationModule, LoadLanguageResult } from './types/i18n.types';

// Cache loaded languages to avoid re-downloading
const loadedLanguages = new Set<SupportedLanguage>();

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {}, // Empty! No translations bundled
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    }
  });

export const loadLanguage = async (language: SupportedLanguage): Promise<LoadLanguageResult> => {
  // Return early if already loaded
  if (loadedLanguages.has(language)) {
    await i18n.changeLanguage(language);
    return { success: true };
  }

  try {
    console.log(`Loading ${language} translations...`);
    
    // Dynamic imports - webpack creates separate chunks
    const [translationModule, commonModule]: [TranslationModule, TranslationModule] = await Promise.all([
      import(`./locales/${language}/translation.json`),
      import(`./locales/${language}/common.json`)
    ]);

    // Extract the actual data (dynamic imports wrap in { default: ... })
    const translation = translationModule.default;
    const common = commonModule.default;

    // Add to i18n
    // Parameters: (lng, ns, resources, deep, overwrite)
    i18n.addResourceBundle(language, 'translation', translation, true, true);
    i18n.addResourceBundle(language, 'common', common, true, true);
    
    // Mark as loaded
    loadedLanguages.add(language);
    
    // Switch language
    await i18n.changeLanguage(language);
    
    console.log(`${language} loaded successfully`);
    return { success: true };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to load ${language}`;
    console.error(`Failed to load ${language}:`, error);
    return { success: false, error: errorMessage };
  }
};

// Check if a language is already loaded
export const isLanguageLoaded = (language: SupportedLanguage): boolean => {
  return loadedLanguages.has(language);
};

// Get currently loaded languages
export const getLoadedLanguages = (): SupportedLanguage[] => {
  return Array.from(loadedLanguages);
};

// Preload default language
loadLanguage('en');

export default i18n;