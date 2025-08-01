import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation('common');

  const handleLanguageChange = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div className="language-switcher">
      <select
        value={router.locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="border rounded px-2 py-1"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
