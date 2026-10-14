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
  UserX,
  Menu,
  X
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/umat', label: 'Data Umat', icon: Users },
  { href: '/events', label: 'Kelola Event', icon: CalendarDays },
  { href: '/belum-daftar', label: 'Umat Belum Daftar', icon: UserX },
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

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-neutral-900 dark:text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shadow-xs">
          <Shield size={32} />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Akses Pengurus Dibatasi</h2>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
            Halaman ini khusus untuk Pengurus Vihara MNSBDI. Silakan masuk terlebih dahulu untuk mengakses portal administrasi.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Shield size={15} />
            <span>Masuk Portal Pengurus</span>
          </Link>

          <Link
            href="/kegiatan"
            className="px-6 py-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-neutral-800 dark:text-neutral-200 font-semibold text-xs border border-black/[0.06] dark:border-white/[0.08] transition-all"
          >
            Kembali ke Portal Umat
          </Link>
        </div>
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#86868b] flex items-center justify-center font-medium text-xs">
        Memeriksa Autentikasi Pengurus...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col md:flex-row font-sans transition-colors duration-200">
      
      {/* Desktop macOS-style Sidebar */}
      <aside className="hidden md:flex w-64 bg-white/70 dark:bg-[#121214]/70 backdrop-blur-xl border-r border-black/[0.06] dark:border-white/[0.08] flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen transition-all">
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2e1065] text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs">
              MN
            </div>
            <div>
              <h2 className="font-semibold text-xs tracking-tight text-neutral-900 dark:text-white leading-none">
                Vihara MNSBDI
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] tracking-wide font-medium text-[#86868b] mt-0.5">
                Portal Pengurus
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-0.5">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-black/[0.07] dark:bg-white/[0.12] text-neutral-900 dark:text-white font-semibold'
                      : 'text-[#86868b] hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05] font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={isActive ? 'text-[#5e35b1] dark:text-amber-400' : 'text-[#86868b]'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#5e35b1] dark:bg-amber-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
          <Link
            href="/kegiatan"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-black/[0.06] dark:border-white/[0.08] transition-all"
          >
            <UserCheck size={14} className="text-[#86868b]" />
            <span>Lihat Portal Umat</span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <Link 
              href="/admin-profile" 
              className="flex items-center gap-2.5 group hover:opacity-90 transition cursor-pointer"
              title="Edit Profil Pengurus"
            >
              <div className="w-7 h-7 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold flex items-center justify-center text-[10px] shadow-xs">
                {adminUser?.full_name ? adminUser.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate w-24">
                  {adminUser?.full_name || 'Pengurus Admin'}
                </p>
                <p className="text-[10px] text-[#86868b]">Edit Profil</p>
              </div>
            </Link>

            <button
              onClick={handleAdminLogout}
              className="text-[#86868b] hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg transition cursor-pointer"
              title="Keluar dari Portal Pengurus"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <div className={`fixed top-0 left-0 bottom-0 w-72 bg-[#f5f5f7] dark:bg-[#121214] text-neutral-900 dark:text-white z-50 flex flex-col justify-between transition-transform duration-300 md:hidden border-r border-black/[0.08] dark:border-white/[0.08] ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div>
          <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2e1065] text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs">
                MN
              </div>
              <div>
                <h2 className="font-semibold text-xs tracking-tight text-neutral-900 dark:text-white">Vihara MNSBDI</h2>
                <span className="text-[10px] text-[#86868b] font-medium">
                  Portal Pengurus
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 text-[#86868b] hover:text-neutral-900 dark:hover:text-white rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="p-3 space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    isActive
                      ? 'bg-black/[0.08] dark:bg-white/[0.12] text-neutral-900 dark:text-white font-semibold'
                      : 'text-[#86868b] hover:text-neutral-900 dark:hover:text-white font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-[#5e35b1] dark:text-amber-400' : 'text-[#86868b]'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#5e35b1] dark:bg-amber-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
          <Link
            href="/kegiatan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-black/[0.06] dark:border-white/[0.08]"
          >
            <UserCheck size={14} className="text-[#86868b]" />
            <span>Lihat Portal Umat</span>
          </Link>
          <div className="flex items-center justify-between pt-1">
            <Link 
              href="/admin-profile" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs text-neutral-900 dark:text-white font-semibold truncate w-40"
            >
              {adminUser?.full_name || 'Admin'}
            </Link>
            <button 
              onClick={handleAdminLogout} 
              className="text-[#86868b] hover:text-rose-500 p-1 cursor-pointer"
              title="Keluar dari Portal Pengurus"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 sm:h-16 border-b border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7]/80 dark:bg-black/80 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] rounded-xl md:hidden cursor-pointer"
              title="Buka Menu Sidebar"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Sistem Informasi Vihara</span>
              </h1>
              <p className="text-[10px] text-[#86868b] hidden sm:block">Sentra Makassar, Sulawesi</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/admin-profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] text-xs font-medium text-neutral-900 dark:text-white hover:bg-black/[0.07] dark:hover:bg-white/[0.14] transition-all"
              title="Edit Profil Pengurus"
            >
              <div className="w-5 h-5 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold text-[9px] flex items-center justify-center">
                {adminUser?.full_name ? adminUser.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <span className="hidden md:inline">{adminUser?.full_name || 'Pengurus Admin'}</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Output */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
