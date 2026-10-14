'use client'

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);

  // The root layout script already applied the saved theme; read it back from the DOM.
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('vihara-theme', next ? 'dark' : 'light');
    } catch {}
  };

  if (darkMode === null) return <span className="w-11 h-11" aria-hidden />;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="min-h-[44px] sm:min-h-[36px] px-3 rounded-lg flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink hover:bg-surface-2 cursor-pointer"
      aria-label={darkMode ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
    >
      {darkMode ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
      <span className="hidden sm:inline">{darkMode ? 'Terang' : 'Gelap'}</span>
    </button>
  );
}
