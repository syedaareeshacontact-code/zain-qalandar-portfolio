'use client';

import { useEffect, useState } from 'react';
import { Leaf, MoonStar } from 'lucide-react';

const STORAGE_KEY = 'portfolio-theme';
const GREEN_THEME = 'green';
const DARK_THEME = 'dark';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === DARK_THEME ? 'dark' : 'light';

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute('content', theme === DARK_THEME ? '#090f0d' : '#f2f7f0');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(GREEN_THEME);

  useEffect(() => {
    const activeTheme = document.documentElement.dataset.theme === DARK_THEME
      ? DARK_THEME
      : GREEN_THEME;
    setTheme(activeTheme);
    applyTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === DARK_THEME ? GREEN_THEME : DARK_THEME;
    setTheme(nextTheme);
    applyTheme(nextTheme);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // The selected theme still works when storage is unavailable.
    }
  };

  const isDark = theme === DARK_THEME;
  const nextThemeLabel = isDark ? 'green' : 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextThemeLabel} mode`}
      aria-pressed={isDark}
      title={`Switch to ${nextThemeLabel} mode`}
      onClick={toggleTheme}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? <MoonStar size={16} /> : <Leaf size={16} />}
      </span>
      <span className="theme-toggle__label">{isDark ? 'Dark' : 'Green'}</span>
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb" />
      </span>
    </button>
  );
}
