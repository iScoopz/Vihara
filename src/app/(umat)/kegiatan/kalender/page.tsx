'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, ArrowLeft, Bell } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <Link 
          href="/kegiatan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#86868b] hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Katalog Kegiatan</span>
        </Link>

        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.08]">
          Kalender MNSBDI
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
            Agenda Bulanan
          </span>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <CalendarIcon className="text-[#5e35b1] dark:text-amber-400" size={26} />
            <span>Kalender Jadwal Kegiatan</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6]">
            Jadwal kegiatan MNSBDI tertandai dalam tampilan kalender bulanan.
          </p>
        </div>

        {/* Apple Segmented Calendar Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#161618] p-1.5 rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
          <button 
            onClick={goToday}
            className="px-3.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-neutral-900 dark:text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Hari Ini
          </button>
          
          <div className="flex items-center gap-1 px-1">
            <button 
              onClick={prevMonth} 
              className="p-1.5 rounded-full text-[#86868b] hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
              title="Bulan sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-neutral-900 dark:text-white px-2 min-w-28 text-center">
              {monthNames[month]} {year}
            </span>
            <button 
              onClick={nextMonth} 
              className="p-1.5 rounded-full text-[#86868b] hover:text-black dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-all cursor-pointer"
              title="Bulan berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Reminder Banner H-3 Event Mendatang */}
      {upcomingH3Events.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#161618] border border-amber-500/25 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs tracking-wide">
            <Bell size={15} />
            <span>Agenda Mendatang H-3 ({upcomingH3Events.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingH3Events.map(ev => (
              <div 
                key={ev.id} 
                onClick={() => setSelectedEventModal(ev)}
                className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between cursor-pointer hover:border-black/20 dark:hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-[#5e35b1] dark:text-purple-300">
                    {ev.category}
                  </span>
                  <h2 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">{ev.title}</h2>
                  <p className="text-[11px] text-[#86868b]">
                    {new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} &bull; {ev.location}
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0 ml-2 ${
                  ev.diffDays === 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                  ev.diffDays === 1 ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                  'bg-black/[0.05] dark:bg-white/[0.08] text-neutral-800 dark:text-neutral-200'
                }`}>
                  {ev.diffDays === 0 ? 'Hari Ini' : ev.diffDays === 1 ? 'Besok' : `H-${ev.diffDays}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apple-style Calendar Grid */}
      <div className="rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-black/[0.06] dark:border-white/[0.08] text-center text-xs font-semibold text-[#86868b] py-3 bg-black/[0.01] dark:bg-white/[0.02]">
          {daysOfWeek.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 border-collapse divide-x divide-y divide-black/[0.06] dark:divide-white/[0.08]">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-black/[0.01] dark:bg-white/[0.02] p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
            const dayNum = dayIdx + 1;
            const dayEvents = getEventsForDay(dayNum);
            const isCurrentDay = isToday(dayNum);

            return (
              <div 
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2.5 transition flex flex-col justify-between ${
                  isCurrentDay 
                    ? 'bg-amber-500/[0.06] dark:bg-amber-400/[0.08]' 
                    : 'bg-white dark:bg-[#161618] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  {isCurrentDay ? (
                    <span className="w-6 h-6 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-semibold text-[11px] flex items-center justify-center">
                      {dayNum}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {dayNum}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventModal(ev)}
                      className={`p-1.5 rounded-xl text-[10px] font-semibold cursor-pointer transition line-clamp-2 ${
                        ev.category === 'Kensyu' ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25' :
                        ev.category === 'Pertemuan' ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25' :
                        'bg-purple-500/15 text-[#5e35b1] dark:text-purple-300 hover:bg-purple-500/25'
                      }`}
                    >
                      {ev.title}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1c1e] border border-black/[0.08] dark:border-white/[0.12] rounded-3xl max-w-md w-full p-7 shadow-xl space-y-4">
            <div className="flex justify-between items-start border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-[#5e35b1] dark:text-purple-300">
                  {selectedEventModal.category}
                </span>
                <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white mt-1.5">
                  {selectedEventModal.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedEventModal(null)} 
                className="text-[#86868b] hover:text-black dark:hover:text-white text-xs font-medium cursor-pointer p-1"
              >
                Tutup
              </button>
            </div>

            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
              {selectedEventModal.description}
            </p>

            <div className="space-y-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 pt-1">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#86868b]" />
                <span>
                  {new Date(selectedEventModal.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#86868b]" />
                <span>{selectedEventModal.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex justify-end">
              <Link
                href="/kegiatan"
                className="bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold px-5 py-2 rounded-full text-xs shadow-xs transition-all"
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
