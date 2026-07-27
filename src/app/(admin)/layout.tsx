'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

const ADMIN_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/umat', label: 'Data Umat', icon: Users },
  { href: '/events', label: 'Kelola Event', icon: CalendarDays },
  { href: '/calendar', label: 'Kalender Kegiatan', icon: CalendarIcon },
  { href: '/donations', label: 'Dana Paramita', icon: HeartHandshake },
  { href: '/inventory', label: 'Inventaris & POS', icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0717] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2e1065] dark:bg-[#13092b] border-r border-purple-900/40 text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-purple-800/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-mnsbdi flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
              🪷
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">Vihara System</h2>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30">
                <Shield size={10} /> Portal Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/25'
                      : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-slate-950" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-purple-800/40 space-y-3">
          <Link
            href="/kegiatan"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-xs font-bold text-amber-300 border border-purple-700/50 transition shadow-sm"
          >
            <UserCheck size={14} />
            <span>Lihat Portal Umat</span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-xs shadow-md">
                HK
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white truncate w-24">Hendra K.</p>
                <p className="text-[10px] text-purple-300">Pengurus Admin</p>
              </div>
            </div>

            <Link href="/login" className="text-purple-300 hover:text-rose-400 p-1.5 rounded-lg transition" title="Logout">
              <LogOut size={16} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-purple-100 dark:border-purple-900/60 bg-white dark:bg-[#160e29] px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors">
          <div>
            <h1 className="text-sm font-bold text-purple-950 dark:text-purple-100 flex items-center gap-2">
              <span>Sistem Informasi Vihara</span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Supabase Connected • Next.js App Router</p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs">
              System Online
            </span>
          </div>
        </header>

        {/* Dynamic Page Output */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
