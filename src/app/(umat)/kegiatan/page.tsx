'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { getEvents, registerForEvent, cancelOwnRegistration, getUserRegisteredEventIds } from '@/lib/actions/vihara-actions';
import { ViharaEvent } from '@/types/database';
import { useToast } from '@/components/ui/ToastNotification';
import { Badge, Button, PageHeader, Panel, StateMessage, buttonClass } from '@/components/ui/kit';

export default function PublicEventCatalogPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [currentUmatId, setCurrentUmatId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadCatalog = async () => {
    try {
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
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleSelfRegister = async (eventId: string) => {
    if (!currentUmatId) {
      setMessage({
        text: 'Buka menu Profil saya dan masuk dengan akun umat dulu, lalu daftar dari halaman ini.',
        type: 'error'
      });
      showToast('Buka Profil saya dulu untuk memilih akun umat Anda.', 'info', 'Perlu akun umat');
      return;
    }

    // Optimistic: show the registration now, roll back if the server rejects it.
    setRegisteredEventIds(prev => [...prev, eventId]);
    showToast('Anda sudah terdaftar di kegiatan ini.', 'success', 'Pendaftaran berhasil');
    setLoadingId(eventId);

    const res = await registerForEvent(eventId, undefined, currentUmatId);
    setLoadingId(null);
    if (res.error) {
      setRegisteredEventIds(prev => prev.filter(id => id !== eventId));
      setMessage({ text: res.error, type: 'error' });
      showToast(res.error, 'error', 'Pendaftaran gagal');
    }
  };

  const handleSelfCancel = async (eventId: string) => {
    if (!currentUmatId) return;

    setRegisteredEventIds(prev => prev.filter(id => id !== eventId));
    showToast('Pendaftaran Anda di kegiatan ini dibatalkan.', 'info', 'Pendaftaran dibatalkan');
    setLoadingId(eventId);

    let failed = false;
    try {
      failed = Boolean((await cancelOwnRegistration(eventId, currentUmatId)).error);
    } catch {
      failed = true;
    }
    if (failed) {
      setRegisteredEventIds(prev => [...prev, eventId]);
      showToast('Pendaftaran belum bisa dibatalkan. Coba lagi.', 'error', 'Gagal');
    }
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kegiatan vihara"
        description="Kensyu, pertemuan rutin, dan Gongyo bersama di Sentra Makassar."
        actions={
          <Link href="/kegiatan/kalender" className={buttonClass('secondary')}>
            <CalendarDays size={16} aria-hidden />
            Lihat kalender
          </Link>
        }
      />

      {message && (
        <p
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`text-sm rounded-lg p-3 ${message.type === 'success' ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger'}`}
        >
          {message.text}
        </p>
      )}

      <Panel>
        {loadState === 'loading' ? (
          <StateMessage kind="loading" title="Memuat daftar kegiatan..." />
        ) : loadState === 'error' ? (
          <StateMessage
            kind="error"
            title="Daftar kegiatan belum bisa dimuat"
            description="Periksa koneksi internet, lalu coba lagi."
            action={<Button onClick={() => { setLoadState('loading'); loadCatalog(); }}>Coba lagi</Button>}
          />
        ) : events.length === 0 ? (
          <StateMessage
            kind="empty"
            title="Belum ada kegiatan"
            description="Kegiatan yang sudah diumumkan pengurus akan muncul di sini."
          />
        ) : (
          <ul className="divide-y divide-line">
            {events.map((ev) => {
              const isRegistered = registeredEventIds.includes(ev.id);
              const isPast = new Date(ev.event_date) < new Date();
              const isBusy = loadingId === ev.id;

              return (
                <li key={ev.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs text-ink-3">
                      {new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {ev.category ? ` · ${ev.category}` : ''}
                    </p>
                    <h2 className="text-base font-semibold text-ink">{ev.title}</h2>
                    <p className="text-sm text-ink-2">{ev.location || 'Lokasi belum diisi'}</p>
                    {ev.description && <p className="text-sm text-ink-2 line-clamp-2">{ev.description}</p>}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {isPast && <Badge>Selesai</Badge>}
                      {isRegistered && <Badge tone="ok">Anda terdaftar</Badge>}
                      {!isPast && !isRegistered && <Badge tone="brand">Pendaftaran dibuka</Badge>}
                      <span className="text-xs text-ink-3 tabular-nums">{ev.registrations_count || 0} umat terdaftar</span>
                    </div>
                  </div>

                  {!isPast && (
                    <div className="shrink-0">
                      {isRegistered ? (
                        <Button variant="danger" onClick={() => handleSelfCancel(ev.id)} disabled={isBusy} className="w-full sm:w-auto">
                          {isBusy ? 'Memproses...' : 'Batalkan pendaftaran'}
                        </Button>
                      ) : (
                        <Button variant="primary" onClick={() => handleSelfRegister(ev.id)} disabled={isBusy} className="w-full sm:w-auto">
                          {isBusy ? 'Memproses...' : 'Daftar'}
                        </Button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
