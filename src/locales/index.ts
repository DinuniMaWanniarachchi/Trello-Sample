// src/locales/index.ts
import enTranslation from './en/translation.json';
import enCommon from './en/common.json';
import siTranslation from './si/translation.json';
import siCommon from './si/common.json';
import frTranslation from './fr/translation.json';
import frCommon from './fr/common.json';

const locales = {
  en: {
    translation: enTranslation,
    common: enCommon
  },
  si: {
    translation: siTranslation,
    common: siCommon
  },
  fr: {
    translation: frTranslation,
    common: frCommon
  }
} as const;

export type SupportedLanguage = keyof typeof locales;
export default locales;