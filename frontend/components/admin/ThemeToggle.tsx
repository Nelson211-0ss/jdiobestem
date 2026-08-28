'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Light/dark switch for the dashboard.
 *
 * The theme is an attribute on `<html>` (`data-admin-theme`) rather than React
 * state, because the inline script in the admin layout has to set it before
 * first paint to avoid a white flash. This component reads what that script
 * decided and writes the same attribute, so there is one source of truth.
 *
 * The stored value is only ever `light` or `dark`. Nothing is stored until the
 * button is pressed, so a fresh browser follows the operating system; from the
 * first press onwards the choice is explicit and sticks.
 */

export const THEME_KEY = 'jdiobe-admin-theme';

type Theme = 'light' | 'dark';

function apply(theme: Theme) {
  document.documentElement.setAttribute('data-admin-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Safari in private mode throws on setItem. The theme still applies for
    // this page load; it just will not be remembered.
  }
}

export default function ThemeToggle() {
  // `null` until mounted: the server cannot know which theme the script picked,
  // so rendering a specific icon here would mismatch and hydrate wrong.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-admin-theme');
    setTheme(current === 'dark' ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    apply(next);
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
      /* Both icons are rendered and cross-faded rather than swapped, so the
         button does not resize or flicker on press. Before mount, neither is
         shown and the button keeps its space. */
      className="relative shrink-0"
    >
      <Sun
        className={`h-[1.15rem] w-[1.15rem] transition-all ${
          theme === 'light' ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      />
      <Moon
        className={`absolute h-[1.15rem] w-[1.15rem] transition-all ${
          theme === 'dark' ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      />
    </Button>
  );
}
