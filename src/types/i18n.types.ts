// src/types/i18n.types.ts
export type SupportedLanguage = 'en' | 'si' | 'fr';

export interface TranslationModule {
  default: Record<string, unknown>;
}

export interface LoadLanguageResult {
  success: boolean;
  error?: string;
  language?: string;
}