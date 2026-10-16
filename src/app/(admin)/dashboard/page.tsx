'use client'

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { getDashboardPageBundle } from '@/lib/actions/vihara-actions';
import { Profile, ViharaEvent, Donation, InventoryItem } from '@/types/database';
import { Button, Fab, PageHeader, Panel, StateMessage, buttonClass } from '@/components/ui/kit';

const LOW_STOCK_LIMIT = 10;

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

// Panel links: a full-width 44px button on phones, a plain text link from sm up.
const panelLinkClass =
  'flex sm:inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] sm:min-h-0 rounded-lg border border-line-strong sm:border-0 text-sm font-medium text-brand hover:underline';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

// birth_date is stored as YYYY-MM-DD; reading the parts avoids a timezone shift from new Date().
const birthParts = (birthDate?: string) => {
  if (!birthDate) return null;
  const [, m, d] = birthDate.split('T')[0].split('-').map(Number);
  if (!m || !d) return null;
  return { month: m, day: d };
};

function CountBars({ counts, total }: { counts: [string, number][]; total: number }) {
  return (
    <ul className="space-y-3">
      {counts.map(([name, count]) => (
        <li key={name} className="space-y-1">
          <div className="flex justify-between gap-3 text-sm">
            <span className={name === 'Belum diisi' ? 'text-ink-3' : 'text-ink-2'}>{name}</span>
            <span className="tabular-nums text-ink font-medium">{count} umat</span>
          </div>
          <div className="w-full bg-surface-2 h-2 rounded-md overflow-hidden">
            <div className="bg-brand h-full rounded-md" style={{ width: `${Math.min(100, (count / (total || 1)) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoadState('loading');
    try {
      const bundle = await getDashboardPageBundle();
      setProfiles(bundle.profiles);
      setEvents(bundle.events);
      setDonations(bundle.donations);
      setInventory(bundle.inventory);
      setLoadState('ready');
    } catch (e) {
      console.error('Dashboard load error:', e);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = now.getMonth() + 1;
  const monthName = now.toLocaleDateString('id-ID', { month: 'long' });

  const nextEvent = events
    .filter(e => new Date(e.event_date) >= startOfToday)
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())[0];
  const upcomingCount = events.filter(e => new Date(e.event_date) >= startOfToday).length;

  const lowStockItems = inventory
    .filter(i => i.stock_quantity <= LOW_STOCK_LIMIT)
    .sort((a, b) => a.stock_quantity - b.stock_quantity);

  const birthdays = profiles
    .map(p => ({ profile: p, parts: birthParts(p.birth_date) }))
    .filter((x): x is { profile: Profile; parts: { month: number; day: number } } => x.parts?.month === thisMonth)
    .sort((a, b) => a.parts.day - b.parts.day);

  const monthDonations = donations.filter(d => {
    const dt = new Date(d.donation_date);
    return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
  });
  const monthDonationTotal = monthDonations.reduce((sum, d) => sum + Number(d.amount), 0);

  const countBy = (pick: (p: Profile) => string | undefined) => {
    const counts: Record<string, number> = {};
    profiles.forEach(p => {
      const key = pick(p) || 'Belum diisi';
      counts[key] = (counts[key] || 0) + 1;
    });
    // Keep "Belum diisi" last so real groups read first.
    return Object.entries(counts).sort((a, b) => {
      if (a[0] === 'Belum diisi') return 1;
      if (b[0] === 'Belum diisi') return -1;
      return b[1] - a[1];
    });
  };
  const hanCounts = countBy(p => p.han);
  const cetyaCounts = countBy(p => p.cetya);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Ringkasan"
        description={`${profiles.length} umat terdata, ${upcomingCount} event mendatang.`}
        actions={
          <Link href="/events/new" className={`${buttonClass('primary')} max-md:hidden`}>
            <Plus size={14} aria-hidden />
            Buat event
          </Link>
        }
      />

      <Fab label="Buat event" icon={<Plus size={18} />} onClick={() => router.push('/events/new')} />

      {loadState === 'loading' && (
        <Panel>
          <StateMessage kind="loading" title="Memuat ringkasan..." />
        </Panel>
      )}

      {loadState === 'error' && (
        <Panel>
          <StateMessage
            kind="error"
            title="Ringkasan gagal dimuat."
            description="Periksa koneksi lalu coba lagi."
            action={<Button size="sm" onClick={loadData}>Coba lagi</Button>}
          />
        </Panel>
      )}

      {loadState === 'ready' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Panel className="p-5 lg:col-span-2 space-y-3">
              <h2 className="text-sm font-semibold text-ink">Event berikutnya</h2>
              {nextEvent ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-base font-semibold text-ink break-words">{nextEvent.title}</p>
                    <p className="text-sm text-ink-2">{formatDate(nextEvent.event_date)}</p>
                    {nextEvent.location && <p className="text-xs text-ink-3">{nextEvent.location}</p>}
                  </div>
                  <p className="text-sm text-ink-2">
                    <span className="font-display text-4xl font-semibold leading-none tabular-nums text-brand">{nextEvent.registrations_count || 0}</span>{' '}
                    umat terdaftar{nextEvent.quota ? ` dari kuota ${nextEvent.quota}` : ''}
                  </p>
                  <Link href={`/events/${nextEvent.id}`} className={`${buttonClass('secondary')} w-full sm:w-auto`}>
                    Buka detail event
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-ink-3">Belum ada event terjadwal.</p>
              )}
            </Panel>

            <Panel className="p-5 space-y-2">
              <h2 className="text-sm font-semibold text-ink">Dana masuk bulan {monthName}</h2>
              <p className="text-2xl font-semibold tabular-nums text-ink">{formatRupiah(monthDonationTotal)}</p>
              <p className="text-xs text-ink-3">{monthDonations.length} catatan dana bulan ini</p>
              <Link href="/donations" className={panelLinkClass}>
                Lihat semua dana
              </Link>
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel className="p-5 space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">Stok menipis</h2>
                <Link href="/inventory" className="max-sm:hidden text-sm font-medium text-brand hover:underline">Buka inventaris</Link>
              </div>
              {lowStockItems.length > 0 ? (
                <>
                  <p className="text-sm text-gold">
                    {lowStockItems.length} barang tersisa {LOW_STOCK_LIMIT} atau kurang. Perlu ditambah sebelum event berikutnya.
                  </p>
                  <ul className="divide-y divide-line">
                    {lowStockItems.map(item => (
                      <li key={item.id} className="py-2 flex justify-between gap-3 text-sm">
                        <span className="text-ink break-words">{item.item_name}</span>
                        <span className="tabular-nums text-ink-2 shrink-0">{item.stock_quantity} {item.unit}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-ink-3">Semua stok di atas {LOW_STOCK_LIMIT}.</p>
              )}
              <Link href="/inventory" className="sm:hidden flex items-center justify-center w-full min-h-[44px] rounded-lg border border-line-strong text-sm font-medium text-brand">Buka inventaris</Link>
            </Panel>

            <Panel className="p-5 space-y-3">
              <h2 className="text-sm font-semibold text-ink">Ulang tahun bulan {monthName}</h2>
              {birthdays.length > 0 ? (
                <ul className="divide-y divide-line">
                  {birthdays.map(({ profile, parts }) => (
                    <li key={profile.id} className="py-2 flex justify-between gap-3 text-sm">
                      <span className="text-ink break-words">{profile.full_name}</span>
                      <span className="tabular-nums text-ink-2 shrink-0">
                        {parts.day} {monthName}
                        {parts.day === now.getDate() && <span className="ml-1.5 text-ok font-medium">hari ini</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-3">Tidak ada umat yang berulang tahun bulan ini.</p>
              )}
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel className="p-5 space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">Umat per HAN</h2>
                <span className="text-xs text-ink-3">{hanCounts.length} kelompok</span>
              </div>
              {hanCounts.length > 0 ? (
                <CountBars counts={hanCounts} total={profiles.length} />
              ) : (
                <p className="text-sm text-ink-3">Belum ada data umat.</p>
              )}
            </Panel>

            <Panel className="p-5 space-y-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">Umat per Cetya</h2>
                <span className="text-xs text-ink-3">{cetyaCounts.length} kelompok</span>
              </div>
              {cetyaCounts.length > 0 ? (
                <CountBars counts={cetyaCounts} total={profiles.length} />
              ) : (
                <p className="text-sm text-ink-3">Belum ada data umat.</p>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
