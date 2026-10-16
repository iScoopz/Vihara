import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { deleteOwnRegistration, fetchEvents, fetchMyRegistrations, fetchRegistrationCounts, insertSelfRegistration } from '@/lib/api';
import { friendlyDataError } from '@/lib/errors';
import { canSelfRegister } from '@/lib/events';
import type { EventRegistration, ViharaEvent } from '@/lib/types';

import { useAuth } from './auth';

type Status = 'loading' | 'ready' | 'error';

type EventsState = {
  status: Status;
  error: string | null;
  events: ViharaEvent[];
  /** null when the counting RPC is not available. */
  counts: Record<string, number> | null;
  myRegs: Record<string, EventRegistration>;
  refreshing: boolean;
  reload: () => Promise<void>;
  register: (event: ViharaEvent) => Promise<{ error?: string }>;
  cancel: (event: ViharaEvent) => Promise<{ error?: string }>;
  pending: Record<string, boolean>;
};

const EventsContext = createContext<EventsState | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const { profile, isAdmin, initializing } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [myRegs, setMyRegs] = useState<Record<string, EventRegistration>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const loadId = useRef(0);

  const profileId = profile?.id;

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const id = ++loadId.current;
      if (mode === 'refresh') setRefreshing(true);
      else setStatus('loading');
      try {
        const [evs, cnt, regs] = await Promise.all([
          fetchEvents(isAdmin),
          fetchRegistrationCounts(),
          profileId ? fetchMyRegistrations(profileId) : Promise.resolve([] as EventRegistration[]),
        ]);
        if (id !== loadId.current) return;
        setEvents(evs);
        setCounts(cnt);
        setMyRegs(Object.fromEntries(regs.map((r) => [r.event_id, r])));
        setError(null);
        setStatus('ready');
      } catch (e) {
        if (id !== loadId.current) return;
        setError(friendlyDataError(e as { message?: string }));
        // Keep showing data that is already on screen after a failed refresh.
        setStatus((s) => (mode === 'refresh' && s === 'ready' ? 'ready' : 'error'));
      } finally {
        if (id === loadId.current) setRefreshing(false);
      }
    },
    [isAdmin, profileId],
  );

  useEffect(() => {
    if (initializing) return;
    load('initial');
  }, [initializing, load]);

  const reload = useCallback(() => load('refresh'), [load]);

  const bumpCount = (eventId: string, delta: number) =>
    setCounts((c) => (c ? { ...c, [eventId]: Math.max(0, (c[eventId] ?? 0) + delta) } : c));

  const register = useCallback(
    async (event: ViharaEvent) => {
      if (!profileId) return { error: 'Masuk terlebih dahulu untuk mendaftar.' };
      if (!canSelfRegister(event)) return { error: 'Pendaftaran untuk kegiatan ini sudah ditutup.' };
      if (myRegs[event.id]) return {};
      const optimistic: EventRegistration = {
        id: `pending_${event.id}`,
        event_id: event.id,
        profile_id: profileId,
        registration_method: 'self',
        is_attended: false,
        created_at: new Date().toISOString(),
      };
      setPending((p) => ({ ...p, [event.id]: true }));
      setMyRegs((m) => ({ ...m, [event.id]: optimistic }));
      bumpCount(event.id, 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      try {
        const saved = await insertSelfRegistration(event.id, profileId);
        setMyRegs((m) => ({ ...m, [event.id]: saved }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        return {};
      } catch (e) {
        setMyRegs((m) => {
          const next = { ...m };
          delete next[event.id];
          return next;
        });
        bumpCount(event.id, -1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        return { error: `Pendaftaran gagal. ${friendlyDataError(e as { message?: string })}` };
      } finally {
        setPending((p) => ({ ...p, [event.id]: false }));
      }
    },
    [profileId, myRegs],
  );

  const cancel = useCallback(
    async (event: ViharaEvent) => {
      if (!profileId) return { error: 'Masuk terlebih dahulu.' };
      const previous = myRegs[event.id];
      if (!previous) return {};
      setPending((p) => ({ ...p, [event.id]: true }));
      setMyRegs((m) => {
        const next = { ...m };
        delete next[event.id];
        return next;
      });
      bumpCount(event.id, -1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      try {
        await deleteOwnRegistration(event.id, profileId);
        return {};
      } catch (e) {
        setMyRegs((m) => ({ ...m, [event.id]: previous }));
        bumpCount(event.id, 1);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        return { error: `Pembatalan gagal. ${friendlyDataError(e as { message?: string })}` };
      } finally {
        setPending((p) => ({ ...p, [event.id]: false }));
      }
    },
    [profileId, myRegs],
  );

  const value = useMemo<EventsState>(
    () => ({ status, error, events, counts, myRegs, refreshing, reload, register, cancel, pending }),
    [status, error, events, counts, myRegs, refreshing, reload, register, cancel, pending],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
