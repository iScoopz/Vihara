import Link from 'next/link';
import { ShieldCheck, UserCheck, Calendar, HeartHandshake, PackageCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              🪷
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Sistem Informasi Vihara</h1>
              <p className="text-xs text-amber-400 font-medium">Vihara Dhammacakka & Cetya</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition"
            >
              Masuk / Login
            </Link>
            <Link 
              href="/kegiatan"
              className="text-sm font-medium bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg transition shadow-md shadow-amber-500/20"
            >
              Portal Umat
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles size={14} />
            <span>Platform Operasional Vihara & Member Portal Hibrida</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Pengelolaan Vihara yang Terintegrasi & Modern
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed">
            Sistem Informasi Vihara terpadu dengan integrasi Supabase Auth & Database. 
            Melayani Portal Admin untuk direktori umat, siklus event, dana paramita, dan inventaris, 
            serta Portal Umat untuk jadwal kegiatan & pendaftaran mandiri.
          </p>

          {/* Call to Action Grid */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl mx-auto">
            {/* Admin Portal Card */}
            <Link 
              href="/dashboard"
              className="group p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between text-left"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Portal Admin Vihara</h3>
                <p className="text-sm text-slate-400">
                  Akses Pengurus Vihara untuk Statistik Umat, Siklus Event, RAB Keuangan, Dana Paramita, & Inventaris Stok.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-amber-400 text-sm font-semibold group-hover:translate-x-1 transition">
                <span>Buka Portal Admin</span>
                <ArrowRight size={16} />
              </div>
            </Link>

            {/* Umat Portal Card */}
            <Link 
              href="/kegiatan"
              className="group p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col justify-between text-left"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <UserCheck size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Portal Umat (Member Area)</h3>
                <p className="text-sm text-slate-400">
                  Lihat Jadwal Kegiatan Puja Bhakti, daftar event mandiri (pendaftaran hibrida), dan pantau riwayat partisipasi.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-semibold group-hover:translate-x-1 transition">
                <span>Masuk Portal Umat</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <div className="text-amber-400"><Calendar size={20} /></div>
            <h4 className="font-semibold text-white">Siklus Event Lengkap</h4>
            <p className="text-xs text-slate-400">Rencana event, susunan panitia, RAB vs Realisasi, & presensi kehadiran.</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <div className="text-emerald-400"><HeartHandshake size={20} /></div>
            <h4 className="font-semibold text-white">Dana Paramita</h4>
            <p className="text-xs text-slate-400">Pencatatan donasi teratur untuk operasional, pembangunan, & sosial.</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <div className="text-blue-400"><PackageCheck size={20} /></div>
            <h4 className="font-semibold text-white">Manajemen Inventaris</h4>
            <p className="text-xs text-slate-400">Pelacakan stok dupa, lilin, minyak pelita, dan barang kebaktian.</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
            <div className="text-purple-400"><Sparkles size={20} /></div>
            <h4 className="font-semibold text-white">Widget Ultah Opsional</h4>
            <p className="text-xs text-slate-400">Notifikasi dinamis ulang tahun umat di bulan berjalan jika ada data.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 text-center py-6 text-xs text-slate-500">
        © 2026 Sistem Informasi Vihara • Powered by Next.js & Supabase Database
      </footer>
    </div>
  );
}
