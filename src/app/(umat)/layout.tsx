'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, UserCheck, Calendar as CalendarIcon } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

const UMAT_NAV = [
  { href: '/kegiatan', label: 'Kegiatan', icon: CalendarDays },
  { href: '/kegiatan/kalender', label: 'Kalender', icon: CalendarIcon },
  { href: '/profil', label: 'Profil saya', icon: UserCheck }
];

export default function UmatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navLinks = (mobile: boolean) =>
    UMAT_NAV.map(item => {
      const Icon = item.icon;
      const isActive = pathname === item.href;
      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive ? 'page' : undefined}
          className={`flex items-center justify-center gap-2 px-3 rounded-lg text-sm ${
            mobile ? 'flex-1 min-h-[44px]' : 'min-h-[36px]'
          } ${isActive ? 'bg-nav-active text-nav-ink font-semibold' : 'text-nav-ink-2 hover:text-nav-ink hover:bg-nav-active'}`}
        >
          <Icon size={16} aria-hidden className={isActive ? 'text-gold-line' : 'opacity-80'} />
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <header className="bg-nav text-nav-ink sticky top-0 z-40 shadow-[0_1px_0_rgba(0,0,0,0.2)]">
        <div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 shrink-0 rounded-lg bg-gold-line text-nav flex items-center justify-center font-display font-bold text-sm" aria-hidden>
              MN
            </span>
            <span className="leading-tight min-w-0">
              <span className="block font-display font-semibold text-[15px] text-nav-ink truncate">Portal Umat MNSBDI</span>
              <span className="block text-xs text-nav-ink-2">Sentra Makassar</span>
            </span>
          </Link>

          <nav aria-label="Menu umat" className="hidden md:flex items-center gap-1">
            {navLinks(false)}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle tone="nav" />
            <Link
              href="/login"
              className="inline-flex items-center min-h-[44px] sm:min-h-[36px] px-3 rounded-lg text-sm font-semibold text-nav-ink ring-1 ring-inset ring-nav-line hover:bg-nav-active"
            >
              Pengurus
            </Link>
          </div>
        </div>

        <nav aria-label="Menu umat" className="md:hidden flex gap-1 px-2 py-1 border-t border-nav-line">
          {navLinks(true)}
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 md:py-10">
        {children}
      </main>

      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-3">
          <p>© 2026 Majelis Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI) Sentra Makassar</p>
          <nav aria-label="Tautan bawah" className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/" className="py-2 hover:text-ink">Beranda</Link>
            <Link href="/kegiatan" className="py-2 hover:text-ink">Kegiatan</Link>
            <Link href="/profil" className="py-2 hover:text-ink">Profil</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
