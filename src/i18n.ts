// src/i18n.ts
"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'es', 'fr', 'de', 'zh'],
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      react: { useSuspense: false },
    });
}

export default i18n;
