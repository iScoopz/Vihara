'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { getEvents } from '@/lib/actions/vihara-actions';
import { ViharaEvent } from '@/types/database';

export default function UmatCalendarPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEventModal, setSelectedEventModal] = useState<ViharaEvent | null>(null);

  useEffect(() => {
    async function loadData() {
      const evs = await getEvents();
      setEvents(evs);
    }
    loadData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const today = new Date();
  const isToday = (dayNum: number) => {
    return (
      today.getDate() === dayNum &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  // H-3 Reminder Events Filter
  const upcomingH3Events = events.filter(ev => {
    const evDate = new Date(ev.event_date);
    const t1 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const t2 = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate()).getTime();
    const diffDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).map(ev => {
    const evDate = new Date(ev.event_date);
    const t1 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const t2 = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate()).getTime();
    const diffDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
    return { ...ev, diffDays };
  });

  const getEventsForDay = (dayNumber: number) => {
    return events.filter(ev => {
      const evStartDate = new Date(ev.event_date);
      const evEndDate = ev.end_date ? new Date(ev.end_date) : evStartDate;
      const cellStart = new Date(year, month, dayNumber, 0, 0, 0);
      const cellEnd = new Date(year, month, dayNumber, 23, 59, 59);
      return (evStartDate <= cellEnd && evEndDate >= cellStart);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/kegiatan"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Katalog Kegiatan</span>
        </Link>

        <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
          Kalender Umat MNSBDI
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-purple-600 dark:text-purple-400" size={28} />
            <span>Kalender Jadwal Kensyu, Pertemuan, & Gongyo MNSBDI</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Jadwal kegiatan MNSBDI tertandai dalam tampilan Kalender</p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-[#160e29] p-2 rounded-2xl border border-purple-100 dark:border-purple-900/60 shadow-sm">
          <button 
            onClick={goToday}
            className="px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 font-extrabold text-xs hover:bg-purple-200 transition cursor-pointer"
          >
            Hari Ini
          </button>
          
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950 cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white px-2">
              {monthNames[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950 cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Reminder Banner H-3 Event Mendatang */}
      {upcomingH3Events.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-amber-400 dark:border-amber-500 space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black text-xs">
            <span className="animate-bounce">🔔</span>
            <span>NOTIFIKASI REMINDER H-3 EVENT MENDATANG ({upcomingH3Events.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {upcomingH3Events.map(ev => (
              <div 
                key={ev.id} 
                onClick={() => setSelectedEventModal(ev)}
                className="p-3 rounded-xl bg-white dark:bg-[#1f153a] border border-amber-300 dark:border-amber-600/60 shadow-sm flex items-center justify-between cursor-pointer hover:scale-[1.02] transition"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200">
                    {ev.category}
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{ev.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} &bull; {ev.location}
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow ${
                  ev.diffDays === 0 ? 'bg-rose-500 text-white animate-pulse' :
                  ev.diffDays === 1 ? 'bg-amber-500 text-slate-950' :
                  'bg-indigo-600 text-white'
                }`}>
                  {ev.diffDays === 0 ? 'Hari Ini!' : ev.diffDays === 1 ? 'H-1 (Besok)' : `H-${ev.diffDays}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Grid Container */}
      <div className="rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-purple-50 dark:bg-purple-950/60 border-b border-purple-100 dark:border-purple-900/60 text-center text-xs font-black text-purple-950 dark:text-purple-200 uppercase py-3">
          {daysOfWeek.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-collapse divide-x divide-y divide-purple-100 dark:divide-purple-900/60">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-slate-50/50 dark:bg-purple-950/20 p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
            const dayNum = dayIdx + 1;
            const dayEvents = getEventsForDay(dayNum);
            const isCurrentDay = isToday(dayNum);

            return (
              <div 
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2 transition flex flex-col justify-between ${
                  isCurrentDay 
                    ? 'bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500 rounded-xl shadow-md' 
                    : 'bg-white dark:bg-[#160e29] hover:bg-purple-50/30 dark:hover:bg-purple-950/30'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  {isCurrentDay ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] shadow animate-pulse">
                      Hari Ini ({dayNum})
                    </span>
                  ) : (
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {dayNum}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventModal(ev)}
                      className={`p-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition shadow-sm line-clamp-2 ${
                        ev.category === 'Kensyu' ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' :
                        ev.category === 'Pertemuan' ? 'bg-emerald-600 text-white hover:bg-emerald-500' :
                        'gradient-mnsbdi text-white hover:opacity-90'
                      }`}
                    >
                      [{ev.category}] {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Event Popup Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                  {selectedEventModal.category}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{selectedEventModal.title}</h3>
              </div>
              <button onClick={() => setSelectedEventModal(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">Tutup ✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{selectedEventModal.description}</p>

            <div className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                <span>
                  {new Date(selectedEventModal.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-amber-500" />
                <span>{selectedEventModal.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-purple-100 dark:border-purple-900/60 flex justify-end">
              <Link
                href="/kegiatan"
                className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md"
              >
                Daftar Mandiri di Katalog
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
