'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, Copy, Check, UserPlus, RotateCcw } from 'lucide-react';
import {
  getBelumDaftarPageBundle,
  getRegisteredProfileIds,
  registerForEvent
} from '@/lib/actions/vihara-actions';
import { Profile, CetyaProfile, HanProfile, EventOption } from '@/types/database';
import { BAGIAN_OPTIONS, UNAFFILIATED_CETYA_OPTIONS } from '@/lib/umat-options';
import { useToast } from '@/components/ui/ToastNotification';

const selectClass =
  'w-full min-h-[44px] sm:min-h-0 bg-white dark:bg-[#1c1c1e] border border-black/[0.1] dark:border-white/[0.12] rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100';

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Nearest upcoming event that is not finished; otherwise the most recent one.
function pickDefaultEvent(events: EventOption[]) {
  const now = Date.now();
  const upcoming = events
    .filter(e => !e.is_completed && new Date(e.event_date).getTime() >= now - 24 * 60 * 60 * 1000)
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
  return upcoming[0]?.id || events[0]?.id || '';
}

export default function BelumDaftarPage() {
  const { showToast } = useToast();

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sentras, setSentras] = useState<string[]>([]);
  const [cetyas, setCetyas] = useState<CetyaProfile[]>([]);
  const [hans, setHans] = useState<HanProfile[]>([]);

  const [eventId, setEventId] = useState('');
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [regsState, setRegsState] = useState<'idle' | 'loading' | 'error'>('idle');
  const latestEventRef = useRef('');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [sentraFilter, setSentraFilter] = useState('all');
  const [cetyaFilter, setCetyaFilter] = useState('all');
  const [hanFilter, setHanFilter] = useState('all');
  const [bagianFilter, setBagianFilter] = useState('all');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [copied, setCopied] = useState(false);

  // Responses for an event the admin already switched away from are ignored.
  const selectEvent = async (id: string) => {
    setEventId(id);
    latestEventRef.current = id;
    if (!id) return;
    setRegsState('loading');
    try {
      const ids = await getRegisteredProfileIds(id);
      if (latestEventRef.current !== id) return;
      setRegisteredIds(new Set(ids));
      setRegsState('idle');
    } catch {
      if (latestEventRef.current === id) setRegsState('error');
    }
  };

  const loadBundle = async () => {
    try {
      const bundle = await getBelumDaftarPageBundle();
      setEvents(bundle.events);
      setProfiles(bundle.profiles);
      setSentras(bundle.sentras);
      setCetyas(bundle.cetyas);
      setHans(bundle.hans);

      const fromUrl = new URLSearchParams(window.location.search).get('event');
      const initial = fromUrl && bundle.events.some(e => e.id === fromUrl) ? fromUrl : pickDefaultEvent(bundle.events);
      setLoadState('ready');
      selectEvent(initial);
    } catch (e) {
      console.error(e);
      setLoadState('error');
    }
  };

  useEffect(() => {
    loadBundle();
  }, []);

  const selectedEvent = events.find(e => e.id === eventId);

  // HAN choices come from the umat data itself: in practice a HAN can have members
  // from several Cetya, so the master HAN -> Cetya link is not reliable for filtering.
  const hanOptions = useMemo(() => {
    const names = new Set<string>();
    if (cetyaFilter === 'all') hans.forEach(h => names.add(h.name));
    profiles.forEach(p => {
      if (p.han && (cetyaFilter === 'all' || p.cetya === cetyaFilter)) names.add(p.han);
    });
    return [...names].sort((a, b) => a.localeCompare(b, 'id'));
  }, [hans, profiles, cetyaFilter]);

  const eligible = useMemo(
    () => profiles.filter(p => includeInactive || p.is_active !== false),
    [profiles, includeInactive]
  );

  const unregistered = useMemo(() => eligible.filter(p => !registeredIds.has(p.id)), [eligible, registeredIds]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return unregistered
      .filter(p => {
        if (q && !p.full_name.toLowerCase().includes(q)) return false;
        if (sentraFilter !== 'all' && (p.sentra || '') !== sentraFilter) return false;
        if (cetyaFilter !== 'all' && (p.cetya || '') !== cetyaFilter) return false;
        if (hanFilter !== 'all' && (p.han || '') !== hanFilter) return false;
        if (bagianFilter !== 'all' && (p.bagian || '') !== bagianFilter) return false;
        return true;
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name, 'id'));
  }, [unregistered, search, sentraFilter, cetyaFilter, hanFilter, bagianFilter]);

  const hasFilter =
    search.trim() !== '' || sentraFilter !== 'all' || cetyaFilter !== 'all' || hanFilter !== 'all' || bagianFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setSentraFilter('all');
    setCetyaFilter('all');
    setHanFilter('all');
    setBagianFilter('all');
  };

  const handleRegister = async (profile: Profile) => {
    if (!eventId) return;
    setPendingIds(prev => new Set(prev).add(profile.id));

    let adminId: string | undefined;
    try {
      adminId = JSON.parse(localStorage.getItem('vihara_admin_profile') || '{}').id;
    } catch {}

    const res = await registerForEvent(eventId, profile.id, adminId);
    setPendingIds(prev => {
      const next = new Set(prev);
      next.delete(profile.id);
      return next;
    });

    if (res.error) {
      showToast(res.error, 'error', 'Gagal mendaftarkan');
      if (res.error.includes('sudah terdaftar')) {
        setRegisteredIds(prev => new Set(prev).add(profile.id));
      }
      return;
    }
    setRegisteredIds(prev => new Set(prev).add(profile.id));
    showToast(`${profile.full_name} didaftarkan ke ${selectedEvent?.title || 'event'}.`, 'success', 'Terdaftar');
  };

  const handleCopy = () => {
    if (!selectedEvent || rows.length === 0 || !navigator.clipboard) return;
    const lines = rows.map((p, i) => `${i + 1}. ${p.full_name}${p.han ? ` (${p.han})` : ''}`);
    const text = `Belum daftar: ${selectedEvent.title}, ${formatEventDate(selectedEvent.event_date)}\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loadState === 'loading') {
    return <p className="p-8 text-center text-xs text-neutral-600 dark:text-neutral-400">Memuat data umat dan event...</p>;
  }

  if (loadState === 'error') {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-3">
        <p className="text-sm text-neutral-800 dark:text-neutral-200">Data tidak bisa dimuat. Periksa koneksi lalu coba lagi.</p>
        <button
          onClick={() => {
            setLoadState('loading');
            loadBundle();
          }}
          className="px-4 py-2.5 rounded-lg bg-[#1d1d1f] text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
        >
          Muat ulang
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-3">
        <p className="text-sm text-neutral-800 dark:text-neutral-200">Belum ada event. Buat event dulu, lalu kembali ke sini untuk melihat siapa yang belum mendaftar.</p>
        <Link href="/events/new" className="inline-block px-4 py-2.5 rounded-lg bg-[#1d1d1f] text-white dark:bg-white dark:text-black text-xs font-semibold">
          Buat event
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">Umat belum daftar</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Pilih event, lalu saring per Sentra, Cetya, HAN, atau Bagian untuk tindak lanjut.
          </p>
        </div>

        <label className="block lg:w-96">
          <span className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">Event</span>
          <select value={eventId} onChange={e => selectEvent(e.target.value)} className={`${selectClass} font-semibold`}>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {formatEventDate(ev.event_date)} · {ev.title}
                {ev.is_completed ? ' (selesai)' : !ev.is_published ? ' (draf)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* The one number this page exists for */}
      {selectedEvent && (
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-y border-black/[0.08] dark:border-white/[0.1] py-3">
          <p className="text-sm text-neutral-800 dark:text-neutral-200">
            <span className="text-2xl font-bold tabular-nums text-[#5e35b1] dark:text-amber-400 mr-1.5">
              {regsState === 'loading' ? '…' : unregistered.length}
            </span>{' '}
            dari {eligible.length} umat{includeInactive ? '' : ' aktif'} belum mendaftar
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {eligible.length - unregistered.length} sudah terdaftar ·{' '}
            <Link href={`/events/${selectedEvent.id}`} className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-white">
              buka detail event
            </Link>
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Cari nama</span>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama umat"
            className={`${selectClass} pl-8`}
          />
        </label>

        <select aria-label="Filter Sentra" value={sentraFilter} onChange={e => setSentraFilter(e.target.value)} className={selectClass}>
          <option value="all">Semua Sentra</option>
          {sentras.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          aria-label="Filter Cetya"
          value={cetyaFilter}
          onChange={e => {
            setCetyaFilter(e.target.value);
            setHanFilter('all');
          }}
          className={selectClass}
        >
          <option value="all">Semua Cetya</option>
          {cetyas
            .filter(c => sentraFilter === 'all' || c.sentra === sentraFilter)
            .map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          {UNAFFILIATED_CETYA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>

        <select aria-label="Filter HAN" value={hanFilter} onChange={e => setHanFilter(e.target.value)} className={selectClass}>
          <option value="all">Semua HAN</option>
          {hanOptions.map(h => <option key={h} value={h}>{h}</option>)}
          <option value="">Tanpa HAN</option>
        </select>

        <select aria-label="Filter Bagian" value={bagianFilter} onChange={e => setBagianFilter(e.target.value)} className={selectClass}>
          <option value="all">Semua Bagian</option>
          {BAGIAN_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
          <option value="">Tanpa Bagian</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer min-h-[44px] sm:min-h-0">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={e => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 accent-[#5e35b1]"
          />
          Sertakan umat non-aktif
        </label>

        <div className="flex items-center gap-2">
          {hasFilter && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] sm:min-h-0 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] cursor-pointer"
            >
              <RotateCcw size={13} aria-hidden />
              Reset filter
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] sm:min-h-0 rounded-lg border border-black/[0.1] dark:border-white/[0.14] text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] disabled:opacity-40 cursor-pointer"
          >
            {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
            {copied ? 'Tersalin' : `Salin ${rows.length} nama`}
          </button>
        </div>
      </div>

      {regsState === 'error' ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-sm text-neutral-800 dark:text-neutral-200">Data pendaftaran event ini gagal dimuat.</p>
          <button
            onClick={() => selectEvent(eventId)}
            className="px-4 py-2.5 rounded-lg bg-[#1d1d1f] text-white dark:bg-white dark:text-black text-xs font-semibold cursor-pointer"
          >
            Coba lagi
          </button>
        </div>
      ) : regsState === 'loading' ? (
        <p className="py-12 text-center text-xs text-neutral-600 dark:text-neutral-400">Mencocokkan data pendaftaran...</p>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {unregistered.length === 0 ? 'Semua umat sudah terdaftar di event ini.' : 'Tidak ada umat yang cocok dengan filter ini.'}
          </p>
          {hasFilter && unregistered.length > 0 && (
            <button onClick={resetFilters} className="text-xs underline underline-offset-2 text-neutral-700 dark:text-neutral-300 cursor-pointer">
              Reset filter
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-white dark:bg-[#161618] border border-black/[0.08] dark:border-white/[0.1] overflow-hidden">
          {/* Desktop table */}
          <table className="hidden md:table w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.08] dark:border-white/[0.1] text-neutral-600 dark:text-neutral-400">
                <th scope="col" className="py-2.5 px-4 font-semibold w-10">No</th>
                <th scope="col" className="py-2.5 px-4 font-semibold">Nama</th>
                <th scope="col" className="py-2.5 px-4 font-semibold">HAN</th>
                <th scope="col" className="py-2.5 px-4 font-semibold">Cetya</th>
                <th scope="col" className="py-2.5 px-4 font-semibold">Sentra</th>
                <th scope="col" className="py-2.5 px-4 font-semibold">Bagian</th>
                <th scope="col" className="py-2.5 px-4 font-semibold text-right">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
              {rows.map((p, i) => (
                <tr key={p.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03]">
                  <td className="py-2.5 px-4 tabular-nums text-neutral-500 dark:text-neutral-400">{i + 1}</td>
                  <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-white">
                    {p.full_name}
                    {p.is_active === false && <span className="ml-2 font-normal text-neutral-500 dark:text-neutral-400">(non-aktif)</span>}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-800 dark:text-neutral-200">{p.han || '-'}</td>
                  <td className="py-2.5 px-4 text-neutral-800 dark:text-neutral-200">{p.cetya || '-'}</td>
                  <td className="py-2.5 px-4 text-neutral-800 dark:text-neutral-200">{p.sentra || '-'}</td>
                  <td className="py-2.5 px-4 text-neutral-800 dark:text-neutral-200">{p.bagian || '-'}</td>
                  <td className="py-2 px-4 text-right">
                    <button
                      onClick={() => handleRegister(p)}
                      disabled={pendingIds.has(p.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5e35b1] hover:bg-[#4c2a91] text-white text-[11px] font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      <UserPlus size={13} aria-hidden />
                      {pendingIds.has(p.id) ? 'Mendaftarkan...' : 'Daftarkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile list */}
          <ul className="md:hidden divide-y divide-black/[0.06] dark:divide-white/[0.08]">
            {rows.map((p, i) => (
              <li key={p.id} className="p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white break-words">
                    <span className="tabular-nums text-neutral-500 dark:text-neutral-400 font-normal mr-1.5">{i + 1}.</span>
                    {p.full_name}
                  </p>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                    <dt className="text-neutral-500 dark:text-neutral-400">HAN</dt><dd className="break-words">{p.han || '-'}</dd>
                    <dt className="text-neutral-500 dark:text-neutral-400">Cetya</dt><dd className="break-words">{p.cetya || '-'}</dd>
                    <dt className="text-neutral-500 dark:text-neutral-400">Sentra</dt><dd className="break-words">{p.sentra || '-'}</dd>
                    <dt className="text-neutral-500 dark:text-neutral-400">Bagian</dt><dd>{p.bagian || '-'}</dd>
                  </dl>
                </div>
                <button
                  onClick={() => handleRegister(p)}
                  disabled={pendingIds.has(p.id)}
                  aria-label={`Daftarkan ${p.full_name}`}
                  className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#5e35b1] text-white disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
