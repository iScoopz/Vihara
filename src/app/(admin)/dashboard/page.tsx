'use client'

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  HeartHandshake, 
  PackageX, 
  Cake, 
  Building2, 
  MapPin
} from 'lucide-react';
import { getUpcomingBirthdays, getProfiles, getEvents, getDonations, getInventory } from '@/lib/actions/vihara-actions';
import { Profile, ViharaEvent, Donation, InventoryItem } from '@/types/database';

export default function DashboardPage() {
  const [birthdays, setBirthdays] = useState<Profile[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [showMockBirthdayToggle, setShowMockBirthdayToggle] = useState(true);

  useEffect(() => {
    async function loadData() {
      const bdays = await getUpcomingBirthdays();
      const profs = await getProfiles();
      const evs = await getEvents();
      const dons = await getDonations();
      const invs = await getInventory();

      setBirthdays(bdays);
      setProfiles(profs);
      setEvents(evs);
      setDonations(dons);
      setInventory(invs);
    }
    loadData();
  }, []);

  const totalUmat = profiles.length;
  const activeEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing').length;
  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const lowStockItems = inventory.filter(i => i.stock_quantity <= i.min_stock_alert);

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

  const activeBirthdays = showMockBirthdayToggle ? birthdays : [];

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ringkasan statistik data umat, event, donasi, dan inventaris</p>
        </div>

        {/* Toggle Widget Ultah Simulator */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#160e29] p-2 rounded-xl border border-purple-100 dark:border-purple-900/60 shadow-sm">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Simulasi Widget Ultah:</span>
          <button
            onClick={() => setShowMockBirthdayToggle(!showMockBirthdayToggle)}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
              showMockBirthdayToggle
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {showMockBirthdayToggle ? 'Tampilkan Widget' : 'Sembunyikan Widget'}
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Umat</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{totalUmat}</h3>
            <span className="inline-block mt-2 text-[11px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
              Terdaftar
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event Aktif</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{activeEvents}</h3>
            <span className="inline-block mt-2 text-[11px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Mendatang
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
            <Calendar size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Donasi</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              Rp {totalDonations.toLocaleString('id-ID')}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Dana Paramita
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
            <HeartHandshake size={24} />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stok Menipis</p>
            <h3 className={`text-3xl font-extrabold mt-1 ${lowStockItems.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {lowStockItems.length}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
              Perlu Restok
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <PackageX size={24} />
          </div>
        </div>
      </div>

      {/* OPTIONAL BIRTHDAY WIDGET */}
      {activeBirthdays.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-extrabold flex items-center justify-center shadow-lg">
                <Cake size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>Pengingat Ulang Tahun Umat</span>
                  <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                    Bulan Ini ({activeBirthdays.length} Umat)
                  </span>
                </h3>
                <p className="text-xs text-purple-200">
                  Daftar umat yang berulang tahun pada bulan ini.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 pt-2">
            {activeBirthdays.map((bday) => (
              <div key={bday.id} className="p-4 rounded-xl bg-purple-950/70 border border-purple-400/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                    {bday.full_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{bday.full_name}</h4>
                    <p className="text-xs text-purple-200">{bday.han || 'Umat Vihara'} • {bday.cetya}</p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2 py-1 rounded-md border border-amber-400/30">
                  🎂 {bday.birth_date ? new Date(bday.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sebaran HAN */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="text-purple-600 dark:text-purple-400" size={18} />
              <span>Sebaran Wilayah HAN</span>
            </h3>
            <span className="text-xs text-slate-400">Demografi Umat</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(hanCounts).map(([han, count]) => {
              const percentage = Math.round((count / totalUmat) * 100) || 0;
              return (
                <div key={han} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{han}</span>
                    <span className="text-purple-700 dark:text-purple-300 font-extrabold">{count} Umat ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-purple-50 dark:bg-purple-950 h-3 rounded-full overflow-hidden border border-purple-100 dark:border-purple-900">
                    <div 
                      className="gradient-purple h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sebaran Cetya */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="text-amber-500" size={18} />
              <span>Sebaran Cetya Bernaung</span>
            </h3>
            <span className="text-xs text-slate-400">Lokasi Kebaktian</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(cetyaCounts).map(([cetya, count]) => {
              const percentage = Math.round((count / totalUmat) * 100) || 0;
              return (
                <div key={cetya} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{cetya}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-extrabold">{count} Umat ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-amber-50 dark:bg-amber-950 h-3 rounded-full overflow-hidden border border-amber-100 dark:border-amber-900">
                    <div 
                      className="gradient-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
