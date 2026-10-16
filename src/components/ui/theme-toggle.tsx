'use client'

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// tone="nav" is for the dark navigation zone; block makes it a full-width sidebar row.
export default function ThemeToggle({ tone = 'surface', block = false }: { tone?: 'surface' | 'nav'; block?: boolean }) {
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

  if (darkMode === null) return <span className="block w-11 h-11" aria-hidden />;

  const toneClass =
    tone === 'nav'
      ? 'gap-3 text-nav-ink-2 hover:text-nav-ink hover:bg-nav-active'
      : 'gap-1.5 text-ink-2 hover:text-ink hover:bg-surface-2';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`min-h-[44px] md:min-h-[38px] px-3 rounded-lg flex items-center text-sm cursor-pointer ${block ? 'w-full' : ''} ${toneClass}`}
      aria-label={darkMode ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
    >
      {darkMode ? <Sun size={17} aria-hidden className="opacity-80" /> : <Moon size={17} aria-hidden className="opacity-80" />}
      <span className={block ? '' : 'hidden sm:inline'}>{darkMode ? 'Mode terang' : 'Mode gelap'}</span>
    </button>
  );
}
