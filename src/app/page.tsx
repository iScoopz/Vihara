import Link from 'next/link';
import ThemeToggle from '@/components/ui/theme-toggle';
import { buttonClass } from '@/components/ui/kit-static';

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <header className="h-14 border-b border-line bg-surface sticky top-0 z-40">
        <div className="max-w-3xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 shrink-0 rounded-lg bg-brand text-on-brand flex items-center justify-center font-bold text-xs" aria-hidden>
              MN
            </span>
            <span className="leading-tight min-w-0">
              <span className="block font-semibold text-sm text-ink truncate">Vihara MNSBDI</span>
              <span className="block text-xs text-ink-3">Sentra Makassar</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/login" className={buttonClass('secondary', 'sm')}>Masuk</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">Vihara MNSBDI Sentra Makassar</h1>
          <p className="text-base text-ink-2 max-w-xl">
            Tempat Puja Bhakti umat Majelis Nichiren Shoshu Buddha Dharma Indonesia di Makassar, melayani pembinaan umat
            di wilayah Sulawesi Selatan.
          </p>
        </section>

        <section aria-labelledby="kegiatan-heading" className="space-y-3 border-t border-line pt-8">
          <h2 id="kegiatan-heading" className="text-base font-semibold text-ink">Kegiatan</h2>
          <p className="text-sm text-ink-2 max-w-xl">
            Jadwal Kensyu, Gongyo bersama mingguan, pertemuan rutin, dan peringatan hari besar. Umat yang sudah punya akun
            bisa mendaftar langsung dari daftar kegiatan.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Link href="/kegiatan" className={buttonClass('primary')}>Lihat daftar kegiatan</Link>
            <Link href="/kegiatan/kalender" className={buttonClass('secondary')}>Buka kalender</Link>
          </div>
        </section>

        <section aria-labelledby="alamat-heading" className="space-y-2 border-t border-line pt-8">
          <h2 id="alamat-heading" className="text-base font-semibold text-ink">Alamat sekretariat</h2>
          <address className="not-italic text-sm text-ink-2">
            Vihara Vimalakirti Sentra Makassar
            <br />
            Jl. Sungai Cenrana No. 39, Makassar
          </address>
        </section>

        <section aria-labelledby="masuk-heading" className="space-y-3 border-t border-line pt-8">
          <h2 id="masuk-heading" className="text-base font-semibold text-ink">Masuk ke akun</h2>
          <p className="text-sm text-ink-2 max-w-xl">
            Umat masuk untuk mendaftar kegiatan dan melihat riwayat. Pengurus masuk untuk mengelola data umat, event, dana,
            dan inventaris.
          </p>
          <div>
            <Link href="/login" className={buttonClass('secondary')}>Masuk sebagai umat atau pengurus</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-3">
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
