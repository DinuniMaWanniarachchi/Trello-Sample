import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage, isLanguageLoaded } from '../i18n-dynamic';
import type { Language, SupportedLanguage } from '../types/i18n.types';

interface LanguageSwitcherProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
  className?: string;
}

const AdvancedLanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  onLanguageChange,
  className = '' 
}) => {
  const { i18n, t } = useTranslation();
  const [loading, setLoading] = useState<SupportedLanguage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  ];

  const handleLanguageChange = useCallback(async (languageCode: SupportedLanguage) => {
    if (languageCode === i18n.language) return;

    setLoading(languageCode);
    setError(null);

    try {
      const result = await loadLanguage(languageCode);
      
      if (!result.success) {
        setError(result.error || `Failed to load ${languageCode} translations`);
      } else {
        onLanguageChange?.(languageCode);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error while loading translations';
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  }, [i18n.language, onLanguageChange]);

  return (
    <div className={`language-switcher ${className}`}>
      <label>{t('selectLanguage', 'Select Language')}: </label>
      
      <div className="language-options">
        {languages.map((lang) => {
          const langCode = lang.code as SupportedLanguage;
          const isActive = i18n.language === langCode;
          const isLoading = loading === langCode;
          const isLoaded = isLanguageLoaded(langCode);
          
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(langCode)}
              disabled={loading !== null}
              className={`lang-btn ${isActive ? 'active' : ''} ${isLoaded ? 'loaded' : ''}`}
              type="button"
            >
              <span className="flag" role="img" aria-label={`${lang.name} flag`}>
                {lang.flag}
              </span>
              <span className="name">{lang.name}</span>
              {isLoading && (
                <span className="spinner" role="img" aria-label="Loading">
                  ⏳
                </span>
              )}
              {isLoaded && !isActive && (
                <span className="loaded-indicator" title="Already loaded">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="loading-message" role="status" aria-live="polite">
          Loading {languages.find(l => l.code === loading)?.name} translations...
        </div>
      )}

      {error && (
        <div className="error-message" style={{ color: 'red' }} role="alert">
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ marginLeft: '8px', fontSize: '12px' }}
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedLanguageSwitcher;