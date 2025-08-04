// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Load translations from files
  .use(LanguageDetector) // Detect browser language/localStorage
  .use(initReactI18next) // Connect with React
  .init({
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'home'], // Add your namespaces here
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    
    debug: process.env.NODE_ENV === 'development',
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      // Additional backend options for better loading
      requestOptions: {
        cache: 'default', // Cache the requests
      },
      // Handle loading errors
      parse: (data: string) => {
        try {
          return JSON.parse(data);
        } catch (error) {
          console.error('Error parsing translation file:', error);
          return {};
        }
      },
    },
    
    react: {
      useSuspense: false, // Disable suspense for better error handling
    },
    
    // Add loading state handling
    initImmediate: false, // Wait for translations to load
    
    // Preload languages and namespaces
    preload: ['en'], // Preload English translations
    
    // Handle missing translations
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} in ${lng}/${ns}`);
      }
    },
  });

export default i18n;