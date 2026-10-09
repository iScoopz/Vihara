import Link from 'next/link';
import { 
  Shield, 
  UserCheck, 
  CalendarDays, 
  HeartHandshake, 
  MapPin, 
  Users,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] flex flex-col font-sans transition-colors duration-200">
      {/* Apple-style Translucent Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#f5f5f7]/80 dark:bg-black/80 border-b border-black/[0.06] dark:border-white/[0.08] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#2e1065] text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              MN
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xs sm:text-sm tracking-tight text-neutral-900 dark:text-white leading-none">
                Vihara MNSBDI
              </span>
              <span className="text-[10px] text-[#86868b] tracking-normal font-medium mt-0.5">
                Sentra Makassar
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link 
              href="/kegiatan"
              className="text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white px-3 py-1.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all flex items-center gap-1.5"
            >
              <UserCheck size={14} className="text-[#86868b]" />
              <span>Kegiatan Umat</span>
            </Link>

            <ThemeToggle />

            <Link 
              href="/login"
              className="text-xs font-medium bg-[#1d1d1f] hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-4 py-1.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Shield size={13} />
              <span>Pengurus</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-14 sm:py-20 md:py-24 space-y-16 sm:space-y-24">
        
        {/* Apple Style Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-[#5e35b1] dark:text-amber-400 bg-purple-500/[0.08] dark:bg-amber-400/[0.1] px-3.5 py-1.2 rounded-full border border-purple-500/[0.12] dark:border-amber-400/[0.15]">
            Majelis Nichiren Shoshu Buddha Dharma Indonesia
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
            Harmoni dan Kebijaksanaan Buddha Dharma
          </h1>

          <p className="text-base sm:text-xl text-[#86868b] dark:text-[#a1a1a6] font-normal leading-relaxed max-w-2xl mx-auto">
            Portal resmi sistem informasi Vihara MNSBDI Sentra Makassar untuk pendaftaran kegiatan umat, jadwal Gongyo dan Kensyu, serta administrasi pengurus.
          </p>

          {/* Action Navigation - Apple Pill Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link 
              href="/kegiatan"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <UserCheck size={16} />
              <span>Buka Jadwal & Katalog</span>
            </Link>

            <Link 
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-neutral-900 dark:text-neutral-100 font-semibold text-xs sm:text-sm border border-black/[0.06] dark:border-white/[0.08] transition-all flex items-center justify-center gap-2"
            >
              <Shield size={16} className="text-[#86868b]" />
              <span>Akses Pengurus</span>
            </Link>
          </div>
        </section>

        {/* Bento Grid Showcase */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between px-1">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-[#86868b]">
              Layanan & Pelaksanaan
            </h2>
            <Link href="/kegiatan" className="text-xs font-medium text-[#5e35b1] dark:text-amber-400 hover:underline flex items-center gap-1">
              Lihat semua <ChevronRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Bento Card 1: Puja Bhakti */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] space-y-4 shadow-xs hover:border-black/15 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/[0.08] text-[#5e35b1] dark:bg-purple-400/[0.12] dark:text-purple-300 flex items-center justify-center font-bold">
                  <CalendarDays size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    Puja Bhakti & Kensyu Rutin
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    Informasi jadwal pelaksanaan Kensyu, Gongyo bersama mingguan, dan peringatan hari besar keagamaan Vihara MNSBDI.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  href="/kegiatan" 
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5e35b1] dark:text-amber-400 group-hover:gap-1.5 transition-all"
                >
                  <span>Lihat Jadwal Terdekat</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Bento Card 2: Dana Paramita */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] space-y-4 shadow-xs hover:border-black/15 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/[0.1] text-amber-700 dark:bg-amber-400/[0.12] dark:text-amber-400 flex items-center justify-center font-bold">
                  <HeartHandshake size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    Dana Paramita (Kebajikan)
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    Pencatatan kebajikan Dana Paramita Umat secara akurat, transparan, dan terstruktur untuk operasional serta sarana ibadah.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5e35b1] dark:text-amber-400 group-hover:gap-1.5 transition-all"
                >
                  <span>Pencatatan Pengurus</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

            {/* Bento Card 3: Manajemen Pengurus */}
            <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] space-y-4 shadow-xs hover:border-black/15 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-black/[0.04] text-neutral-800 dark:bg-white/[0.08] dark:text-neutral-200 flex items-center justify-center font-bold">
                  <Users size={22} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    Sistem Organisasi Pengurus
                  </h3>
                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                    Pengelolaan kepanitiaan, data keanggotaan Umat per-HAN/Cetya, inventaris dupa/lilin, serta penyusunan anggaran dan laporan.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#5e35b1] dark:text-amber-400 group-hover:gap-1.5 transition-all"
                >
                  <span>Masuk ke Portal Admin</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Location Showcase - Apple Clean Banner */}
        <section className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#86868b] block">
              Sekretariat Vihara
            </span>
            <p className="font-bold text-neutral-900 dark:text-white text-base sm:text-lg tracking-tight">
              Jl. Sungai Cenrana No. 39, Makassar (Vihara Vimalakirti Sentra Makassar)
            </p>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
              Melayani kegiatan pembinaan dan Puja Bhakti Umat di wilayah Sulawesi Selatan.
            </p>
          </div>

          <Link 
            href="/kegiatan/kalender"
            className="shrink-0 px-5 py-2.5 rounded-full bg-black/[0.05] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-neutral-900 dark:text-white text-xs font-semibold border border-black/[0.06] dark:border-white/[0.08] transition-all"
          >
            Buka Kalender Kegiatan
          </Link>
        </section>
      </main>

      {/* Apple-style Minimal Footer */}
      <footer className="border-t border-black/[0.06] dark:border-white/[0.08] bg-[#f5f5f7] dark:bg-black py-8 text-center text-xs text-[#86868b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Majelis Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI) Sentra Makassar</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/kegiatan" className="hover:text-black dark:hover:text-white transition-colors">Katalog Kegiatan</Link>
            <Link href="/kegiatan/kalender" className="hover:text-black dark:hover:text-white transition-colors">Kalender</Link>
            <Link href="/login" className="hover:text-black dark:hover:text-white transition-colors">Portal Pengurus</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
