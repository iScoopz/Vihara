'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, UserCheck, Calendar as CalendarIcon, Shield } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function UmatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0a1e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Navbar */}
      <header className="border-b border-purple-100 dark:border-indigo-900/60 bg-white/90 dark:bg-[#1e1b4b]/90 backdrop-blur sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/kegiatan" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl gradient-mnsbdi flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/30 group-hover:scale-105 transition">
                🪷
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-purple-950 dark:text-white leading-tight">Portal Umat MNSBDI</h1>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300">Member Area</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1.5">
              <Link
                href="/kegiatan"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  pathname === '/kegiatan'
                    ? 'gradient-mnsbdi text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-indigo-900'
                }`}
              >
                <CalendarDays size={16} />
                <span>Katalog Event</span>
              </Link>

              <Link
                href="/kegiatan/kalender"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  pathname === '/kegiatan/kalender'
                    ? 'gradient-mnsbdi text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-indigo-900'
                }`}
              >
                <CalendarIcon size={16} />
                <span>Kalender</span>
              </Link>

              <Link
                href="/profil"
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  pathname === '/profil'
                    ? 'gradient-mnsbdi text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-indigo-900'
                }`}
              >
                <UserCheck size={16} />
                <span>Profil Saya</span>
              </Link>
            </nav>

            <div className="h-6 w-[1px] bg-purple-100 dark:bg-indigo-900" />

            <ThemeToggle />

            <Link
              href="/dashboard"
              className="text-xs font-extrabold bg-purple-900 hover:bg-purple-800 text-amber-300 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Shield size={14} />
              <span className="hidden sm:inline">Portal Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-100 dark:border-indigo-900 text-center py-6 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#13092b]">
        © 2026 Portal Umat Vihara MNSBDI • Multi-Theme Light & Dark Mode
      </footer>
    </div>
  );
}
