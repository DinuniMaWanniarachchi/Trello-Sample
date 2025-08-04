export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationModule {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: Record<string, any>;
}

export type SupportedLanguage = 'en' | 'fr' | 'si';
export interface LoadLanguageResult {
  success: boolean;
  error?: string;
}
