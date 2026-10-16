import Link from 'next/link';
import ThemeToggle from '@/components/ui/theme-toggle';
import { buttonClass } from '@/components/ui/kit-static';

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* The aubergine band carries the vihara's name; the rest of the page is practical information. */}
      <div className="bg-nav text-nav-ink">
        <header className="max-w-4xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 shrink-0 rounded-lg bg-gold-line text-nav flex items-center justify-center font-display font-bold text-sm" aria-hidden>
              MN
            </span>
            <span className="leading-tight min-w-0">
              <span className="block font-display font-semibold text-[15px] truncate">Vihara MNSBDI</span>
              <span className="block text-xs text-nav-ink-2">Sentra Makassar</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle tone="nav" />
            <Link
              href="/login"
              className="inline-flex items-center min-h-[44px] sm:min-h-[38px] px-4 rounded-lg text-sm font-semibold text-nav-ink ring-1 ring-inset ring-nav-line hover:bg-nav-active"
            >
              Masuk
            </Link>
          </div>
        </header>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-14 sm:pt-16 sm:pb-20 space-y-5">
          <span className="block w-10 h-[3px] rounded-full bg-gold-line" aria-hidden />
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] font-semibold max-w-2xl">
            Vihara MNSBDI Sentra Makassar
          </h1>
          <p className="text-base sm:text-lg text-nav-ink-2 max-w-xl">
            Tempat Puja Bhakti umat Majelis Nichiren Shoshu Buddha Dharma Indonesia di Makassar, melayani pembinaan umat
            di wilayah Sulawesi Selatan.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href="/kegiatan"
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg text-sm font-semibold bg-gold-line text-nav shadow-button hover:brightness-105"
            >
              Lihat daftar kegiatan
            </Link>
            <Link
              href="/kegiatan/kalender"
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-lg text-sm font-semibold text-nav-ink ring-1 ring-inset ring-nav-line hover:bg-nav-active"
            >
              Buka kalender
            </Link>
          </div>
        </section>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 -mt-6 pb-12 grid gap-4 sm:grid-cols-5">
        <section aria-labelledby="kegiatan-heading" className="sm:col-span-3 rounded-xl bg-surface border border-line shadow-panel p-6 space-y-2">
          <h2 id="kegiatan-heading" className="text-xl font-semibold text-ink">Kegiatan</h2>
          <p className="text-sm text-ink-2">
            Jadwal Kensyu, Gongyo bersama mingguan, pertemuan rutin, dan peringatan hari besar. Umat yang sudah punya akun
            bisa mendaftar langsung dari daftar kegiatan.
          </p>
        </section>

        <section aria-labelledby="alamat-heading" className="sm:col-span-2 rounded-xl bg-surface border border-line shadow-panel p-6 space-y-2">
          <h2 id="alamat-heading" className="text-xl font-semibold text-ink">Alamat sekretariat</h2>
          <address className="not-italic text-sm text-ink-2">
            Vihara Vimalakirti Sentra Makassar
            <br />
            Jl. Sungai Cenrana No. 39, Makassar
          </address>
        </section>

        <section aria-labelledby="masuk-heading" className="sm:col-span-5 rounded-xl bg-surface-2 border border-line p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 id="masuk-heading" className="text-xl font-semibold text-ink">Masuk ke akun</h2>
            <p className="text-sm text-ink-2 max-w-xl">
              Umat masuk untuk mendaftar kegiatan dan melihat riwayat. Pengurus masuk untuk mengelola data umat, event, dana,
              dan inventaris.
            </p>
          </div>
          <Link href="/login" className={`${buttonClass('primary')} shrink-0`}>Masuk sebagai umat atau pengurus</Link>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-3">
          <p>© 2026 Majelis Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI) Sentra Makassar</p>
          <nav aria-label="Tautan bawah" className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/kegiatan" className="py-2 hover:text-ink">Kegiatan</Link>
            <Link href="/kegiatan/kalender" className="py-2 hover:text-ink">Kalender</Link>
            <Link href="/login" className="py-2 hover:text-ink">Masuk</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
