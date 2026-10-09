'use client'

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('vihara-theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vihara-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vihara-theme', 'light');
    }
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 sm:px-3 sm:py-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.12] transition-all flex items-center gap-1.5 text-xs font-medium
        bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.14] 
        text-neutral-800 dark:text-neutral-200 cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      title={darkMode ? "Ganti ke Terang" : "Ganti ke Gelap"}
      aria-label={darkMode ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
    >
      {darkMode ? (
        <>
          <Sun size={14} className="text-amber-400 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-medium tracking-tight">Terang</span>
        </>
      ) : (
        <>
          <Moon size={14} className="text-neutral-700 dark:text-neutral-300 shrink-0" />
          <span className="hidden sm:inline text-[11px] font-medium tracking-tight">Gelap</span>
        </>
      )}
    </button>
  );
}
