'use client'

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProfiles, addDonation } from '@/lib/actions/vihara-actions';
import { SearchableUmatSelect } from '@/components/ui/SearchableUmatSelect';
import { Profile } from '@/types/database';
import { useToast } from '@/components/ui/ToastNotification';
import { Button, Field, PageHeader, Panel, inputClass, selectClass } from '@/components/ui/kit';

export default function NewDonationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesError, setProfilesError] = useState(false);
  const [selectedUmatId, setSelectedUmatId] = useState('');
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Dana Operasional Vihara');
  const [paymentMethod, setPaymentMethod] = useState<'Transfer Bank' | 'Tunai' | 'QRIS'>('Transfer Bank');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUmat = useCallback(async () => {
    setProfilesError(false);
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch (e) {
      console.error('Load umat error:', e);
      setProfilesError(true);
    }
  }, []);

  useEffect(() => {
    loadUmat();
  }, [loadUmat]);

  const handleSelectPresetAmount = (preset: number) => {
    setAmount(preset.toString());
  };

  const numAmount = parseFloat(amount) || 0;

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalDonorName = donorName || (profiles.find(p => p.id === selectedUmatId)?.full_name) || 'Hamba Buddha (Anonim)';

    await addDonation({
      profile_id: selectedUmatId || undefined,
      donor_name: finalDonorName,
      amount: parseFloat(amount) || 0,
      donation_date: new Date().toISOString().split('T')[0],
      purpose: purpose,
      payment_method: paymentMethod,
      notes: notes
    });

    showToast(`Dana Rp ${numAmount.toLocaleString('id-ID')} dari ${finalDonorName} tercatat.`, 'success', 'Dana tersimpan');
    setLoading(false);
    router.push('/donations');
  };

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/donations" className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0 text-sm font-medium text-brand hover:underline">
        <ArrowLeft size={14} aria-hidden />
        Kembali ke daftar dana
      </Link>

      <PageHeader title="Catat dana" description="Dana dari umat terdaftar atau donatur lain." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 p-5">
          <form onSubmit={handleSubmitDonation} className="space-y-4">
            <div>
              <SearchableUmatSelect
                label="Umat terdaftar (opsional)"
                profiles={profiles}
                value={selectedUmatId}
                onChange={(id, profile) => {
                  setSelectedUmatId(id);
                  if (profile) setDonorName(profile.full_name);
                }}
                placeholder="Cari nama umat"
              />
              {profilesError && (
                <p role="alert" className="mt-1 text-xs text-danger">
                  Daftar umat gagal dimuat. Nama donatur tetap bisa diisi manual.{' '}
                  <button type="button" onClick={loadUmat} className="underline font-medium cursor-pointer">Coba lagi</button>
                </p>
              )}
            </div>

            <Field label="Nama donatur di kuitansi">
              <input
                type="text"
                required
                placeholder="Nama lengkap atau Anonim"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="space-y-2">
              <Field label="Nominal (Rp)">
                <input
                  type="number"
                  required
                  min={0}
                  inputMode="numeric"
                  placeholder="500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </Field>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-ink-3">Isi cepat:</span>
                {[50000, 100000, 500000, 1000000, 5000000].map(preset => (
                  <Button key={preset} size="sm" onClick={() => handleSelectPresetAmount(preset)} className="tabular-nums">
                    Rp {preset.toLocaleString('id-ID')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Peruntukan">
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={selectClass}>
                  <option value="Dana Operasional Vihara">Dana Operasional Vihara</option>
                  <option value="Dana Pembangunan Cetya">Dana Pembangunan Cetya</option>
                  <option value="Dana Pelita Asadha">Dana Pelita Asadha</option>
                  <option value="Dana Sosmas & Sangha">Dana Sosmas & Sangha</option>
                </select>
              </Field>

              <Field label="Cara bayar">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'Transfer Bank' | 'Tunai' | 'QRIS')}
                  className={selectClass}
                >
                  <option value="Transfer Bank">Transfer bank</option>
                  <option value="Tunai">Tunai di sekretariat</option>
                  <option value="QRIS">QRIS</option>
                </select>
              </Field>
            </div>

            <Field label="Catatan (opsional)">
              <input
                type="text"
                placeholder="Contoh: atas nama keluarga Alm. Tan Sri"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Menyimpan...' : 'Simpan dana'}
              </Button>
            </div>
          </form>
        </Panel>

        <Panel className="p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-ink">Pratinjau kuitansi</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs text-ink-3">Diterima dari</dt>
              <dd className={donorName ? 'font-medium text-ink break-words' : 'text-ink-3'}>{donorName || 'Belum diisi'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Jumlah</dt>
              <dd className="text-2xl font-semibold tabular-nums text-ink">Rp {numAmount.toLocaleString('id-ID')}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Peruntukan</dt>
              <dd className="text-ink-2">{purpose}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-3">Cara bayar dan tanggal</dt>
              <dd className="text-ink-2">{paymentMethod}, {today}</dd>
            </div>
          </dl>
          <p className="border-t border-line pt-3 text-xs text-ink-3 text-center">
            Sabbe Satta Bhavantu Sukhitatta. Semoga semua makhluk hidup berbahagia.
          </p>
        </Panel>
      </div>
    </div>
  );
}
