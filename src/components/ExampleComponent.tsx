"use client";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export function ExampleComponent() {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <h1>{t('welcome')}</h1>
      <p>{t('hello')}</p>
      <LanguageSwitcher />
    </div>
  );
}
