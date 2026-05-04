'use client';

import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
        logger.info('theme', theme);
      }}
      className={cn(
        'bg-background text-foreground hover:bg-accent hover:text-accent-foreground relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors',
        'dark:bg-background/95 dark:hover:bg-accent/20',
        className
      )}
    >
      <Sun className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
