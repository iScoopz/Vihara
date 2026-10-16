'use client'

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { getDonations } from '@/lib/actions/vihara-actions';
import { Donation } from '@/types/database';
import { Button, Fab, PageHeader, Panel, StateMessage, buttonClass, inputClass, selectClass } from '@/components/ui/kit';

const TYPE_LABELS: Record<string, string> = {
  paramita: 'Paramita',
  operasional: 'Operasional',
  pembangunan: 'Pembangunan',
  lainnya: 'Lainnya'
};

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
const thClass = 'sticky top-0 z-10 bg-surface-2 border-y border-line py-2.5 px-4 font-medium';
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default function DonationsListPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('all');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoadState('loading');
    try {
      const data = await getDonations();
      setDonations(data);
      setLoadState('ready');
    } catch (e) {
      console.error('Donations load error:', e);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const now = new Date();
  const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const monthTotal = donations
    .filter(d => {
      const dt = new Date(d.donation_date);
      return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
    })
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const filteredDonations = donations.filter(d => {
    const purposeStr = (d.purpose || d.donation_type || '');
    const matchSearch = d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        purposeStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPurpose = selectedPurpose === 'all' || purposeStr === selectedPurpose;
    return matchSearch && matchPurpose;
  });

  const purposeLabel = (d: Donation) => {
    const raw = d.purpose || d.donation_type;
    if (!raw) return null;
    return TYPE_LABELS[raw] || raw;
  };

  // Filter choices come from the records themselves, so every saved purpose can be selected.
  const purposeOptions = [...new Set(donations.map(d => d.purpose || d.donation_type).filter((v): v is string => Boolean(v)))]
    .sort((a, b) => (TYPE_LABELS[a] || a).localeCompare(TYPE_LABELS[b] || b, 'id'));

  const hasFilter = searchTerm.trim() !== '' || selectedPurpose !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dana Paramita"
        description="Catatan dana paramita, operasional, dan pembangunan vihara."
        actions={
          <Link href="/donations/new" className={`${buttonClass('primary')} max-md:hidden`}>
            <Plus size={14} aria-hidden />
            Catat dana
          </Link>
        }
      />

      <Fab label="Catat dana" icon={<Plus size={18} />} onClick={() => router.push('/donations/new')} />

      {loadState === 'loading' && (
        <Panel><StateMessage kind="loading" title="Memuat catatan dana..." /></Panel>
      )}

      {loadState === 'error' && (
        <Panel>
          <StateMessage
            kind="error"
            title="Catatan dana gagal dimuat."
            description="Periksa koneksi lalu coba lagi."
            action={<Button size="sm" onClick={loadData}>Coba lagi</Button>}
          />
        </Panel>
      )}

      {loadState === 'ready' && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <p className="text-sm text-ink-2">
              <span className="font-display text-4xl font-semibold leading-none tabular-nums text-brand">{formatRupiah(monthTotal)}</span>{' '}
              masuk bulan {monthName}
            </p>
            <p className="text-xs text-ink-3">
              Total seluruhnya <span className="tabular-nums text-ink-2">{formatRupiah(totalAmount)}</span> dari {donations.length} catatan
            </p>
          </div>

          <div className="grid grid-cols-[1fr_auto] md:grid-cols-2 gap-2">
            <label className="relative">
              <span className="sr-only">Cari donatur atau peruntukan</span>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                type="search"
                placeholder="Cari donatur atau peruntukan"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${inputClass} pl-9`}
              />
            </label>

            <Button
              className="md:hidden"
              aria-expanded={filtersOpen}
              aria-controls="donation-filters"
              onClick={() => setFiltersOpen(o => !o)}
            >
              <SlidersHorizontal size={14} aria-hidden />
              {selectedPurpose !== 'all' ? 'Filter (1)' : 'Filter'}
            </Button>

            <select
              id="donation-filters"
              aria-label="Filter peruntukan"
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className={`${selectClass} col-span-2 md:col-span-1 ${filtersOpen ? '' : 'hidden md:block'}`}
            >
              <option value="all">Semua peruntukan</option>
              {purposeOptions.map(value => (
                <option key={value} value={value}>{TYPE_LABELS[value] || value}</option>
              ))}
            </select>
          </div>

          {filteredDonations.length === 0 ? (
            <Panel>
              <StateMessage
                kind="empty"
                title={donations.length === 0 ? 'Belum ada dana yang dicatat.' : 'Tidak ada catatan yang cocok dengan filter ini.'}
                action={
                  hasFilter && donations.length > 0 ? (
                    <Button size="sm" onClick={() => { setSearchTerm(''); setSelectedPurpose('all'); }}>Reset filter</Button>
                  ) : undefined
                }
              />
            </Panel>
          ) : (
            <Panel className="overflow-hidden md:overflow-visible">
              <p className="px-4 pt-3 pb-2 md:pb-3 text-xs text-ink-3">{filteredDonations.length} catatan</p>
              <table className="hidden md:table w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-ink-3">
                    <th scope="col" className={thClass}>Donatur</th>
                    <th scope="col" className={`${thClass} text-right`}>Nominal</th>
                    <th scope="col" className={thClass}>Peruntukan</th>
                    <th scope="col" className={thClass}>Tanggal</th>
                    <th scope="col" className={thClass}>Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-2">
                      <td className="py-2.5 px-4 font-medium text-ink">{d.donor_name}</td>
                      <td className="py-2.5 px-4 tabular-nums text-ink text-right whitespace-nowrap">{formatRupiah(Number(d.amount))}</td>
                      <td className="py-2.5 px-4 text-ink-2">{purposeLabel(d) || <span className="text-ink-3">-</span>}</td>
                      <td className="py-2.5 px-4 text-ink-2 whitespace-nowrap">{formatDate(d.donation_date)}</td>
                      <td className="py-2.5 px-4 text-ink-2">{d.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ul className="md:hidden divide-y divide-line">
                {filteredDonations.map((d) => (
                  <li key={d.id} className="p-3.5 space-y-1">
                    <div className="flex justify-between gap-3">
                      <p className="text-sm font-medium text-ink break-words">{d.donor_name}</p>
                      <p className="text-sm tabular-nums text-ink shrink-0">{formatRupiah(Number(d.amount))}</p>
                    </div>
                    <p className="text-xs text-ink-2">
                      {formatDate(d.donation_date)}
                      {purposeLabel(d) ? `, ${purposeLabel(d)}` : ''}
                    </p>
                    {d.notes && <p className="text-xs text-ink-3 break-words">{d.notes}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
