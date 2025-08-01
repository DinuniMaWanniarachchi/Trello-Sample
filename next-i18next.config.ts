// next-i18next.config.ts
import type { UserConfig } from 'next-i18next';

export const i18n: UserConfig['i18n'] = {
  defaultLocale: 'en',
  locales: ['en', 'es', 'fr', 'de'],
  localeDetection: true,
};

const config: UserConfig = {
  i18n,
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  serializeConfig: false,
  react: {
    useSuspense: false,
  },
};

export default config;
