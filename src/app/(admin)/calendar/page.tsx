'use client'

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEvents } from '@/lib/actions/vihara-actions';
import { ViharaEvent } from '@/types/database';
import { Badge, Button, Modal, ModalActions, PageHeader, Panel, StateMessage, buttonClass } from '@/components/ui/kit';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const dayDiffLabel = (diff: number) => (diff === 0 ? 'Hari ini' : diff === 1 ? 'Besok' : `H-${diff}`);

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [selectedEventModal, setSelectedEventModal] = useState<ViharaEvent | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadData = useCallback(async () => {
    setLoadState('loading');
    try {
      const evs = await getEvents();
      setEvents(evs);
      setLoadState('ready');
    } catch (e) {
      console.error('Calendar load error:', e);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };
  const goToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.getDate());
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isToday = (dayNum: number) =>
    today.getDate() === dayNum && today.getMonth() === month && today.getFullYear() === year;

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const upcomingH3Events = events
    .map(ev => {
      const evDate = new Date(ev.event_date);
      const evStart = new Date(evDate.getFullYear(), evDate.getMonth(), evDate.getDate()).getTime();
      return { ...ev, diffDays: Math.round((evStart - startOfToday) / (1000 * 60 * 60 * 24)) };
    })
    .filter(ev => ev.diffDays >= 0 && ev.diffDays <= 3)
    .sort((a, b) => a.diffDays - b.diffDays);

  const getEventsForDay = (dayNumber: number) => {
    return events.filter(ev => {
      const evStartDate = new Date(ev.event_date);
      const evEndDate = ev.end_date ? new Date(ev.end_date) : evStartDate;
      const cellStart = new Date(year, month, dayNumber, 0, 0, 0);
      const cellEnd = new Date(year, month, dayNumber, 23, 59, 59);
      return (evStartDate <= cellEnd && evEndDate >= cellStart);
    });
  };

  const fullDate = (dayNum: number) =>
    new Date(year, month, dayNum).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalender"
        description="Jadwal Kensyu, Pertemuan, dan Gongyo."
        actions={
          <div className="flex items-center gap-1">
            <Button size="sm" onClick={goToday}>Hari ini</Button>
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Bulan sebelumnya"
              className="w-11 h-11 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
            >
              <ChevronLeft size={18} aria-hidden />
            </button>
            <span className="text-sm font-semibold text-ink min-w-[8.5rem] text-center tabular-nums" aria-live="polite">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Bulan berikutnya"
              className="w-11 h-11 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
            >
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        }
      />

      {loadState === 'loading' && (
        <Panel><StateMessage kind="loading" title="Memuat jadwal..." /></Panel>
      )}

      {loadState === 'error' && (
        <Panel>
          <StateMessage
            kind="error"
            title="Jadwal gagal dimuat."
            description="Periksa koneksi lalu coba lagi."
            action={<Button size="sm" onClick={loadData}>Coba lagi</Button>}
          />
        </Panel>
      )}

      {loadState === 'ready' && (
        <>
          {upcomingH3Events.length > 0 && (
            <Panel className="p-4 space-y-2">
              <h2 className="text-sm font-semibold text-ink">Dalam 3 hari ke depan</h2>
              <ul className="divide-y divide-line">
                {upcomingH3Events.map(ev => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedEventModal(ev)}
                      className="w-full min-h-[44px] py-2 flex items-center justify-between gap-3 text-left rounded-md hover:bg-surface-2 cursor-pointer"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink truncate">{ev.title}</span>
                        <span className="block text-xs text-ink-2">
                          {new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                          {ev.location ? `, ${ev.location}` : ''}
                          {ev.category ? `, ${ev.category}` : ''}
                        </span>
                      </span>
                      <Badge tone={ev.diffDays === 0 ? 'gold' : 'neutral'} className="shrink-0">{dayDiffLabel(ev.diffDays)}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-line text-center text-xs font-medium text-ink-3 py-2" aria-hidden>
              {daysOfWeek.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[52px] md:min-h-[110px] bg-surface-2 border-b border-r border-line" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                const dayNum = dayIdx + 1;
                const dayEvents = getEventsForDay(dayNum);
                const isCurrentDay = isToday(dayNum);
                const isSelected = selectedDay === dayNum;
                const label = `${fullDate(dayNum)}${isCurrentDay ? ', hari ini' : ''}, ${
                  dayEvents.length > 0 ? `${dayEvents.length} kegiatan` : 'tidak ada kegiatan'
                }`;

                return (
                  <div key={`day-${dayNum}`} className={`relative min-h-[52px] md:min-h-[110px] border-b border-r border-line ${isSelected ? 'bg-brand-soft' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedDay(dayNum)}
                      aria-label={label}
                      aria-pressed={isSelected}
                      className="absolute inset-0 w-full h-full cursor-pointer hover:bg-surface-2/60 focus-visible:z-20"
                    />
                    <div className="relative pointer-events-none p-1 md:p-2 flex flex-col items-center md:items-stretch gap-1">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs tabular-nums ${
                          isSelected
                            ? 'bg-brand text-on-brand font-semibold'
                            : isCurrentDay
                              ? 'text-brand font-semibold border border-brand'
                              : 'text-ink-2'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="md:hidden w-1.5 h-1.5 rounded-sm bg-brand" aria-hidden />
                      )}
                    </div>
                    <div className="relative z-10 hidden md:block px-2 pb-2 space-y-1">
                      {dayEvents.map(ev => (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => setSelectedEventModal(ev)}
                          className="block w-full text-left px-1.5 py-1 rounded-md text-[11px] font-medium bg-brand-soft text-brand-ink hover:bg-surface-2 cursor-pointer line-clamp-2"
                          title={`${ev.title} (${ev.location})`}
                        >
                          {ev.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {selectedDay && (
            <Panel className="p-4 space-y-2">
              <h2 className="text-sm font-semibold text-ink">{fullDate(selectedDay)}</h2>
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-ink-3">Tidak ada kegiatan di tanggal ini.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {selectedDayEvents.map(ev => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedEventModal(ev)}
                        className="w-full min-h-[44px] py-2 text-left rounded-md hover:bg-surface-2 cursor-pointer"
                      >
                        <span className="block text-sm font-medium text-ink">{ev.title}</span>
                        <span className="block text-xs text-ink-2">
                          {[ev.category, ev.location].filter(Boolean).join(', ') || '-'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </>
      )}

      <Modal
        open={!!selectedEventModal}
        onClose={() => setSelectedEventModal(null)}
        title={selectedEventModal?.title || 'Kegiatan'}
      >
        {selectedEventModal && (
          <div className="space-y-4">
            {selectedEventModal.category && <Badge tone="brand">{selectedEventModal.category}</Badge>}
            {selectedEventModal.description && (
              <p className="text-sm text-ink-2 leading-relaxed">{selectedEventModal.description}</p>
            )}
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-ink-3">Tanggal</dt>
              <dd className="text-ink">
                {new Date(selectedEventModal.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </dd>
              <dt className="text-ink-3">Lokasi</dt>
              <dd className="text-ink">{selectedEventModal.location || <span className="text-ink-3">Belum diisi</span>}</dd>
            </dl>
            <ModalActions>
              <Button onClick={() => setSelectedEventModal(null)}>Tutup</Button>
              <Link href={`/events/${selectedEventModal.id}`} className={buttonClass('primary')}>
                Buka detail dan panitia
              </Link>
            </ModalActions>
          </div>
        )}
      </Modal>
    </div>
  );
}
