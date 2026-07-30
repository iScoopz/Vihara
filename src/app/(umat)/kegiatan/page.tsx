'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Clock, CheckCircle2, UserCheck, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { getEvents, registerForEvent, getRegistrationsForEvent } from '@/lib/actions/vihara-actions';
import { ViharaEvent } from '@/types/database';

export default function PublicEventCatalogPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const currentUmatId = 'p2'; // Simulated logged-in Umat (Suryani Dewi)

  const loadCatalog = async () => {
    const data = await getEvents();
    const publishedEvents = data.filter(ev => ev.is_published === true || ev.is_published === undefined);
    setEvents(publishedEvents);

    const registeredIds: string[] = [];
    for (const ev of data) {
      const regs = await getRegistrationsForEvent(ev.id);
      if (regs.some(r => r.profile_id === currentUmatId)) {
        registeredIds.push(ev.id);
      }
    }
    setRegisteredEventIds(registeredIds);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleSelfRegister = async (eventId: string) => {
    setLoadingId(eventId);
    setMessage(null);

    const res = await registerForEvent(eventId, undefined, currentUmatId);

    setLoadingId(null);
    if (res.error) {
      setMessage({ text: res.error, type: 'error' });
    } else {
      setMessage({ 
        text: '✓ Berhasil mendaftar event! Pendaftaran Anda dicatat otomatis (Self-Registration)', 
        type: 'success' 
      });
      loadCatalog();
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white shadow-xl space-y-4 border border-purple-700/50 relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
            <Sparkles size={14} />
            <span>Katalog Kegiatan MNSBDI 2568 BE</span>
          </div>

          <Link
            href="/kegiatan/kalender"
            className="inline-flex items-center gap-1.5 bg-purple-800 hover:bg-purple-700 text-amber-300 text-xs font-extrabold px-3.5 py-1.5 rounded-xl border border-purple-600 transition"
          >
            <CalendarIcon size={14} />
            <span>Buka Kalender Kegiatan</span>
          </Link>
        </div>

        <h1 className="text-3xl font-black tracking-tight">Jadwal Kensyu, Pertemuan, & Gongyo MNSBDI</h1>
        <p className="text-purple-200 text-sm max-w-2xl leading-relaxed">
          Ikuti pembacaan Gongyo, penataran Kensyu, dan pertemuan rutin umat. 
          Anda dapat mendaftar mandiri (*Self-Registration*) langsung dari perangkat Anda.
        </p>
      </div>

      {/* Alert Notification */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-extrabold border flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300' 
            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
        }`}>
          <CheckCircle2 size={18} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((ev) => {
          const isRegistered = registeredEventIds.includes(ev.id);
          const isPast = new Date(ev.event_date) < new Date();

          return (
            <div 
              key={ev.id} 
              className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
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

                  {isRegistered && (
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={14} /> Terdaftar (Self)
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">{ev.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ev.description}</p>

                <div className="pt-2 border-t border-purple-100 dark:border-purple-900/60 space-y-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-purple-600 dark:text-purple-400" />
                    <span>{new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-amber-500" />
                    <span>{ev.location}</span>
                  </div>
                </div>
              </div>

              {/* Registration Action */}
              <div className="pt-4 border-t border-purple-100 dark:border-purple-900/60 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">
                  {ev.registrations_count || 0} Umat Terdaftar
                </span>

                {isPast ? (
                  <span className="text-xs text-slate-400 font-bold">Event Selesai</span>
                ) : isRegistered ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-not-allowed"
                  >
                    <UserCheck size={14} />
                    <span>Sudah Terdaftar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelfRegister(ev.id)}
                    disabled={loadingId === ev.id}
                    className="px-5 py-2.5 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs transition shadow-lg flex items-center gap-2 hover:opacity-95 cursor-pointer"
                  >
                    {loadingId === ev.id ? 'Memproses...' : 'Daftar Event (Self)'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
