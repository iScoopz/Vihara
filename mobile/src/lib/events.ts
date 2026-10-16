import type { EventRegistration, Profile, ViharaEvent } from './types';

export const CATEGORIES = ['Kensyu', 'Pertemuan', 'Gongyo'] as const;

/** An event is over once its end (or its start, if it has no end) has passed. */
export function isPast(event: ViharaEvent, now = Date.now()) {
  const end = new Date(event.end_date || event.event_date).getTime();
  return end < now;
}

export function isFinished(event: ViharaEvent, now = Date.now()) {
  return Boolean(event.is_completed) || isPast(event, now);
}

/** Same conditions as the RLS insert policy, plus the time check the web applies. */
export function canSelfRegister(event: ViharaEvent, now = Date.now()) {
  return Boolean(event.is_published) && !event.is_completed && !isPast(event, now);
}

export function isFull(event: ViharaEvent, count: number | undefined) {
  return typeof count === 'number' && typeof event.quota === 'number' && event.quota > 0 && count >= event.quota;
}

/** Upcoming first (soonest on top), finished events after (most recent on top). */
export function sortForList(events: ViharaEvent[], now = Date.now()) {
  const upcoming = events.filter((e) => !isFinished(e, now)).sort((a, b) => +new Date(a.event_date) - +new Date(b.event_date));
  const past = events.filter((e) => isFinished(e, now)).sort((a, b) => +new Date(b.event_date) - +new Date(a.event_date));
  return { upcoming, past };
}

/** Fee rule from EventPresensiTab: base by bagian (default Inspirasi) plus the selected extra fees. */
export function feeFor(event: ViharaEvent, profile: Pick<Profile, 'bagian'> | undefined, reg?: Pick<EventRegistration, 'selected_extra_fee_ids'>) {
  const pricing = event.pricing_per_bagian || {};
  const bagian = profile?.bagian || 'Inspirasi';
  const base = Number(pricing[bagian] || 0);
  const selected = reg?.selected_extra_fee_ids || [];
  const extra = (event.extra_fees || []).filter((f) => selected.includes(f.id)).reduce((sum, f) => sum + Number(f.amount || 0), 0);
  return base + extra;
}

export function hasPricing(event: ViharaEvent) {
  return Object.values(event.pricing_per_bagian || {}).some((v) => Number(v) > 0);
}
