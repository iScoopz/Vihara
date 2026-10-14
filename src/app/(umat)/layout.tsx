'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, UserCheck, Calendar as CalendarIcon } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { buttonClass } from '@/components/ui/kit';

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
          } ${isActive ? 'bg-brand-soft text-brand-ink font-semibold' : 'text-ink-2 hover:text-ink hover:bg-surface-2'}`}
        >
          <Icon size={16} aria-hidden className={isActive ? 'text-brand-ink' : 'text-ink-3'} />
          <span>{item.label}</span>
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <header className="bg-surface border-b border-line sticky top-0 z-40">
        <div className="max-w-5xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 shrink-0 rounded-lg bg-brand text-on-brand flex items-center justify-center font-bold text-xs" aria-hidden>
              MN
            </span>
            <span className="leading-tight min-w-0">
              <span className="block font-semibold text-sm text-ink truncate">Portal Umat MNSBDI</span>
              <span className="block text-xs text-ink-3">Sentra Makassar</span>
            </span>
          </Link>

          <nav aria-label="Menu umat" className="hidden md:flex items-center gap-1">
            {navLinks(false)}
          </nav>

          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
            <Link href="/login" className={buttonClass('secondary', 'sm')}>Pengurus</Link>
          </div>
        </div>

        <nav aria-label="Menu umat" className="md:hidden flex gap-1 px-2 py-1 border-t border-line">
          {navLinks(true)}
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      <footer className="border-t border-line bg-surface">
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
