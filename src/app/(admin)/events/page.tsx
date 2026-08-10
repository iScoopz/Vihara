'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  ChevronRight, 
  Building,
  Sparkles,
  CheckCircle2,
  Archive,
  Clock,
  FileText,
  Flower2,
  Building2,
  RotateCcw
} from 'lucide-react';
import { getEvents, toggleCompleteEvent } from '@/lib/actions/vihara-actions';
import { ViharaEvent, EventCategory } from '@/types/database';

export default function AdminEventsListPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  async function loadData() {
    const data = await getEvents();
    setEvents(data);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCompleteCard = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await toggleCompleteEvent(eventId);
    await loadData();
  };

  const categories: ('all' | EventCategory)[] = ['all', 'Gongyo', 'Kensyu', 'Pertemuan'];

  // Partition events into Active vs Completed History
  const activeEventsList = events.filter(e => !e.is_completed);
  const historyEventsList = events.filter(e => e.is_completed);

  const targetList = activeTab === 'active' ? activeEventsList : historyEventsList;

  const filteredEvents = targetList.filter(ev => {
    const matchSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ev.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || ev.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="text-purple-600 dark:text-purple-400" size={28} />
            <span>Manajemen Event & Kebaktian Vihara</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pengelolaan agenda Kensyu, Pertemuan, Gongyo MNSBDI & Arsip Riwayat Event</p>
        </div>

        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 gradient-mnsbdi text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/25 text-sm hover:opacity-95 cursor-pointer w-fit"
        >
          <Plus size={18} />
          <span>Buat Event Baru</span>
        </Link>
      </div>

      {/* Main Tabs (Event Aktif vs Riwayat Event) */}
      <div className="flex border-b border-purple-100 dark:border-purple-900/60 gap-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'active'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Clock size={16} />
          <span>Event Aktif & Perencanaan ({activeEventsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 font-extrabold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'history'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Archive size={16} />
          <span>Riwayat Event (Arsip Selesai) ({historyEventsList.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={activeTab === 'active' ? "Cari Judul Event Aktif / Lokasi..." : "Cari Riwayat Event / Lokasi Pelaksanaan..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const count = cat === 'all' 
                ? targetList.length 
                : targetList.filter(e => e.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'gradient-mnsbdi text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-purple-950 text-slate-600 dark:text-slate-300 border border-purple-100 dark:border-purple-900/60 hover:bg-purple-50'
                  }`}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isPast = new Date(ev.event_date) < new Date();
            const regCount = ev.registrations_count || 0;
            const quota = ev.quota || 100;
            const percentage = Math.min(100, Math.round((regCount / quota) * 100));
            const isComplex = ev.is_complex ?? true;

            return (
              <div
                key={ev.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                        {ev.category || 'Gongyo'}
                      </span>

                      {/* Event Scale Badge */}
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isComplex
                          ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {isComplex ? <Building2 size={10} /> : <Flower2 size={10} />}
                        <span>{isComplex ? 'Event Kompleks' : 'Ibadah Rutin (Simpel)'}</span>
                      </span>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        ev.is_published
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {ev.is_published ? '✓ Terbit' : '📝 Draf'}
                      </span>
                    </div>

                    {ev.is_completed ? (
                      <span className="text-[10px] font-extrabold text-slate-700 bg-slate-200 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>Selesai</span>
                      </span>
                    ) : isPast ? (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        Lewat Tanggal
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                        Mendatang
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-purple-950 dark:text-white leading-snug">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {ev.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-purple-100 dark:border-purple-900/60">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <CalendarDays size={14} className="text-purple-600" />
                      {new Date(ev.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="flex items-center gap-1.5 font-semibold">
                      <MapPin size={14} className="text-amber-500" />
                      {ev.location}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-extrabold">
                      <span className="text-slate-500">Kuota Terisi</span>
                      <span className="text-purple-700 dark:text-purple-300">{regCount} / {quota} Umat</span>
                    </div>
                    <div className="w-full bg-purple-100 dark:bg-purple-950 h-2 rounded-full overflow-hidden">
                      <div className="gradient-mnsbdi h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/events/${ev.id}`}
                      className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition ${
                        activeTab === 'history'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                          : 'bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-950 dark:text-purple-200'
                      }`}
                    >
                      <span>{activeTab === 'history' ? 'Workspace' : 'Buka Workspace'}</span>
                      <ChevronRight size={14} />
                    </Link>

                    {/* Quick Complete / Undo Complete Action Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompleteCard(ev.id, e)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer border ${
                        ev.is_completed
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
                          : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                      }`}
                      title={ev.is_completed ? "Kembalikan event ke daftar event aktif" : "Tandai event ini telah selesai dan pindahkan ke Riwayat Event"}
                    >
                      {ev.is_completed ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                      <span>{ev.is_completed ? 'Aktifkan' : 'Selesai'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-[#160e29] rounded-2xl border border-purple-100 dark:border-purple-900/60 space-y-3">
          <Archive size={40} className="mx-auto text-purple-300 dark:text-purple-800" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
            {activeTab === 'history' ? 'Belum Ada Riwayat Event Selesai' : 'Tidak Ada Event Aktif yang Sesuai'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'history'
              ? 'Tandai event yang telah terlaksana sebagai "Selesai" (menggunakan tombol Selesai di kartu event atau di Workspace) agar tersimpan rapi di tab ini.'
              : 'Coba ubah kata kunci pencarian atau filter kategori di atas.'}
          </p>
        </div>
      )}
    </div>
  );
}
