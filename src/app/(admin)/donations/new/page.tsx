'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartHandshake, ArrowLeft, CheckCircle2, UserCheck, CreditCard, Sparkles, Receipt } from 'lucide-react';
import { getProfiles, addDonation } from '@/lib/actions/vihara-actions';
import { SearchableUmatSelect } from '@/components/ui/SearchableUmatSelect';
import { Profile } from '@/types/database';

export default function NewDonationPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUmatId, setSelectedUmatId] = useState('');
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('Dana Operasional Vihara');
  const [paymentMethod, setPaymentMethod] = useState<'Transfer Bank' | 'Tunai' | 'QRIS'>('Transfer Bank');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUmat() {
      const data = await getProfiles();
      setProfiles(data);
    }
    loadUmat();
  }, []);

  const handleSelectPresetAmount = (preset: number) => {
    setAmount(preset.toString());
  };

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

    setLoading(false);
    router.push('/donations');
  };

  const numAmount = parseFloat(amount) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/donations"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Log Dana Paramita</span>
        </Link>

        <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          Form Input Kebajikan
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-xl space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
              <HeartHandshake className="text-emerald-500" size={24} />
              <span>Tambah Pencatatan Dana Paramita Baru</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Catat sumbangan kebajikan dari Umat atau Donatur Anonim</p>
          </div>

          <form onSubmit={handleSubmitDonation} className="space-y-4 text-xs">
            {/* Umat Autocomplete Select */}
            <div>
              <SearchableUmatSelect
                label="Pilih Umat Terdaftar (Opsional)"
                profiles={profiles}
                value={selectedUmatId}
                onChange={(id, profile) => {
                  setSelectedUmatId(id);
                  if (profile) setDonorName(profile.full_name);
                }}
                placeholder="-- Donatur Anonim / Cari Umat --"
              />
            </div>

            {/* Nama Donatur */}
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Nama Donatur (Tampilan Kuitansi)
              </label>
              <input
                type="text"
                required
                placeholder="Suryani Dewi / Anonim"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
              />
            </div>

            {/* Nominal Dana & Quick Presets */}
            <div className="space-y-2">
              <label className="block font-extrabold text-slate-700 dark:text-slate-300">
                Nominal Dana Paramita (Rp)
              </label>
              <input
                type="number"
                required
                placeholder="500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3.5 py-2.5 text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-purple-600"
              />

              {/* Preset Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[11px] text-slate-400 font-semibold">Preset Instant:</span>
                {[50000, 100000, 500000, 1000000, 5000000].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPresetAmount(preset)}
                    className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-[11px] hover:bg-purple-100 transition"
                  >
                    +Rp {preset.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Peruntukan Dana
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="Dana Operasional Vihara">Dana Operasional Vihara</option>
                  <option value="Dana Pembangunan Cetya">Dana Pembangunan Cetya</option>
                  <option value="Dana Pelita Asadha">Dana Pelita Asadha</option>
                  <option value="Dana Sosmas & Sangha">Dana Sosmas & Sangha</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="Transfer Bank">Transfer Bank (BCA/Mandiri)</option>
                  <option value="Tunai">Tunai di Sekretariat</option>
                  <option value="QRIS">Scan QRIS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Catatan / Keterangan Tambahan
              </label>
              <input
                type="text"
                placeholder="Contoh: Atas nama keluarga Alm. Tan Sri"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>{loading ? 'Menyimpan Dana...' : 'Simpan Transaksi Dana Paramita'}</span>
            </button>
          </form>
        </div>

        {/* Live Invoice Preview */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-900 to-indigo-950 text-white space-y-4 border border-purple-700/50 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-purple-700/50 pb-3">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                <Receipt size={14} /> KUITANSI DIGITAL
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded">
                PREVIEW
              </span>
            </div>

            <div className="pt-4 space-y-3 text-xs">
              <div>
                <span className="text-purple-300 block font-semibold">Telah Diterima Dari:</span>
                <p className="text-base font-extrabold text-white">{donorName || 'Hamba Buddha (Anonim)'}</p>
              </div>

              <div>
                <span className="text-purple-300 block font-semibold">Jumlah Dana:</span>
                <p className="text-2xl font-black font-mono text-amber-300">
                  Rp {numAmount.toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <span className="text-purple-300 block font-semibold">Peruntukan:</span>
                <p className="font-bold text-purple-100">{purpose}</p>
              </div>

              <div>
                <span className="text-purple-300 block font-semibold">Metode & Waktu:</span>
                <p className="font-semibold">{paymentMethod} • {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-700/50 pt-3 text-[11px] text-purple-300 text-center">
            Sabbe Satta Bhavantu Sukhitatta ✨<br />
            Semua Makhluk Hidup Berbahagia
          </div>
        </div>
      </div>
    </div>
  );
}
