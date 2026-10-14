'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  HeartHandshake, 
  Package, 
  Calendar as CalendarIcon,
  LogOut, 
  Shield,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { buttonClass } from '@/components/ui/kit';

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/umat', label: 'Data Umat', icon: Users },
  { href: '/events', label: 'Kelola Event', icon: CalendarDays },
  { href: '/calendar', label: 'Kalender Kegiatan', icon: CalendarIcon },
  { href: '/donations', label: 'Dana Paramita', icon: HeartHandshake },
  { href: '/inventory', label: 'Inventaris & POS', icon: Package },
  { href: '/admin-profile', label: 'Profil Saya', icon: Shield }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('vihara_admin_authenticated') === 'true';
      if (!isAuth) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        const storedProfile = localStorage.getItem('vihara_admin_profile');
        if (storedProfile) {
          try {
            setAdminUser(JSON.parse(storedProfile));
          } catch (e) {}
        }
      }
    }
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('vihara_admin_authenticated');
    localStorage.removeItem('vihara_admin_profile');
    document.cookie = 'vihara_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  const initials = adminUser?.full_name
    ? adminUser.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD';

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 text-center gap-5">
        <div className="space-y-2 max-w-md">
          <h1 className="text-xl font-bold tracking-tight">Khusus pengurus</h1>
          <p className="text-sm text-ink-2">
            Halaman ini hanya untuk pengurus Vihara MNSBDI. Masuk dulu dengan akun pengurus.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link href="/login" className={buttonClass('primary')}>Masuk sebagai pengurus</Link>
          <Link href="/kegiatan" className={buttonClass('secondary')}>Ke portal umat</Link>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div role="status" className="min-h-screen bg-canvas text-ink-3 flex items-center justify-center text-sm">
        Memeriksa akses pengurus...
      </div>
    );
  }

  const navList = (onNavigate?: () => void) => (
    <nav aria-label="Menu pengurus" className="p-3 space-y-0.5">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-2.5 px-3 min-h-[44px] md:min-h-[36px] rounded-lg text-sm ${
              isActive
                ? 'bg-brand-soft text-brand-ink font-semibold'
                : 'text-ink-2 hover:text-ink hover:bg-surface-2'
            }`}
          >
            <Icon size={16} aria-hidden className={isActive ? 'text-brand-ink' : 'text-ink-3'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brandBlock = (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-brand text-on-brand flex items-center justify-center font-bold text-xs" aria-hidden>
        MN
      </div>
      <div className="leading-tight">
        <p className="font-semibold text-sm text-ink">Vihara MNSBDI</p>
        <p className="text-xs text-ink-3">Sentra Makassar</p>
      </div>
    </div>
  );

  const accountBlock = (onNavigate?: () => void) => (
    <div className="p-3 border-t border-line space-y-1">
      <Link
        href="/kegiatan"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-3 min-h-[44px] md:min-h-[36px] rounded-lg text-sm text-ink-2 hover:text-ink hover:bg-surface-2"
      >
        <UserCheck size={16} aria-hidden className="text-ink-3" />
        Portal umat
      </Link>
      <div className="flex items-center justify-between gap-2 pl-3 pt-1">
        <Link href="/admin-profile" onClick={onNavigate} className="flex items-center gap-2.5 min-w-0 min-h-[44px] md:min-h-0 hover:opacity-80">
          <span className="w-7 h-7 shrink-0 rounded-full bg-surface-2 text-ink font-semibold flex items-center justify-center text-[11px]" aria-hidden>
            {initials}
          </span>
          <span className="text-sm font-medium text-ink truncate">{adminUser?.full_name || 'Pengurus'}</span>
        </Link>
        <button
          onClick={handleAdminLogout}
          aria-label="Keluar"
          title="Keluar"
          className="w-11 h-11 md:w-9 md:h-9 shrink-0 inline-flex items-center justify-center rounded-lg text-ink-3 hover:text-danger hover:bg-danger-soft cursor-pointer"
        >
          <LogOut size={16} aria-hidden />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row">
      <aside className="hidden md:flex w-60 bg-surface border-r border-line flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          <div className="px-5 h-14 flex items-center border-b border-line">{brandBlock}</div>
          {navList()}
        </div>
        {accountBlock()}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-surface z-50 flex flex-col justify-between transition-transform duration-200 md:hidden border-r border-line ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full invisible'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="overflow-y-auto">
          <div className="pl-5 pr-2 h-14 flex items-center justify-between border-b border-line">
            {brandBlock}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Tutup menu"
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 cursor-pointer"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          {navList(() => setIsMobileMenuOpen(false))}
        </div>
        {accountBlock(() => setIsMobileMenuOpen(false))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-line bg-surface px-2 md:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Buka menu"
              className="w-11 h-11 inline-flex items-center justify-center text-ink-2 hover:bg-surface-2 rounded-lg md:hidden cursor-pointer"
            >
              <Menu size={20} aria-hidden />
            </button>
            <span className="md:hidden">{brandBlock}</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
