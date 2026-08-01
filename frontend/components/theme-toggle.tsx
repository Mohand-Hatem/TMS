'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconSun, IconMoon } from '@tabler/icons-react';

/**
 * Interactive Theme Toggle button allowing instant switching between Light Mode and Dark Mode.
 * Renders cleanly without hydration mismatches.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-lg bg-card border-border shadow-2xs pointer-events-none opacity-50"
        aria-label="Theme toggle loading"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="h-8 w-8 rounded-lg bg-card hover:bg-muted text-foreground border-border transition-all duration-200 shadow-2xs shrink-0"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <IconSun className="h-4 w-4 text-amber-500 hover:rotate-45 transition-transform" />
      ) : (
        <IconMoon className="h-4 w-4 text-indigo-600 hover:-rotate-12 transition-transform" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
