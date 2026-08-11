'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarDays, 
  HeartHandshake, 
  Package, 
  Building
} from 'lucide-react';
import { getDashboardPageBundle } from '@/lib/actions/vihara-actions';
import { Profile, ViharaEvent, Donation, InventoryItem } from '@/types/database';

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const bundle = await getDashboardPageBundle();
      setProfiles(bundle.profiles);
      setEvents(bundle.events);
      setDonations(bundle.donations);
      setInventory(bundle.inventory);
    }
    loadData();
  }, []);

  const totalUmat = profiles.length;
  const activeEvents = events.filter(e => new Date(e.event_date) >= new Date()).length;
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const lowStockItems = inventory.filter(i => i.stock_quantity <= 10);

  const hanCounts: Record<string, number> = {};
  profiles.forEach(p => {
    const hanName = p.han || 'Tidak Terdaftar';
    hanCounts[hanName] = (hanCounts[hanName] || 0) + 1;
  });

  const cetyaCounts: Record<string, number> = {};
  profiles.forEach(p => {
    const cetyaName = p.cetya || 'Cetya Utama';
    cetyaCounts[cetyaName] = (cetyaCounts[cetyaName] || 0) + 1;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-purple-950 dark:text-white tracking-tight">
            Dashboard Utama Vihara MNSBDI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview aktivitas kebaktian, keanggotaan umat, dan administrasi vihara</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events/new"
            className="gradient-mnsbdi text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 hover:opacity-95 transition"
          >
            <span>+ Buat Event Baru</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Umat */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Umat</span>
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Users size={20} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{totalUmat}</p>
            <p className="text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1">Terdaftar di Database</p>
          </div>
        </div>

        {/* Card 2: Active Events */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Event Mendatang</span>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <CalendarDays size={20} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{activeEvents}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">Kegiatan Gongyo & Kensyu</p>
          </div>
        </div>

        {/* Card 3: Total Dana Paramita */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Dana Paramita</span>
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <HeartHandshake size={20} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">Rp {totalDonations.toLocaleString('id-ID')}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Tercatat di sistem</p>
          </div>
        </div>

        {/* Card 4: Inventory Alert */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Stok Inventaris</span>
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Package size={20} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{inventory.length} Item</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">{lowStockItems.length} item stok menipis</p>
          </div>
        </div>
      </div>

      {/* Grid distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Umat per HAN */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
            <Building className="text-purple-600 dark:text-purple-400" size={18} />
            <span>Distribusi Umat per Kelompok HAN</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(hanCounts).length > 0 ? (
              Object.entries(hanCounts).map(([hanName, count]) => (
                <div key={hanName} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{hanName}</span>
                    <span className="text-purple-700 dark:text-purple-300 font-black">{count} Umat</span>
                  </div>
                  <div className="w-full bg-purple-100 dark:bg-purple-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="gradient-mnsbdi h-full rounded-full"
                      style={{ width: `${Math.min(100, (count / (totalUmat || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada data distribusi HAN.</p>
            )}
          </div>
        </div>

        {/* Cetya Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
            <Building className="text-amber-500" size={18} />
            <span>Distribusi Umat per Cetya Naungan</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(cetyaCounts).length > 0 ? (
              Object.entries(cetyaCounts).map(([cetyaName, count]) => (
                <div key={cetyaName} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{cetyaName}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-black">{count} Umat</span>
                  </div>
                  <div className="w-full bg-amber-100 dark:bg-amber-950 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="gradient-gold h-full rounded-full"
                      style={{ width: `${Math.min(100, (count / (totalUmat || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada data distribusi Cetya.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
