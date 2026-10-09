'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  MapPin, 
  ChevronRight, 
  CheckCircle2, 
  Archive, 
  Clock, 
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
    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, is_completed: !ev.is_completed } : ev));
    try {
      await toggleCompleteEvent(eventId);
    } catch (err) {
      setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, is_completed: !ev.is_completed } : ev));
    }
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
            Agenda & Pelaksanaan
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <CalendarDays className="text-[#5e35b1] dark:text-amber-400" size={26} />
            <span>Manajemen Event Vihara</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6]">
            Pengelolaan agenda Kensyu, Pertemuan, Gongyo MNSBDI dan arsip kegiatan selesai.
          </p>
        </div>

        <Link
          href="/events/new"
          className="inline-flex items-center gap-1.5 bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold px-5 py-2.5 rounded-full text-xs shadow-xs transition-all cursor-pointer w-fit"
        >
          <Plus size={14} />
          <span>Buat Event Baru</span>
        </Link>
      </div>

      {/* Main Tabs (Apple Segmented Pill Control) */}
      <div className="bg-black/[0.04] dark:bg-white/[0.08] p-1 rounded-full border border-black/[0.04] dark:border-white/[0.06] inline-flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-1.5 px-4 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'active'
              ? 'bg-white dark:bg-[#2c2c2e] text-neutral-900 dark:text-white font-semibold shadow-xs'
              : 'text-[#86868b] hover:text-neutral-900 dark:hover:text-white font-medium'
          }`}
        >
          <Clock size={13} />
          <span>Event Aktif ({activeEventsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-1.5 px-4 rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white dark:bg-[#2c2c2e] text-neutral-900 dark:text-white font-semibold shadow-xs'
              : 'text-[#86868b] hover:text-neutral-900 dark:hover:text-white font-medium'
          }`}
        >
          <Archive size={13} />
          <span>Riwayat Selesai ({historyEventsList.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-[#86868b]" size={15} />
            <input
              type="text"
              placeholder={activeTab === 'active' ? "Cari judul event aktif / lokasi..." : "Cari riwayat event / lokasi pelaksanaan..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl pl-10 pr-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder-[#86868b] focus:outline-none focus:border-black/30 dark:focus:border-white/30 font-medium transition-all"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const count = cat === 'all' 
                ? targetList.length 
                : targetList.filter(e => e.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer font-medium ${
                    selectedCategory === cat
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                      : 'bg-black/[0.03] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredEvents.map((ev) => {
            const isPast = new Date(ev.event_date) < new Date();
            const regCount = ev.registrations_count || 0;
            const quota = ev.quota || 100;
            const percentage = Math.min(100, Math.round((regCount / quota) * 100));
            const isComplex = ev.is_complex ?? true;

            return (
              <div
                key={ev.id}
                className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs hover:border-black/15 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[#5e35b1] dark:text-purple-300">
                        {ev.category || 'Gongyo'}
                      </span>

                      {/* Event Scale Badge */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isComplex
                          ? 'bg-black/[0.04] text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-300'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {isComplex ? <Building2 size={10} /> : <Flower2 size={10} />}
                        <span>{isComplex ? 'Kompleks' : 'Rutin'}</span>
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ev.is_published
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      }`}>
                        {ev.is_published ? 'Terbit' : 'Draf'}
                      </span>
                    </div>

                    {ev.is_completed ? (
                      <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 bg-black/[0.04] dark:bg-white/[0.08] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Selesai</span>
                      </span>
                    ) : isPast ? (
                      <span className="text-[10px] font-medium text-[#86868b] bg-black/[0.03] dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
                        Lewat
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Mendatang
                      </span>
                    )}
                  </div>

                  <h2 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white leading-snug">
                    {ev.title}
                  </h2>

                  <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] line-clamp-2">
                    {ev.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06]">
                    <p className="flex items-center gap-1.5 font-medium">
                      <CalendarDays size={13} className="text-[#86868b]" />
                      <span>{new Date(ev.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin size={13} className="text-[#86868b]" />
                      <span>{ev.location}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-[#86868b]">Kuota</span>
                      <span className="text-neutral-900 dark:text-white font-semibold">{regCount} / {quota} Umat</span>
                    </div>
                    <div className="w-full bg-black/[0.04] dark:bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#5e35b1] dark:bg-purple-400 h-full rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/events/${ev.id}`}
                      className="flex-1 py-2 rounded-full font-semibold text-xs flex items-center justify-center gap-1 transition-all bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-neutral-900 dark:text-white"
                    >
                      <span>Workspace</span>
                      <ChevronRight size={13} />
                    </Link>

                    {/* Quick Complete / Undo Complete Action Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleCompleteCard(ev.id, e)}
                      className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
                        ev.is_completed
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-neutral-800 dark:text-neutral-200 border-black/[0.06] dark:border-white/[0.08]'
                      }`}
                      title={ev.is_completed ? "Kembalikan event ke daftar aktif" : "Tandai event ini telah selesai"}
                    >
                      {ev.is_completed ? <RotateCcw size={13} /> : <CheckCircle2 size={13} />}
                      <span>{ev.is_completed ? 'Aktifkan' : 'Selesai'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-[#161618] rounded-3xl border border-black/[0.06] dark:border-white/[0.08] space-y-3 shadow-xs">
          <Archive size={36} className="mx-auto text-[#86868b]" />
          <h2 className="font-bold text-neutral-900 dark:text-white text-sm">
            {activeTab === 'history' ? 'Belum Ada Riwayat Event Selesai' : 'Tidak Ada Event yang Sesuai'}
          </h2>
          <p className="text-xs text-[#86868b] max-w-sm mx-auto leading-relaxed">
            {activeTab === 'history'
              ? 'Tandai event yang telah terlaksana sebagai "Selesai" agar tersimpan rapi di tab ini.'
              : 'Coba ubah kata kunci pencarian atau filter kategori di atas.'}
          </p>
        </div>
      )}
    </div>
  );
}
