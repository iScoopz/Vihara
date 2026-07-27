'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  PlusCircle, 
  Users, 
  Clock, 
  MapPin,
  ArrowRight,
  Sparkles,
  Tag
} from 'lucide-react';
import { getEvents } from '@/lib/actions/vihara-actions';
import { ViharaEvent } from '@/types/database';

export default function EventsManagementPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function loadInitialData() {
      const evs = await getEvents();
      setEvents(evs);
    }
    loadInitialData();
  }, []);

  const categories = ['Kensyu', 'Pertemuan', 'Gongyo'];

  const filteredEvents = events.filter(e => {
    return selectedCategory === 'all' || e.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="text-purple-600 dark:text-purple-400" size={28} />
            <span>Kelola Event MNSBDI</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manajemen Kegiatan Kensyu, Pertemuan, & Gongyo MNSBDI
          </p>
        </div>

        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 gradient-mnsbdi text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/25 text-sm"
        >
          <PlusCircle size={18} />
          <span>Buat Event MNSBDI</span>
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-2">Kategori MNSBDI:</span>
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
            selectedCategory === 'all'
              ? 'gradient-mnsbdi text-white shadow-md'
              : 'bg-purple-50 dark:bg-purple-950 text-slate-600 dark:text-slate-300'
          }`}
        >
          Semua Kategori ({events.length})
        </button>

        {categories.map(cat => {
          const count = events.filter(e => e.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'gradient-mnsbdi text-white shadow-md'
                  : 'bg-purple-50 dark:bg-purple-950 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => {
          const isPast = ev.status === 'completed';
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
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    ev.category === 'Kensyu' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200' :
                    ev.category === 'Pertemuan' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200' :
                    'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-200'
                  }`}>
                    {ev.category || 'Gongyo'}
                  </span>

                  <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono">
                    {ev.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg leading-snug">{ev.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{ev.description}</p>

                <div className="pt-2 border-t border-purple-100 dark:border-purple-900/60 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                    <span>{new Date(ev.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin size={14} className="text-amber-500" />
                    <span>{ev.location}</span>
                  </div>
                </div>

                {/* Quota Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Kuota Terisi:</span>
                    <span className="text-purple-700 dark:text-purple-300 font-mono">{regCount} / {quota} Umat ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-purple-50 dark:bg-purple-950 h-2 rounded-full overflow-hidden">
                    <div 
                      className="gradient-mnsbdi h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <Link
                  href={`/events/${ev.id}`}
                  className="w-full py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 font-extrabold text-xs transition flex items-center justify-center gap-2 border border-purple-200 dark:border-purple-800"
                >
                  <span>Detail & Kepanitiaan Event</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
