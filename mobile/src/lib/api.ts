import { supabase } from './supabase';
import type { EventRegistration, Participant, Profile, ViharaEvent } from './types';

const EVENT_COLUMNS =
  'id,title,description,event_date,end_date,location,quota,category,is_complex,is_published,is_completed,pricing_per_bagian,extra_fees,created_at';

const DIRECTORY_COLUMNS = 'id,role,full_name,email,sentra,cetya,han,bagian,phone,is_active';

export async function fetchEvents(includeDrafts: boolean): Promise<ViharaEvent[]> {
  let query = supabase.from('events').select(EVENT_COLUMNS).order('event_date', { ascending: true });
  // RLS already hides drafts from umat once the migration is applied; filter anyway so the
  // app behaves the same before it is.
  if (!includeDrafts) query = query.eq('is_published', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ViharaEvent[];
}

/** Returns null when the counting RPC does not exist yet: no count is better than a wrong one. */
export async function fetchRegistrationCounts(): Promise<Record<string, number> | null> {
  const { data, error } = await supabase.rpc('event_registration_counts');
  if (error || !Array.isArray(data)) return null;
  const counts: Record<string, number> = {};
  for (const row of data as { event_id: string; total: number | string }[]) counts[row.event_id] = Number(row.total);
  return counts;
}

export async function fetchMyRegistrations(profileId: string): Promise<EventRegistration[]> {
  const { data, error } = await supabase.from('event_registrations').select('*').eq('profile_id', profileId);
  if (error) throw error;
  return (data ?? []) as EventRegistration[];
}

export async function insertSelfRegistration(eventId: string, profileId: string): Promise<EventRegistration> {
  const { data: existing } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
    .maybeSingle();
  if (existing) return existing as EventRegistration;

  const reg: EventRegistration = {
    id: `r_${Date.now()}`,
    event_id: eventId,
    profile_id: profileId,
    registration_method: 'self',
    registered_by: undefined,
    is_attended: false,
    created_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('event_registrations').insert([reg]);
  if (error) throw error;
  return reg;
}

export async function deleteOwnRegistration(eventId: string, profileId: string) {
  const { error } = await supabase.from('event_registrations').delete().eq('event_id', eventId).eq('profile_id', profileId);
  if (error) throw error;
}

export async function fetchParticipants(eventId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const regs = (data ?? []) as EventRegistration[];
  const ids = [...new Set(regs.map((r) => r.profile_id))];
  if (ids.length === 0) return [];
  const { data: profiles, error: profileError } = await supabase.from('profiles').select(DIRECTORY_COLUMNS).in('id', ids);
  if (profileError) throw profileError;
  const byId = new Map((profiles as Profile[]).map((p) => [p.id, p]));
  return regs.map((r) => ({ ...r, profile: byId.get(r.profile_id) }));
}

export async function setAttendance(regId: string, attended: boolean) {
  const { error } = await supabase
    .from('event_registrations')
    .update({ is_attended: attended, attended_at: attended ? new Date().toISOString() : null })
    .eq('id', regId);
  if (error) throw error;
}

export async function setPayment(regId: string, paid: boolean, amount: number) {
  const { error } = await supabase
    .from('event_registrations')
    .update({ is_paid: paid, paid_at: paid ? new Date().toISOString() : null, amount_paid: paid ? amount : 0 })
    .eq('id', regId);
  if (error) throw error;
}

export async function fetchDirectory(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select(DIRECTORY_COLUMNS).order('full_name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export type ContactFields = Pick<Profile, 'phone' | 'address' | 'emergency_contact'>;

/** Only contact fields: role, naungan and email are managed by pengurus on the web. */
export async function updateMyContact(profileId: string, fields: ContactFields) {
  const { error } = await supabase
    .from('profiles')
    .update({ phone: fields.phone, address: fields.address, emergency_contact: fields.emergency_contact })
    .eq('id', profileId);
  if (error) throw error;
}
