// src/i18n.ts - Main i18n configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translations
import enTranslation from './locales/en/translation.json';
import enCommon from './locales/en/common.json';
import siTranslation from './locales/si/translation.json';
import siCommon from './locales/si/common.json';
import frTranslation from './locales/fr/translation.json';
import frCommon from './locales/fr/common.json';

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
  });

export default i18n;