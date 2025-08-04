// components/board/BoardHeader.tsx
"use client";

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Star, Users, MoreHorizontal, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BoardHeaderProps {
  title: string;
}

const LanguageDropdown = () => {
  const { i18n, ready } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  // Don't render if i18n is not ready
  if (!ready || !i18n || typeof i18n.changeLanguage !== 'function') {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              if (i18n && typeof i18n.changeLanguage === 'function') {
                i18n.changeLanguage(language.code);
              }
            }}
            className={`cursor-pointer ${
              i18n.language === language.code ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.name}
            {i18n.language === language.code && (
              <span className="ml-auto">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const BoardHeader: React.FC<BoardHeaderProps> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <h1 className="text-2xl font-bold text-foreground">{t(title)}</h1>
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <Users className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <LanguageDropdown />
          <Button variant="ghost" size="sm" className="text-foreground hover:bg-accent">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};