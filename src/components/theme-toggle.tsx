'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        disabled 
        className="h-8 w-8 px-0"
      >
        <Sun className="h-3.5 w-3.5" />
      </Button>
    );
  }

  // Use resolvedTheme to get the actual current theme (handles 'system' theme properly)
  const currentTheme = resolvedTheme || theme;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-foreground/80 hover:text-foreground hover:bg-accent h-8 w-8 px-0 transition-colors"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
      title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Sun className="h-3.5 w-3.5 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-3.5 w-3.5 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}