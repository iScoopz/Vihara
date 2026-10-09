'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  User, 
  FileText,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { getDonations } from '@/lib/actions/vihara-actions';
import { Donation } from '@/types/database';

export default function DonationsListPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('all');

  useEffect(() => {
    async function loadData() {
      const data = await getDonations();
      setDonations(data);
    }
    loadData();
  }, []);

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const filteredDonations = donations.filter(d => {
    const purposeStr = (d.purpose || d.donation_type || '');
    const matchSearch = d.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        purposeStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPurpose = selectedPurpose === 'all' || purposeStr === selectedPurpose;
    return matchSearch && matchPurpose;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white tracking-tight flex items-center gap-2">
            <HeartHandshake className="text-emerald-500" size={28} />
            <span>Pencatatan Dana Paramita & Donasi</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Rekapitulasi dana paramita, operasional, & pembangunan vihara</p>
        </div>

        <Link
          href="/donations/new"
          className="inline-flex items-center gap-2 bg-purple-900 hover:bg-purple-800 text-amber-300 font-black px-4 py-2.5 rounded-xl transition shadow-sm border border-purple-700/60 text-xs active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Dana Paramita Baru</span>
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="p-6 rounded-2xl bg-slate-900 dark:bg-[#150d28] text-white shadow-md border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">Total Akumulasi Dana Paramita</span>
          <p className="text-3xl font-black text-amber-300">Rp {totalAmount.toLocaleString('id-ID')}</p>
        </div>
        <div className="text-xs text-purple-200 font-semibold">
          Tercatat {donations.length} transaksi dana paramita terverifikasi.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-3">
          <span className="text-xs font-extrabold text-purple-950 dark:text-white flex items-center gap-1.5">
            <Filter size={16} className="text-amber-500" />
            <span>Filter Transaksi Donasi</span>
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ditemukan: <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{filteredDonations.length}</strong> Transaksi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari Nama Donatur / Peruntukan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600"
            />
          </div>

          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
          >
            <option value="all">Semua Peruntukan</option>
            <option value="paramita">Dana Paramita Utama</option>
            <option value="operasional">Operasional Cetya & Vihara</option>
            <option value="pembangunan">Pembangunan / Renovasi</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 dark:bg-purple-950/60 border-b border-purple-100 dark:border-purple-900/60 text-xs font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                <th className="py-4 px-6">Donatur</th>
                <th className="py-4 px-6">Nominal (Rp)</th>
                <th className="py-4 px-6">Peruntukan Dana</th>
                <th className="py-4 px-6">Tanggal Transaksi</th>
                <th className="py-4 px-6">Catatan / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-purple-900/60 text-sm">
              {filteredDonations.map((d) => (
                <tr key={d.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/40 transition">
                  <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                    {d.donor_name}
                  </td>
                  <td className="py-4 px-6 font-mono font-black text-emerald-700 dark:text-emerald-400">
                    Rp {Number(d.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-2.5 py-1 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 font-extrabold text-xs uppercase">
                      {d.purpose || d.donation_type || 'Paramita'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                    {new Date(d.donation_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-xs">
                    {d.notes || '-'}
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
