'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarDays, 
  HeartHandshake, 
  Package, 
  Building,
  Plus
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
      {/* Apple-style Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
            Pusat Kendali Pengurus
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Dashboard Utama Vihara
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6]">
            Ringkasan data keanggotaan umat, jadwal kegiatan, dana kebajikan, dan inventaris.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/events/new"
            className="bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold px-5 py-2.5 rounded-full text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus size={14} />
            <span>Buat Event Baru</span>
          </Link>
        </div>
      </div>

      {/* 4 Apple-style Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Umat */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4 hover:border-black/15 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Total Umat</span>
            <div className="p-2 rounded-2xl bg-purple-500/[0.08] dark:bg-purple-400/[0.12] text-[#5e35b1] dark:text-purple-300">
              <Users size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">{totalUmat}</p>
            <p className="text-xs text-[#86868b] font-medium mt-1">Umat Terdaftar Aktif</p>
          </div>
        </div>

        {/* Card 2: Active Events */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4 hover:border-black/15 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Event Mendatang</span>
            <div className="p-2 rounded-2xl bg-amber-500/[0.1] dark:bg-amber-400/[0.12] text-amber-700 dark:text-amber-400">
              <CalendarDays size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">{activeEvents}</p>
            <p className="text-xs text-[#86868b] font-medium mt-1">Kegiatan Terjadwal</p>
          </div>
        </div>

        {/* Card 3: Total Dana Paramita */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4 hover:border-black/15 dark:hover:border-white/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Dana Paramita</span>
            <div className="p-2 rounded-2xl bg-emerald-500/[0.1] dark:bg-emerald-400/[0.12] text-emerald-700 dark:text-emerald-400">
              <HeartHandshake size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Rp {totalDonations.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-[#86868b] font-medium mt-1">Akumulasi Terverifikasi</p>
          </div>
        </div>

        {/* Card 4: Inventory Alert */}
        <div className={`p-6 rounded-3xl border shadow-xs space-y-4 transition-all ${
          lowStockItems.length > 0 
            ? 'bg-amber-500/[0.04] dark:bg-amber-400/[0.06] border-amber-500/25' 
            : 'bg-white dark:bg-[#161618] border-black/[0.06] dark:border-white/[0.08]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Inventaris Vihara</span>
            <div className="p-2 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] text-neutral-800 dark:text-neutral-200">
              <Package size={16} />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">{inventory.length} Jenis</p>
            <p className="text-xs text-[#86868b] font-medium mt-1">
              {lowStockItems.length > 0 ? `${lowStockItems.length} item stok menipis` : 'Stok dalam batas aman'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid distribution - Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Umat per HAN */}
        <div className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Building className="text-[#5e35b1] dark:text-purple-400" size={16} />
              <span>Distribusi Umat per Kelompok HAN</span>
            </h2>
            <span className="text-[11px] text-[#86868b] font-medium">{Object.keys(hanCounts).length} Kelompok</span>
          </div>

          <div className="space-y-4">
            {Object.keys(hanCounts).length > 0 ? (
              Object.entries(hanCounts).map(([hanName, count]) => (
                <div key={hanName} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-700 dark:text-neutral-300">{hanName}</span>
                    <span className="text-neutral-900 dark:text-white font-semibold">{count} Umat</span>
                  </div>
                  <div className="w-full bg-black/[0.04] dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#5e35b1] dark:bg-purple-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (count / (totalUmat || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#86868b] italic">Belum ada data distribusi HAN.</p>
            )}
          </div>
        </div>

        {/* Cetya Distribution */}
        <div className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Building className="text-amber-500" size={16} />
              <span>Distribusi Umat per Cetya Naungan</span>
            </h2>
            <span className="text-[11px] text-[#86868b] font-medium">{Object.keys(cetyaCounts).length} Cetya</span>
          </div>

          <div className="space-y-4">
            {Object.keys(cetyaCounts).length > 0 ? (
              Object.entries(cetyaCounts).map(([cetyaName, count]) => (
                <div key={cetyaName} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-700 dark:text-neutral-300">{cetyaName}</span>
                    <span className="text-neutral-900 dark:text-white font-semibold">{count} Umat</span>
                  </div>
                  <div className="w-full bg-black/[0.04] dark:bg-white/[0.08] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 dark:bg-amber-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (count / (totalUmat || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#86868b] italic">Belum ada data distribusi Cetya.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
