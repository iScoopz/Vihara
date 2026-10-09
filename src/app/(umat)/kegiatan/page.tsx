'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Clock, CheckCircle2, UserCheck, Calendar as CalendarIcon, XCircle } from 'lucide-react';
import { getEvents, registerForEvent, cancelRegistration, getUserRegisteredEventIds } from '@/lib/actions/vihara-actions';
import { ViharaEvent } from '@/types/database';
import { useToast } from '@/components/ui/ToastNotification';

export default function PublicEventCatalogPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [currentUmatId, setCurrentUmatId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadCatalog = async () => {
    const data = await getEvents();
    const publishedEvents = data.filter(ev => ev.is_published === true || ev.is_published === undefined);
    setEvents(publishedEvents);

    const savedId = typeof window !== 'undefined' ? localStorage.getItem('vihara_umat_id') : null;
    if (savedId) {
      setCurrentUmatId(savedId);
      const registeredIds = await getUserRegisteredEventIds(savedId);
      setRegisteredEventIds(registeredIds);
    } else {
      setRegisteredEventIds([]);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleSelfRegister = async (eventId: string) => {
    if (!currentUmatId) {
      setMessage({ 
        text: 'Silakan pilih atau login ke akun profil Anda terlebih dahulu di menu Profil Saya untuk mendaftar.', 
        type: 'error' 
      });
      showToast('Silakan buka Profil Saya terlebih dahulu untuk memilih akun Umat Anda.', 'info', 'Perlu Akun Profil');
      return;
    }

    // 1. Instant Optimistic UI Update (0ms)
    setRegisteredEventIds(prev => [...prev, eventId]);
    showToast('Anda telah terdaftar pada event ini.', 'success', 'Pendaftaran Berhasil');
    setLoadingId(eventId);

    // 2. Background Sync
    const res = await registerForEvent(eventId, undefined, currentUmatId);
    setLoadingId(null);
    if (res.error) {
      // Rollback
      setRegisteredEventIds(prev => prev.filter(id => id !== eventId));
      setMessage({ text: res.error, type: 'error' });
      showToast(res.error, 'error', 'Pendaftaran Gagal');
    }
  };

  const handleSelfCancel = async (eventId: string) => {
    if (!currentUmatId) return;

    // 1. Instant Optimistic UI Update (0ms)
    setRegisteredEventIds(prev => prev.filter(id => id !== eventId));
    showToast('Pendaftaran Anda pada event ini berhasil dibatalkan.', 'info', 'Pembatalan Event');
    setLoadingId(eventId);

    // 2. Background Sync
    try {
      await cancelRegistration(eventId);
    } catch (e) {
      // Rollback
      setRegisteredEventIds(prev => [...prev, eventId]);
      showToast('Gagal membatalkan pendaftaran.', 'error', 'Galat');
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Apple-style Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
            Jadwal & Agenda Umat
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Katalog Kegiatan Vihara
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] dark:text-[#a1a1a6]">
            Jadwal pelaksanaan Kensyu, pertemuan rutin, dan pembacaan Gongyo bersama Sentra Makassar.
          </p>
        </div>

        <Link
          href="/kegiatan/kalender"
          className="inline-flex items-center gap-2 bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.14] text-neutral-900 dark:text-white text-xs font-semibold px-4 py-2 rounded-full border border-black/[0.06] dark:border-white/[0.08] transition-all shrink-0 w-fit"
        >
          <CalendarIcon size={14} className="text-[#86868b]" />
          <span>Kalender Lengkap</span>
        </Link>
      </div>

      {/* Alert Notification */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-medium border flex items-center gap-2.5 ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20'
        }`}>
          <CheckCircle2 size={16} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Events Grid (Apple-style Bento Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {events.map((ev) => {
          const isRegistered = registeredEventIds.includes(ev.id);
          const isPast = new Date(ev.event_date) < new Date();

          return (
            <div 
              key={ev.id} 
              className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs hover:border-black/15 dark:hover:border-white/20 transition-all duration-200 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${
                    ev.category === 'Kensyu' 
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' :
                    ev.category === 'Pertemuan' 
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' :
                      'bg-purple-500/10 text-[#5e35b1] dark:text-purple-300 border-purple-500/20'
                  }`}>
                    {ev.category || 'Gongyo'}
                  </span>

                  {isRegistered && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <CheckCircle2 size={13} /> Terdaftar (Self)
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white leading-snug">
                  {ev.title}
                </h2>
                <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] leading-relaxed">
                  {ev.description}
                </p>

                <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.06] space-y-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#86868b]" />
                    <span>{new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#86868b]" />
                    <span>{ev.location}</span>
                  </div>
                </div>
              </div>

              {/* Registration Action */}
              <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-[#86868b] font-medium">
                  {ev.registrations_count || 0} Umat Terdaftar
                </span>

                {isPast ? (
                  <span className="text-xs text-[#86868b] font-semibold">Event Selesai</span>
                ) : isRegistered ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                      <UserCheck size={13} />
                      <span>Terdaftar</span>
                    </span>
                    <button
                      onClick={() => handleSelfCancel(ev.id)}
                      disabled={loadingId === ev.id}
                      className="px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 cursor-pointer transition-all"
                    >
                      {loadingId === ev.id ? 'Memproses...' : 'Batal Daftar'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelfRegister(ev.id)}
                    disabled={loadingId === ev.id}
                    className="px-5 py-2 rounded-full bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
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
