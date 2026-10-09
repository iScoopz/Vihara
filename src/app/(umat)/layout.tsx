'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, UserCheck, Calendar as CalendarIcon, Shield } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function UmatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/kegiatan', label: 'Katalog Event', icon: CalendarDays },
    { href: '/kegiatan/kalender', label: 'Kalender', icon: CalendarIcon },
    { href: '/profil', label: 'Profil Saya', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col font-sans transition-colors duration-200">
      {/* Apple-style Translucent Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#f5f5f7]/80 dark:bg-black/80 border-b border-black/[0.06] dark:border-white/[0.08] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/kegiatan" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full bg-[#2e1065] text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                MN
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs sm:text-sm tracking-tight text-neutral-900 dark:text-white leading-none">
                  Portal Umat MNSBDI
                </span>
                <span className="text-[10px] text-[#86868b] tracking-normal font-medium mt-0.5">
                  Sentra Makassar
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Apple Segmented Pill Navigation */}
            <nav className="p-1 bg-black/[0.04] dark:bg-white/[0.08] rounded-full flex items-center gap-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-white dark:bg-[#2c2c2e] text-neutral-900 dark:text-white font-semibold shadow-xs'
                        : 'text-[#86868b] hover:text-neutral-900 dark:hover:text-white font-medium hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon size={13} className={isActive ? 'text-[#5e35b1] dark:text-amber-400' : 'text-[#86868b]'} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="h-4 w-[1px] bg-black/[0.08] dark:bg-white/[0.12] mx-1" />

            <ThemeToggle />

            <Link
              href="/login"
              className="text-xs font-medium bg-[#1d1d1f] hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Shield size={13} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] text-center py-6 text-xs text-[#86868b] bg-[#f5f5f7] dark:bg-black">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Majelis Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI) Sentra Makassar</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Beranda</Link>
            <Link href="/kegiatan" className="hover:text-black dark:hover:text-white transition-colors">Kegiatan</Link>
            <Link href="/profil" className="hover:text-black dark:hover:text-white transition-colors">Profil</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
