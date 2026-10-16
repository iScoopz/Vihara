import Link from 'next/link';
import { MapPin, ArrowUpRight } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { buttonClass } from '@/components/ui/kit-static';
import { SunriseHero } from '@/components/landing/SunriseHero';
import { Reveal } from '@/components/landing/Reveal';
import { getUpcomingPublicEvents } from '@/lib/public-events';

export const revalidate = 300;

const ADDRESS = 'Jl. Sungai Cenrana No. 39, Makassar';
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Vihara Vimalakirti, ${ADDRESS}`)}`;

// Event dates are shown in Makassar time regardless of where the server runs.
const inMakassar = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar', ...opts });
const timeInMakassar = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit' });

const PORTAL_LINKS = [
  { href: '/kegiatan', title: 'Daftar kegiatan', text: 'Lihat kegiatan yang dibuka dan daftar langsung dari HP.' },
  { href: '/kegiatan/kalender', title: 'Kalender', text: 'Jadwal Gongyo, Kensyu, dan pertemuan dalam satu bulan.' },
  { href: '/profil', title: 'Profil dan riwayat', text: 'Perbarui data diri dan lihat kegiatan yang pernah diikuti.' }
];

export default async function Home() {
  const events = await getUpcomingPublicEvents(4);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      <SunriseHero>
        <header className="w-full max-w-6xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between gap-3">
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
              className="inline-flex items-center min-h-[44px] sm:min-h-[38px] px-4 rounded-lg text-sm font-semibold text-nav-ink ring-1 ring-inset ring-white/20 hover:bg-white/10"
            >
              Masuk
            </Link>
          </div>
        </header>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 flex-1 flex flex-col justify-center pb-[30vh] pt-8">
          <div className="max-w-3xl space-y-6">
            <span className="block w-12 h-[3px] rounded-full bg-gold-line" aria-hidden />
            <p className="text-sm sm:text-base text-nav-ink-2">Majelis Nichiren Shoshu Buddha Dharma Indonesia</p>
            <h1 className="font-display text-[44px] sm:text-6xl lg:text-7xl leading-[1.02] font-semibold">
              Vihara MNSBDI
              <br />
              <span className="text-[#f2c15a]">Sentra Makassar</span>
            </h1>
            <p className="text-base sm:text-lg text-nav-ink-2 max-w-xl">
              Tempat Puja Bhakti umat di Makassar, melayani pembinaan umat di wilayah Sulawesi Selatan.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link
                href="/kegiatan"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg text-sm font-semibold bg-[#f2c15a] text-[#26163a] shadow-[0_8px_24px_-8px_rgba(242,193,90,0.6)] hover:bg-[#f6cd70]"
              >
                Lihat kegiatan
              </Link>
              <Link
                href="#kunjungi"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg text-sm font-semibold text-nav-ink ring-1 ring-inset ring-white/25 hover:bg-white/10"
              >
                Alamat sekretariat
              </Link>
            </div>
          </div>
        </div>
      </SunriseHero>

      <main className="flex-1">
        <section aria-labelledby="kegiatan-heading" className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-3">
              <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
              <h2 id="kegiatan-heading" className="text-3xl sm:text-4xl font-semibold text-ink">Kegiatan terdekat</h2>
            </div>
            <Link href="/kegiatan/kalender" className="text-sm font-semibold text-brand-ink hover:underline underline-offset-4">
              Lihat kalender lengkap
            </Link>
          </Reveal>

          {events.length === 0 ? (
            <Reveal>
              <div className="rounded-xl border border-line bg-surface shadow-panel p-8 text-center space-y-2">
                <p className="font-display text-xl font-semibold text-ink">Belum ada kegiatan yang diumumkan.</p>
                <p className="text-sm text-ink-2">Jadwal baru akan tampil di sini begitu pengurus menerbitkannya.</p>
              </div>
            </Reveal>
          ) : (
            <ol className="grid gap-4 md:grid-cols-2">
              {events.map((ev, i) => (
                <li key={ev.id}>
                  <Reveal delay={i * 80} className="h-full">
                    <Link
                      href="/kegiatan"
                      className="group h-full flex gap-5 rounded-xl border border-line bg-surface shadow-panel p-5 hover:-translate-y-0.5 hover:shadow-raised transition-[transform,box-shadow] duration-200"
                    >
                      <div className="shrink-0 w-16 text-center rounded-lg bg-nav text-nav-ink py-2.5" aria-hidden>
                        <p className="text-[11px] text-nav-ink-2">{inMakassar(ev.event_date, { month: 'short' })}</p>
                        <p className="font-display text-3xl font-semibold leading-none tabular-nums">{inMakassar(ev.event_date, { day: 'numeric' })}</p>
                        <p className="text-[11px] text-[#f2c15a] mt-0.5">{inMakassar(ev.event_date, { weekday: 'short' })}</p>
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        {ev.category && <p className="text-xs font-medium text-brand-ink">{ev.category}</p>}
                        <h3 className="font-display text-xl font-semibold text-ink leading-snug break-words group-hover:text-brand-ink">{ev.title}</h3>
                        <p className="text-sm text-ink-2">
                          <span className="sr-only">{inMakassar(ev.event_date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, </span>
                          Pukul {timeInMakassar(ev.event_date)} WITA
                        </p>
                        {ev.location && (
                          <p className="text-sm text-ink-3 flex items-start gap-1.5">
                            <MapPin size={14} aria-hidden className="mt-0.5 shrink-0" />
                            <span className="break-words">{ev.location}</span>
                          </p>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-labelledby="portal-heading" className="bg-surface-2 border-y border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 items-start">
            <Reveal className="space-y-4 lg:sticky lg:top-12">
              <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
              <h2 id="portal-heading" className="text-3xl sm:text-4xl font-semibold text-ink leading-tight">
                Portal umat, cukup dari HP
              </h2>
              <p className="text-base text-ink-2 max-w-md">
                Umat yang sudah terdata bisa mendaftar kegiatan sendiri tanpa menunggu dicatat pengurus.
              </p>
              <Link href="/login" className={`${buttonClass('primary')} mt-2`}>Masuk ke portal</Link>
            </Reveal>

            <ol className="divide-y divide-line border-y border-line">
              {PORTAL_LINKS.map((item, i) => (
                <li key={item.href}>
                  <Reveal delay={i * 80}>
                    <Link href={item.href} className="group flex items-start gap-5 py-6 hover:bg-surface/70 -mx-3 px-3 rounded-lg">
                      <span className="font-display text-4xl font-semibold leading-none text-gold-line tabular-nums w-10 shrink-0" aria-hidden>
                        {i + 1}
                      </span>
                      <span className="flex-1 min-w-0 space-y-1">
                        <span className="flex items-center gap-1.5 font-display text-xl font-semibold text-ink group-hover:text-brand-ink">
                          {item.title}
                          <ArrowUpRight size={16} aria-hidden className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition duration-200" />
                        </span>
                        <span className="block text-sm text-ink-2">{item.text}</span>
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="kunjungi" aria-labelledby="kunjungi-heading" className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 scroll-mt-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-nav text-nav-ink p-8 sm:p-12 shadow-raised">
              {/* The sun motif returns, low on the horizon, to close the page. */}
              <div aria-hidden className="absolute -right-24 -bottom-40 w-96 aspect-square rounded-full bg-[radial-gradient(circle,rgba(242,193,90,0.35)_0%,rgba(242,193,90,0.08)_45%,transparent_70%)]" />
              <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
                <div className="space-y-4">
                  <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
                  <h2 id="kunjungi-heading" className="text-3xl sm:text-4xl font-semibold">Kunjungi sekretariat</h2>
                  <address className="not-italic font-display text-xl sm:text-2xl leading-snug text-nav-ink">
                    Vihara Vimalakirti Sentra Makassar
                    <br />
                    <span className="text-nav-ink-2">{ADDRESS}</span>
                  </address>
                </div>
                <div className="flex flex-col gap-2.5 md:items-end">
                  <a
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-lg text-sm font-semibold bg-[#f2c15a] text-[#26163a] hover:bg-[#f6cd70]"
                  >
                    <MapPin size={16} aria-hidden />
                    Buka di Google Maps
                  </a>
                  <Link
                    href="/kegiatan"
                    className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-lg text-sm font-semibold text-nav-ink ring-1 ring-inset ring-white/25 hover:bg-white/10"
                  >
                    Lihat jadwal kegiatan
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-ink-3">
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
