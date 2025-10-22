// src/i18n.ts - Optimized i18n configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translations
const enTranslation: any = require('./locales/en/translation.json');
const enCommon: any = require('./locales/en/common.json');
const siTranslation: any = require('./locales/si/translation.json');
const siCommon: any = require('./locales/si/common.json');
const frTranslation: any = require('./locales/fr/translation.json');
const frCommon: any = require('./locales/fr/common.json');

export type SupportedLanguage = 'en' | 'si' | 'fr';

const resources = {
  en: {
    translation: enTranslation,
    common: enCommon,
  },
  si: {
    translation: siTranslation,
    common: siCommon,
  },
  fr: {
    translation: frTranslation,
    common: frCommon,
  },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    debug: false, // Turn off debug to prevent console logs
    
    // Important: These settings prevent loading delays
    initImmediate: false, // Don't wait for language detection
    react: {
      useSuspense: false, // This is key - prevents Suspense loading
    },

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
  });

export default i18n;