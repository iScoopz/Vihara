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
      className="p-2 rounded-xl border transition-all flex items-center gap-2 text-xs font-semibold
        bg-white dark:bg-purple-950 border-purple-200 dark:border-purple-800 
        text-purple-900 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-900 shadow-sm cursor-pointer"
      title={darkMode ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
    >
      {darkMode ? (
        <>
          <Sun size={16} className="text-amber-400" />
          <span className="hidden sm:inline font-bold">Light Mode</span>
        </>
      ) : (
        <>
          <Moon size={16} className="text-purple-700" />
          <span className="hidden sm:inline font-bold">Dark Mode</span>
        </>
      )}
    </button>
  );
}
