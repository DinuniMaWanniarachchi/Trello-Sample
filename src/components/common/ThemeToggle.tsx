// components/common/ThemeToggle.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="text-foreground hover:bg-accent"
    >
      {isDark ? '☀️' : '🌙'}
    </Button>
  );
};