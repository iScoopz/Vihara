import Link from 'next/link';
import { 
  Shield, 
  UserCheck, 
  CalendarDays, 
  HeartHandshake, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Clock, 
  BookOpen, 
  Flower2, 
  CheckCircle2 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0717] text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-purple-900/40 bg-[#13092b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-mnsbdi flex items-center justify-center text-white font-black text-xl shadow-lg shadow-purple-900/40">
              🪷
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                Vihara MNSBDI
              </h1>
              <p className="text-[11px] text-amber-300 font-semibold tracking-wide">
                Sentra Makassar — Sulawesi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/kegiatan"
              className="text-xs sm:text-sm font-extrabold text-purple-200 hover:text-white px-3 py-2 rounded-xl hover:bg-purple-900/50 transition flex items-center gap-1.5"
            >
              <UserCheck size={16} className="text-amber-400" />
              <span className="hidden sm:inline">Katalog</span> Kegiatan Umat
            </Link>

            <Link 
              href="/login"
              className="text-xs sm:text-sm font-extrabold gradient-mnsbdi text-white px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-900/30 hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
            >
              <Shield size={16} />
              <span>Login Pengurus / Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center space-y-16">
        
        {/* Main Banner Text */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-700/50 text-amber-300 text-xs font-bold shadow-inner">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>Majelis Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Mewujudkan Harmoni & Kebijaksanaan <span className="gradient-mnsbdi bg-clip-text text-transparent">Buddha Dharma</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Selamat datang di Portal Resmi Informasi Vihara MNSBDI Sentra Makassar. 
            Wadah informasi untuk keseluruhan umat.
          </p>

          {/* Action Buttons for Umat & Admin */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link 
              href="/kegiatan"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <UserCheck size={18} />
              <span>Buka Portal Kegiatan Umat</span>
              <ArrowRight size={16} />
            </Link>

            <Link 
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-extrabold text-xs sm:text-sm border border-purple-700/50 transition flex items-center justify-center gap-2"
            >
              <Shield size={18} className="text-purple-400" />
              <span>Akses Khusus Pengurus Admin</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-3xl bg-[#160e29] border border-purple-900/60 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-900/60 text-purple-300 flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Puja Bhakti & Event Rutin</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Jadwal pelaksanaan Kensyu, Ibadah Rutin mingguan, dan peringatan hari besar keagamaan Vihara MNSBDI.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#160e29] border border-purple-900/60 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <HeartHandshake size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Dana Paramita (Kebajikan)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fasilitas pencatatan kebajikan Dana Paramita Umat secara akurat, transparan, dan terstruktur.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#160e29] border border-purple-900/60 space-y-3 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-white">Manajemen Pengurus Terpadu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sistem manajemen tertutup khusus Pengurus Admin untuk pengorganisasian Panitia, RAB Keuangan, & Laporan LPJ.
            </p>
          </div>
        </div>

        {/* Info Banner Sekretariat */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border border-purple-800/60 text-xs sm:text-sm text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
              📍 Alamat Sekretariat Vihara:
            </span>
            <p className="font-bold text-white text-sm">
              Jl. Sungai Cenrana No.39, Makassar — Vihara Vimalakirti Sentra Makassar
            </p>
          </div>

          <Link 
            href="/kegiatan/kalender"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-amber-300 text-xs font-extrabold border border-purple-700 transition"
          >
            Lihat Kalender Kegiatan
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-[#080412] py-6 text-center text-xs text-slate-500">
        <p>© 2026 Majelis Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI) Sentra Makassar. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
