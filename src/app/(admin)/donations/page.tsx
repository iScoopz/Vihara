'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  PlusCircle, 
  Search, 
  TrendingUp, 
  Filter,
  Calendar,
  CreditCard,
  Receipt
} from 'lucide-react';
import { getDonations } from '@/lib/actions/vihara-actions';
import { Donation } from '@/types/database';

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('all');

  useEffect(() => {
    async function loadData() {
      const dons = await getDonations();
      setDonations(dons);
    }
    loadData();
  }, []);

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const filteredDonations = donations.filter(d => {
    const matchSearch = d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPurpose = selectedPurpose === 'all' || d.purpose === selectedPurpose;
    return matchSearch && matchPurpose;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white tracking-tight flex items-center gap-2">
            <HeartHandshake className="text-emerald-500" size={28} />
            <span>Pencatatan Dana Paramita (Donasi Vihara)</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Modul pencatatan kebajikan Dana Paramita dari Umat & Donatur Anonim</p>
        </div>

        <Link
          href="/donations/new"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm"
        >
          <PlusCircle size={18} />
          <span>Tambah Dana Paramita Baru</span>
        </Link>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-lg space-y-1">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Total Dana Paramita</p>
          <h3 className="text-3xl font-black font-mono text-white">
            Rp {totalAmount.toLocaleString('id-ID')}
          </h3>
          <p className="text-xs text-purple-200">Tercatat dalam Database Supabase</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jumlah Transaksi</p>
          <h3 className="text-3xl font-extrabold text-purple-950 dark:text-white">{donations.length} Transaksi</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Dukungan kebajikan berkelanjutan</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peruntukan Utama</p>
          <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-300">Operasional & Pembangunan</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Transparan & Terakuntabilitas</p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari Donatur atau Peruntukan Dana..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600 font-semibold"
          />
        </div>

        <select
          value={selectedPurpose}
          onChange={(e) => setSelectedPurpose(e.target.value)}
          className="w-full sm:w-auto bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
        >
          <option value="all">Semua Peruntukan Dana</option>
          <option value="Dana Operasional Vihara">Dana Operasional Vihara</option>
          <option value="Dana Pembangunan Cetya">Dana Pembangunan Cetya</option>
          <option value="Dana Pelita Asadha">Dana Pelita Asadha</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 dark:bg-indigo-950/60 border-b border-purple-100 dark:border-indigo-900 text-xs font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                <th className="py-4 px-6">Nama Donatur</th>
                <th className="py-4 px-6">Nominal Dana</th>
                <th className="py-4 px-6">Peruntukan</th>
                <th className="py-4 px-6">Metode</th>
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-indigo-900/60 text-sm">
              {filteredDonations.map((don) => (
                <tr key={don.id} className="hover:bg-purple-50/40 dark:hover:bg-indigo-900/40 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center text-xs font-extrabold border border-emerald-200 dark:border-emerald-800">
                      🪷
                    </div>
                    <span>{don.donor_name}</span>
                  </td>

                  <td className="py-4 px-6 font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-base">
                    Rp {Number(don.amount).toLocaleString('id-ID')}
                  </td>

                  <td className="py-4 px-6">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {don.purpose}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                    {don.payment_method || 'Transfer Bank'}
                  </td>

                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 text-xs">
                    {new Date(don.donation_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>

                  <td className="py-4 px-6 text-slate-500 text-xs">
                    {don.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
