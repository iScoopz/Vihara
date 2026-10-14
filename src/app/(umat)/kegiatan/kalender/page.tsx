'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEvents } from '@/lib/actions/vihara-actions';
import { ViharaEvent } from '@/types/database';
import { Badge, Button, Modal, ModalActions, PageHeader, Panel, StateMessage, buttonClass } from '@/components/ui/kit';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAYS_OF_WEEK = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default function UmatCalendarPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [selectedEventModal, setSelectedEventModal] = useState<ViharaEvent | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadData = async () => {
    try {
      const evs = await getEvents();
      setEvents(evs);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
  const isToday = (dayNum: number) => {
    return (
      today.getDate() === dayNum &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

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

  const formatDayLabel = (dayNum: number) =>
    new Date(year, month, dayNum).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalender kegiatan"
        actions={
          <Link href="/kegiatan" className={buttonClass('secondary')}>Daftar kegiatan</Link>
        }
      />

      {loadState === 'loading' ? (
        <Panel><StateMessage kind="loading" title="Memuat kalender..." /></Panel>
      ) : loadState === 'error' ? (
        <Panel>
          <StateMessage
            kind="error"
            title="Kalender belum bisa dimuat"
            description="Periksa koneksi internet, lalu coba lagi."
            action={<Button onClick={() => { setLoadState('loading'); loadData(); }}>Coba lagi</Button>}
          />
        </Panel>
      ) : (
        <>
          {upcomingH3Events.length > 0 && (
            <Panel className="p-4 sm:p-5 space-y-3">
              <h2 className="text-sm font-semibold text-ink">Dalam 3 hari ke depan</h2>
              <ul className="divide-y divide-line -mx-1">
                {upcomingH3Events.map(ev => (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedEventModal(ev)}
                      className="w-full text-left px-1 py-2.5 min-h-[44px] flex items-center justify-between gap-3 rounded-md hover:bg-surface-2 cursor-pointer"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink truncate">{ev.title}</span>
                        <span className="block text-xs text-ink-3">
                          {new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} · {ev.location}
                        </span>
                      </span>
                      {ev.diffDays === 0 ? (
                        <Badge tone="gold">Hari ini</Badge>
                      ) : ev.diffDays === 1 ? (
                        <Badge tone="gold">Besok</Badge>
                      ) : (
                        <Badge>{ev.diffDays} hari lagi</Badge>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2 border-b border-line">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  aria-label="Bulan sebelumnya"
                  className="w-11 h-11 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <h2 className="text-sm font-semibold text-ink min-w-32 text-center" aria-live="polite">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  type="button"
                  onClick={nextMonth}
                  aria-label="Bulan berikutnya"
                  className="w-11 h-11 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer"
                >
                  <ChevronRight size={18} aria-hidden />
                </button>
              </div>
              <Button size="sm" onClick={goToday}>Hari ini</Button>
            </div>

            <div className="grid grid-cols-7 border-b border-line text-center text-xs font-medium text-ink-3 py-2" aria-hidden>
              {DAYS_OF_WEEK.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 [&>*:nth-child(7n)]:border-r-0">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[52px] md:min-h-[96px] bg-surface-2 border-b border-r border-line" aria-hidden />
              ))}

              {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                const dayNum = dayIdx + 1;
                const dayEvents = getEventsForDay(dayNum);
                const isCurrentDay = isToday(dayNum);
                const isSelected = selectedDay === dayNum;
                const label = `${formatDayLabel(dayNum)}${isCurrentDay ? ', hari ini' : ''}, ${
                  dayEvents.length === 0 ? 'tidak ada kegiatan' : `${dayEvents.length} kegiatan`
                }`;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => setSelectedDay(dayNum)}
                    aria-label={label}
                    aria-pressed={isSelected}
                    className={`min-h-[52px] md:min-h-[96px] p-1.5 md:p-2 text-left flex flex-col gap-1 border-b border-r border-line cursor-pointer focus-visible:outline-2 focus-visible:outline-brand focus-visible:-outline-offset-2 ${
                      isSelected ? 'bg-brand-soft' : 'bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`w-6 h-6 rounded-md text-xs flex items-center justify-center tabular-nums ${
                        isCurrentDay ? 'bg-brand text-on-brand font-semibold' : isSelected ? 'text-brand-ink font-semibold' : 'text-ink-2'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span aria-hidden className="w-full min-w-0">
                        <span className="md:hidden block w-1.5 h-1.5 ml-2 rounded-full bg-brand" />
                        <span className="hidden md:block space-y-1">
                          {dayEvents.slice(0, 2).map(ev => (
                            <span key={ev.id} className="block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-brand-soft text-brand-ink">
                              {ev.title}
                            </span>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="block text-[11px] text-ink-3">+{dayEvents.length - 2} lagi</span>
                          )}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          {selectedDay && (
            <Panel className="p-4 sm:p-5 space-y-3">
              <h2 className="text-sm font-semibold text-ink">{formatDayLabel(selectedDay)}</h2>
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-ink-3">Tidak ada kegiatan di tanggal ini.</p>
              ) : (
                <ul className="divide-y divide-line -mx-1">
                  {selectedDayEvents.map(ev => (
                    <li key={ev.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedEventModal(ev)}
                        className="w-full text-left px-1 py-2.5 min-h-[44px] rounded-md hover:bg-surface-2 cursor-pointer"
                      >
                        <span className="block text-sm font-medium text-ink">{ev.title}</span>
                        <span className="block text-xs text-ink-3">
                          {ev.category ? `${ev.category} · ` : ''}{ev.location}
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

      <Modal open={selectedEventModal !== null} onClose={() => setSelectedEventModal(null)} title={selectedEventModal?.title || 'Kegiatan'}>
        {selectedEventModal && (
          <div className="space-y-4">
            {selectedEventModal.category && <Badge tone="brand">{selectedEventModal.category}</Badge>}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-ink-3">Tanggal</dt>
              <dd className="text-ink">
                {new Date(selectedEventModal.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </dd>
              <dt className="text-ink-3">Lokasi</dt>
              <dd className="text-ink">{selectedEventModal.location || <span className="text-ink-3">Belum diisi</span>}</dd>
            </dl>
            {selectedEventModal.description && (
              <p className="text-sm text-ink-2">{selectedEventModal.description}</p>
            )}
            <ModalActions>
              <Link href="/kegiatan" className={buttonClass('primary')}>Daftar di halaman kegiatan</Link>
            </ModalActions>
          </div>
        )}
      </Modal>
    </div>
  );
}
