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
          <h1 className="text-[28px] leading-tight font-semibold">Khusus pengurus</h1>
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
    <nav aria-label="Menu pengurus" className="px-3 py-4 space-y-0.5">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`flex items-center gap-3 px-3 min-h-[44px] md:min-h-[38px] rounded-lg text-sm ${
              isActive
                ? 'bg-nav-active text-nav-ink font-semibold'
                : 'text-nav-ink-2 hover:text-nav-ink hover:bg-nav-active'
            }`}
          >
            <Icon size={17} aria-hidden className={isActive ? 'text-gold-line' : 'opacity-80'} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const brandBlock = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gold-line text-nav flex items-center justify-center font-display font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" aria-hidden>
        MN
      </div>
      <div className="leading-tight">
        <p className="font-display font-semibold text-[15px] text-nav-ink">Vihara MNSBDI</p>
        <p className="text-xs text-nav-ink-2">Sentra Makassar</p>
      </div>
    </div>
  );

  const accountBlock = (onNavigate?: () => void) => (
    <div className="p-3 border-t border-nav-line space-y-1">
      <Link
        href="/kegiatan"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 min-h-[44px] md:min-h-[38px] rounded-lg text-sm text-nav-ink-2 hover:text-nav-ink hover:bg-nav-active"
      >
        <UserCheck size={17} aria-hidden className="opacity-80" />
        Portal umat
      </Link>
      <ThemeToggle tone="nav" block />
      <div className="flex items-center justify-between gap-2 pl-3 pt-2">
        <Link href="/admin-profile" onClick={onNavigate} className="flex items-center gap-2.5 min-w-0 min-h-[44px] md:min-h-0 hover:opacity-80">
          <span className="w-8 h-8 shrink-0 rounded-full bg-nav-active text-nav-ink font-semibold flex items-center justify-center text-[11px] ring-1 ring-nav-line" aria-hidden>
            {initials}
          </span>
          <span className="text-sm font-medium text-nav-ink truncate">{adminUser?.full_name || 'Pengurus'}</span>
        </Link>
        <button
          onClick={handleAdminLogout}
          aria-label="Keluar"
          title="Keluar"
          className="w-11 h-11 md:w-9 md:h-9 shrink-0 inline-flex items-center justify-center rounded-lg text-nav-ink-2 hover:text-nav-ink hover:bg-nav-active cursor-pointer"
        >
          <LogOut size={16} aria-hidden />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col md:flex-row">
      <aside className="hidden md:flex w-64 bg-nav flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div className="overflow-y-auto">
          <div className="px-5 h-16 flex items-center border-b border-nav-line">{brandBlock}</div>
          {navList()}
        </div>
        {accountBlock()}
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#140b20]/55 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden />
      )}

      <div
        className={`fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-nav z-50 flex flex-col justify-between transition-transform duration-200 md:hidden shadow-raised ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full invisible'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="overflow-y-auto">
          <div className="pl-5 pr-2 h-16 flex items-center justify-between border-b border-nav-line">
            {brandBlock}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Tutup menu"
              className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-nav-ink-2 hover:bg-nav-active cursor-pointer"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          {navList(() => setIsMobileMenuOpen(false))}
        </div>
        {accountBlock(() => setIsMobileMenuOpen(false))}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Phones get a top bar; on desktop the sidebar carries brand and controls. */}
        <header className="md:hidden h-14 bg-nav px-2 flex items-center gap-1 sticky top-0 z-40">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Buka menu"
            className="w-11 h-11 inline-flex items-center justify-center text-nav-ink hover:bg-nav-active rounded-lg cursor-pointer"
          >
            <Menu size={20} aria-hidden />
          </button>
          {brandBlock}
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
