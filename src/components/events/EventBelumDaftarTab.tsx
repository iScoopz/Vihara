'use client'

import { useMemo, useState } from 'react';
import { Search, Copy, Check, UserPlus } from 'lucide-react';
import { ViharaEvent, EventRegistration, Profile } from '@/types/database';
import { BAGIAN_OPTIONS, UNAFFILIATED_CETYA_OPTIONS } from '@/lib/umat-options';
import { Button, Panel, StateMessage, inputClass, selectClass } from '@/components/ui/kit';

interface EventBelumDaftarTabProps {
  event: ViharaEvent;
  profiles: Profile[];
  registrations: EventRegistration[];
  onRegister: (profile: Profile) => Promise<boolean>;
}

const distinct = (values: (string | undefined)[]) =>
  [...new Set(values.filter((v): v is string => Boolean(v)))].sort((a, b) => a.localeCompare(b, 'id'));

export function EventBelumDaftarTab({ event, profiles, registrations, onRegister }: EventBelumDaftarTabProps) {
  const [search, setSearch] = useState('');
  const [sentraFilter, setSentraFilter] = useState('all');
  const [cetyaFilter, setCetyaFilter] = useState('all');
  const [hanFilter, setHanFilter] = useState('all');
  const [bagianFilter, setBagianFilter] = useState('all');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const registeredIds = useMemo(() => new Set(registrations.map(r => r.profile_id)), [registrations]);

  const eligible = useMemo(
    () => profiles.filter(p => includeInactive || p.is_active !== false),
    [profiles, includeInactive]
  );
  const unregistered = useMemo(() => eligible.filter(p => !registeredIds.has(p.id)), [eligible, registeredIds]);

  // Filter choices come from the umat data: members of one HAN can belong to different Cetya.
  const sentraOptions = useMemo(() => distinct(profiles.map(p => p.sentra)), [profiles]);
  const cetyaOptions = useMemo(
    () =>
      distinct(
        profiles
          .filter(p => sentraFilter === 'all' || p.sentra === sentraFilter)
          .map(p => p.cetya)
          .filter(c => !c || !UNAFFILIATED_CETYA_OPTIONS.includes(c))
      ),
    [profiles, sentraFilter]
  );
  const hanOptions = useMemo(
    () => distinct(profiles.filter(p => cetyaFilter === 'all' || p.cetya === cetyaFilter).map(p => p.han)),
    [profiles, cetyaFilter]
  );

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
    setPendingIds(prev => new Set(prev).add(profile.id));
    await onRegister(profile);
    setPendingIds(prev => {
      const next = new Set(prev);
      next.delete(profile.id);
      return next;
    });
  };

  const handleCopy = () => {
    if (rows.length === 0 || !navigator.clipboard) return;
    const date = new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const lines = rows.map((p, i) => `${i + 1}. ${p.full_name}${p.han ? ` (${p.han})` : ''}`);
    navigator.clipboard.writeText(`Belum daftar: ${event.title}, ${date}\n\n${lines.join('\n')}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="text-sm text-ink-2">
          <span className="font-display text-4xl font-semibold leading-none tabular-nums text-brand">{unregistered.length}</span>{' '}
          dari {eligible.length} umat{includeInactive ? '' : ' aktif'} belum mendaftar
        </p>
        <p className="text-xs text-ink-3">{eligible.length - unregistered.length} sudah terdaftar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Cari nama</span>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama umat" className={`${inputClass} pl-9`} />
        </label>

        <select
          aria-label="Filter Sentra"
          value={sentraFilter}
          onChange={e => {
            setSentraFilter(e.target.value);
            setCetyaFilter('all');
            setHanFilter('all');
          }}
          className={selectClass}
        >
          <option value="all">Semua Sentra</option>
          {sentraOptions.map(s => <option key={s} value={s}>{s}</option>)}
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
          {cetyaOptions.map(c => <option key={c} value={c}>{c}</option>)}
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-ink-2 cursor-pointer min-h-[44px] sm:min-h-0">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={e => setIncludeInactive(e.target.checked)}
            className="w-4 h-4 accent-[var(--brand)]"
          />
          Sertakan umat non-aktif
        </label>
        <div className="flex items-center gap-2">
          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset filter
            </Button>
          )}
          <Button size="sm" onClick={handleCopy} disabled={rows.length === 0}>
            {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
            {copied ? 'Tersalin' : `Salin ${rows.length} nama`}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Panel>
          <StateMessage
            kind="empty"
            title={unregistered.length === 0 ? 'Semua umat sudah terdaftar di event ini.' : 'Tidak ada umat yang cocok dengan filter ini.'}
            action={
              hasFilter && unregistered.length > 0 ? (
                <Button size="sm" onClick={resetFilters}>Reset filter</Button>
              ) : undefined
            }
          />
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <table className="hidden md:table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-xs text-ink-3">
                <th scope="col" className="py-2.5 px-4 font-medium w-12">No</th>
                <th scope="col" className="py-2.5 px-4 font-medium">Nama</th>
                <th scope="col" className="py-2.5 px-4 font-medium">HAN</th>
                <th scope="col" className="py-2.5 px-4 font-medium">Cetya</th>
                <th scope="col" className="py-2.5 px-4 font-medium">Sentra</th>
                <th scope="col" className="py-2.5 px-4 font-medium">Bagian</th>
                <th scope="col" className="py-2.5 px-4"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((p, i) => (
                <tr key={p.id} className="hover:bg-surface-2">
                  <td className="py-2.5 px-4 tabular-nums text-ink-3">{i + 1}</td>
                  <td className="py-2.5 px-4 font-medium text-ink">
                    {p.full_name}
                    {p.is_active === false && <span className="ml-2 text-xs font-normal text-ink-3">non-aktif</span>}
                  </td>
                  <td className="py-2.5 px-4 text-ink-2">{p.han || '-'}</td>
                  <td className="py-2.5 px-4 text-ink-2">{p.cetya || '-'}</td>
                  <td className="py-2.5 px-4 text-ink-2">{p.sentra || '-'}</td>
                  <td className="py-2.5 px-4 text-ink-2">{p.bagian || '-'}</td>
                  <td className="py-2 px-4 text-right">
                    <Button variant="primary" size="sm" onClick={() => handleRegister(p)} disabled={pendingIds.has(p.id)}>
                      <UserPlus size={14} aria-hidden />
                      {pendingIds.has(p.id) ? 'Mendaftarkan...' : 'Daftarkan'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="md:hidden divide-y divide-line">
            {rows.map((p, i) => (
              <li key={p.id} className="p-3.5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink break-words">
                    <span className="tabular-nums text-ink-3 font-normal mr-1.5">{i + 1}.</span>
                    {p.full_name}
                  </p>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs text-ink-2">
                    <dt className="text-ink-3">HAN</dt><dd className="break-words">{p.han || '-'}</dd>
                    <dt className="text-ink-3">Cetya</dt><dd className="break-words">{p.cetya || '-'}</dd>
                    <dt className="text-ink-3">Sentra</dt><dd className="break-words">{p.sentra || '-'}</dd>
                    <dt className="text-ink-3">Bagian</dt><dd>{p.bagian || '-'}</dd>
                  </dl>
                </div>
                <button
                  type="button"
                  onClick={() => handleRegister(p)}
                  disabled={pendingIds.has(p.id)}
                  aria-label={`Daftarkan ${p.full_name}`}
                  className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand text-on-brand disabled:opacity-50 cursor-pointer"
                >
                  <UserPlus size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
