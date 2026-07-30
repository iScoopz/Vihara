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
  CheckCircle2
} from 'lucide-react';
import { getEvents } from '@/lib/actions/vihara-actions';
import { ViharaEvent, EventCategory } from '@/types/database';

export default function AdminEventsListPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function loadData() {
      const data = await getEvents();
      setEvents(data);
    }
    loadData();
  }, []);

  const categories: ('all' | EventCategory)[] = ['all', 'Gongyo', 'Kensyu', 'Pertemuan'];

  const filteredEvents = events.filter(ev => {
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
          <p className="text-sm text-slate-500 dark:text-slate-400">Pengelolaan agenda Kensyu, Pertemuan, & Gongyo MNSBDI</p>
        </div>

        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 gradient-mnsbdi text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/25 text-sm hover:opacity-95 cursor-pointer"
        >
          <Plus size={18} />
          <span>Buat Event Baru</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari Judul Event / Lokasi Pelaksanaan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const count = cat === 'all' 
            ? events.length 
            : events.filter(e => e.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'gradient-mnsbdi text-white shadow-md'
                  : 'bg-white dark:bg-[#160e29] text-slate-600 dark:text-slate-300 border border-purple-100 dark:border-purple-900/60 hover:bg-purple-50'
              }`}
            >
              {cat === 'all' ? 'Semua Event' : cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => {
          const isPast = new Date(ev.event_date) < new Date();
          const regCount = ev.registrations_count || 0;
          const quota = ev.quota || 100;
          const percentage = Math.min(100, Math.round((regCount / quota) * 100));

          return (
            <div
              key={ev.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                      {ev.category || 'Gongyo'}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      ev.is_published
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {ev.is_published ? '✓ Terbit' : '📝 Draf'}
                    </span>
                  </div>

                  {isPast ? (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Selesai
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

                <Link
                  href={`/events/${ev.id}`}
                  className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-950 dark:text-purple-200 font-extrabold text-xs flex items-center justify-center gap-1 transition"
                >
                  <span>Buka Workspace & PDF Report</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
