"use client";
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

if (!i18n.isInitialized) {
  i18n
    .use(resourcesToBackend((language: string, namespace: string) => {
      try {
        return import(`../public/locales/${language}/${namespace}.json`);
      } catch (error) {
        console.warn(`Failed to load ${language}/${namespace}.json`);
        return {};
      }
    }))
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      supportedLngs: ['en', 'si', 'fr'],
      ns: ['common'], // Only use common namespace
      defaultNS: 'common',
      interpolation: { 
        escapeValue: false 
      },
      react: { 
        useSuspense: false 
      },
    });
}

export default i18n;
