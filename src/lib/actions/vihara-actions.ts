'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { 
  INITIAL_PROFILES, 
  INITIAL_EVENTS, 
  INITIAL_INVENTORY, 
  INITIAL_DONATIONS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_BUDGETS,
  INITIAL_COMMITTEES,
  INITIAL_TRANSACTIONS,
  INITIAL_ORG_STRUCTURE,
  INITIAL_SENTRAS,
  INITIAL_CETYAS,
  INITIAL_HANS
} from '@/lib/mock-data';
import { 
  Profile, 
  ViharaEvent, 
  InventoryItem, 
  Donation, 
  EventRegistration, 
  EventBudget, 
  EventCommittee, 
  InventoryTransaction, 
  EventOrgStructure, 
  SubSectionRole,
  CetyaProfile,
  HanProfile
} from '@/types/database';

let profilesStore = [...INITIAL_PROFILES];
let eventsStore = [...INITIAL_EVENTS];
let inventoryStore = [...INITIAL_INVENTORY];
let donationsStore = [...INITIAL_DONATIONS];
let registrationsStore = [...INITIAL_REGISTRATIONS];
let budgetsStore = [...INITIAL_BUDGETS];
let committeesStore = [...INITIAL_COMMITTEES];
let transactionsStore = [...INITIAL_TRANSACTIONS];
let cetyasStore = [...INITIAL_CETYAS];
let hansStore = [...INITIAL_HANS];

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// SENTRA, CETYA, HAN ACTIONS
export async function getSentras(): Promise<string[]> {
  return [...INITIAL_SENTRAS];
}

export async function getCetyas(): Promise<CetyaProfile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('cetyas').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return [...cetyasStore];
}

export async function addCetya(cetya: Omit<CetyaProfile, 'id' | 'created_at'>) {
  const newCetya: CetyaProfile = {
    ...cetya,
    id: `cetya_${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('cetyas').insert([newCetya]);
    } catch (e) {}
  }

  cetyasStore.push(newCetya);
  revalidatePath('/umat');
  return { success: true, cetya: newCetya };
}

export async function updateCetya(id: string, data: Partial<Omit<CetyaProfile, 'id' | 'created_at'>>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('cetyas').update(data).eq('id', id);
    } catch (e) {}
  }

  const index = cetyasStore.findIndex(c => c.id === id);
  if (index !== -1) {
    cetyasStore[index] = { ...cetyasStore[index], ...data };
  }
  revalidatePath('/umat');
  return { success: true, cetya: cetyasStore[index] };
}

export async function deleteCetya(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('cetyas').delete().eq('id', id);
    } catch (e) {}
  }

  cetyasStore = cetyasStore.filter(c => c.id !== id);
  revalidatePath('/umat');
  return { success: true };
}

export async function getHans(): Promise<HanProfile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('hans').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return [...hansStore];
}

export async function addHan(han: Omit<HanProfile, 'id' | 'created_at'>) {
  const newHan: HanProfile = {
    ...han,
    id: `han_${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('hans').insert([newHan]);
    } catch (e) {}
  }

  hansStore.push(newHan);
  revalidatePath('/umat');
  return { success: true, han: newHan };
}

export async function updateHan(id: string, data: Partial<Omit<HanProfile, 'id' | 'created_at'>>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('hans').update(data).eq('id', id);
    } catch (e) {}
  }

  const index = hansStore.findIndex(h => h.id === id);
  if (index !== -1) {
    hansStore[index] = { ...hansStore[index], ...data };
  }
  revalidatePath('/umat');
  return { success: true, han: hansStore[index] };
}

export async function deleteHan(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('hans').delete().eq('id', id);
    } catch (e) {}
  }

  hansStore = hansStore.filter(h => h.id !== id);
  revalidatePath('/umat');
  return { success: true };
}

export async function getUpcomingBirthdays(targetMonth?: number): Promise<Profile[]> {
  const currentMonth = targetMonth || (new Date().getMonth() + 1);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc('get_birthdays_by_month', { target_month: currentMonth });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }

  return profilesStore.filter((profile) => {
    if (!profile.birth_date || !profile.is_active) return false;
    const parts = profile.birth_date.split('-');
    if (parts.length < 2) return false;
    const month = parseInt(parts[1], 10);
    return month === currentMonth;
  });
}

export async function registerForEvent(eventId: string, targetUmatId?: string, currentUserId: string = 'p2') {
  let profileToRegister = currentUserId;
  let regMethod: 'self' | 'admin' = 'self';
  let registeredBy: string | undefined = undefined;

  if (targetUmatId && targetUmatId !== currentUserId) {
    const adminUser = profilesStore.find(p => p.id === currentUserId);
    if (adminUser?.role !== 'admin') {
      return { error: 'Unauthorized: Hanya admin yang dapat mendaftarkan umat lain.' };
    }
    profileToRegister = targetUmatId;
    regMethod = 'admin';
    registeredBy = currentUserId;
  }

  const existing = registrationsStore.find(
    r => r.event_id === eventId && r.profile_id === profileToRegister
  );
  if (existing) {
    return { error: 'Umat ini sudah terdaftar pada event ini.' };
  }

  const newReg: EventRegistration = {
    id: `r_${Date.now()}`,
    event_id: eventId,
    profile_id: profileToRegister,
    registration_method: regMethod,
    registered_by: registeredBy,
    is_attended: false,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('event_registrations').insert([newReg]);
    } catch (e) {}
  }

  registrationsStore.push(newReg);

  revalidatePath('/events');
  revalidatePath('/kegiatan');
  revalidatePath('/profil');

  return { success: true, registration: newReg };
}

export async function getInventory(): Promise<InventoryItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('inventory').select('*').order('last_updated', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return [...inventoryStore];
}

export async function recordInventoryPurchase(
  inventoryId: string, 
  quantity: number, 
  buyerName: string, 
  profileId?: string, 
  notes?: string
) {
  const item = inventoryStore.find(i => i.id === inventoryId);
  if (!item) return { error: 'Barang tidak ditemukan.' };
  if (item.stock_quantity < quantity) {
    return { error: `Stok tidak mencukupi. Sisa stok: ${item.stock_quantity} ${item.unit}` };
  }

  item.stock_quantity -= quantity;
  item.last_updated = new Date().toISOString();

  const totalPrice = quantity * item.price_per_unit;

  const transaction: InventoryTransaction = {
    id: `t_${Date.now()}`,
    inventory_id: inventoryId,
    item_name: item.item_name,
    profile_id: profileId,
    buyer_name: buyerName,
    quantity,
    unit_price: item.price_per_unit,
    total_price: totalPrice,
    transaction_date: new Date().toISOString(),
    notes
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('inventory').update({ stock_quantity: item.stock_quantity, last_updated: item.last_updated }).eq('id', inventoryId);
      await supabase.from('inventory_transactions').insert([transaction]);
    } catch (e) {}
  }

  transactionsStore.unshift(transaction);

  revalidatePath('/inventory');
  return { success: true, transaction, remainingStock: item.stock_quantity };
}

export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('inventory_transactions').select('*').order('transaction_date', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return [...transactionsStore];
}

export async function updateStockQuantity(itemId: string, delta: number) {
  const item = inventoryStore.find(i => i.id === itemId);
  if (item) {
    item.stock_quantity = Math.max(0, item.stock_quantity + delta);
    item.last_updated = new Date().toISOString();

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await supabase.from('inventory').update({ stock_quantity: item.stock_quantity, last_updated: item.last_updated }).eq('id', itemId);
      } catch (e) {}
    }
  }
  revalidatePath('/inventory');
  return { success: true, newQuantity: item?.stock_quantity };
}

export async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'last_updated'>) {
  const newItem: InventoryItem = {
    ...item,
    id: `inv_${Date.now()}`,
    last_updated: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('inventory').insert([newItem]);
    } catch (e) {}
  }

  inventoryStore.unshift(newItem);
  revalidatePath('/inventory');
  return { success: true, item: newItem };
}

export async function getDonations(): Promise<Donation[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return [...donationsStore];
}

export async function addDonation(donation: Omit<Donation, 'id' | 'created_at'>) {
  const newDonation: Donation = {
    ...donation,
    id: `d_${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('donations').insert([newDonation]);
    } catch (e) {}
  }

  donationsStore.unshift(newDonation);
  revalidatePath('/donations');
  return { success: true, donation: newDonation };
}

export async function getProfiles(): Promise<Profile[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {}
  }
  return [...profilesStore];
}

export async function addProfile(profile: Omit<Profile, 'id' | 'created_at'>) {
  const newProfile: Profile = {
    ...profile,
    id: `p_${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('profiles').insert([newProfile]);
    } catch (e) {}
  }

  profilesStore.push(newProfile);
  revalidatePath('/umat');
  return { success: true, profile: newProfile };
}

export async function updateProfile(id: string, updatedData: Partial<Omit<Profile, 'id' | 'created_at'>>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('profiles').update(updatedData).eq('id', id);
    } catch (e) {}
  }

  const index = profilesStore.findIndex(p => p.id === id);
  if (index !== -1) {
    profilesStore[index] = {
      ...profilesStore[index],
      ...updatedData
    };
  }

  revalidatePath('/umat');
  revalidatePath('/profil');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');

  return { success: true, profile: profilesStore[index] };
}

export async function deleteProfile(id: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('profiles').delete().eq('id', id);
    } catch (e) {}
  }

  profilesStore = profilesStore.filter(p => p.id !== id);
  revalidatePath('/umat');
  return { success: true };
}

export async function getEvents(): Promise<ViharaEvent[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(ev => ({
          ...ev,
          registrations_count: registrationsStore.filter(r => r.event_id === ev.id).length,
          budgets: budgetsStore.filter(b => b.event_id === ev.id),
          committees: committeesStore.filter(c => c.event_id === ev.id)
        }));
      }
    } catch (e) {}
  }

  return eventsStore.map(ev => ({
    ...ev,
    registrations_count: registrationsStore.filter(r => r.event_id === ev.id).length,
    budgets: budgetsStore.filter(b => b.event_id === ev.id),
    committees: committeesStore.filter(c => c.event_id === ev.id),
    org_structure: ev.org_structure || (ev.is_complex ? INITIAL_ORG_STRUCTURE : undefined)
  }));
}

export async function getEventById(id: string): Promise<ViharaEvent | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (!error && data) {
        return {
          ...data,
          registrations_count: registrationsStore.filter(r => r.event_id === id).length,
          budgets: budgetsStore.filter(b => b.event_id === id),
          committees: committeesStore.filter(c => c.event_id === id)
        };
      }
    } catch (e) {}
  }

  const ev = eventsStore.find(e => e.id === id);
  if (!ev) return null;

  return {
    ...ev,
    registrations_count: registrationsStore.filter(r => r.event_id === id).length,
    budgets: budgetsStore.filter(b => b.event_id === id),
    committees: committeesStore.filter(c => c.event_id === id),
    org_structure: ev.org_structure || (ev.is_complex ? INITIAL_ORG_STRUCTURE : undefined)
  };
}

export async function createEvent(eventData: Omit<ViharaEvent, 'id' | 'created_at'>) {
  const newEvent: ViharaEvent = {
    ...eventData,
    id: `e_${Date.now()}`,
    created_at: new Date().toISOString(),
    org_structure: eventData.org_structure || (eventData.is_complex ? INITIAL_ORG_STRUCTURE : undefined)
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('events').insert([newEvent]);
    } catch (e) {}
  }

  eventsStore.unshift(newEvent);
  revalidatePath('/events');
  revalidatePath('/kegiatan');
  return { success: true, event: newEvent };
}

export async function addSubSectionToOrg(eventId: string, sectionType: 'sub_acara' | 'sub_umum', roleName: string, picName: string) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (!ev) return { error: 'Event tidak ditemukan' };

  if (!ev.org_structure) {
    ev.org_structure = JSON.parse(JSON.stringify(INITIAL_ORG_STRUCTURE));
  }

  const org = ev.org_structure;
  if (!org) return { error: 'Org structure Error' };

  const newSub: SubSectionRole = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    role_name: roleName,
    pic_name: picName
  };

  if (sectionType === 'sub_acara') {
    if (!org.sub_acara) org.sub_acara = [];
    org.sub_acara.push(newSub);
  } else {
    if (!org.sub_umum) org.sub_umum = [];
    org.sub_umum.push(newSub);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('events').update({ org_structure: org }).eq('id', eventId);
    } catch (e) {}
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true, subSection: newSub };
}

export async function updateSubSectionInOrg(
  eventId: string,
  sectionType: 'sub_acara' | 'sub_umum',
  subId: string,
  roleName: string,
  picName: string
) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (!ev || !ev.org_structure) return { error: 'Event tidak ditemukan' };

  const org = ev.org_structure;
  const list = sectionType === 'sub_acara' ? org.sub_acara : org.sub_umum;
  if (list) {
    const item = list.find(s => s.id === subId);
    if (item) {
      item.role_name = roleName;
      item.pic_name = picName;
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('events').update({ org_structure: org }).eq('id', eventId);
    } catch (e) {}
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function deleteSubSectionFromOrg(eventId: string, sectionType: 'sub_acara' | 'sub_umum', subId: string) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (!ev || !ev.org_structure) return { error: 'Event tidak ditemukan' };

  const org = ev.org_structure;

  if (sectionType === 'sub_acara') {
    if (org.sub_acara) {
      org.sub_acara = org.sub_acara.filter(s => s.id !== subId);
    }
  } else {
    if (org.sub_umum) {
      org.sub_umum = org.sub_umum.filter(s => s.id !== subId);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('events').update({ org_structure: org }).eq('id', eventId);
    } catch (e) {}
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function addBudgetItem(budget: Omit<EventBudget, 'id'>) {
  const newBudget: EventBudget = {
    ...budget,
    id: `b_${Date.now()}`
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from('event_budgets').insert([newBudget]);
    } catch (e) {}
  }

  budgetsStore.push(newBudget);
  revalidatePath('/events');
  return { success: true, budget: newBudget };
}

export async function getRegistrationsForEvent(eventId: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('event_registrations').select('*').eq('event_id', eventId);
      if (!error && data && data.length > 0) {
        return data.map(r => ({
          ...r,
          profile: profilesStore.find(p => p.id === r.profile_id)
        }));
      }
    } catch (e) {}
  }

  return registrationsStore
    .filter(r => r.event_id === eventId)
    .map(r => ({
      ...r,
      profile: profilesStore.find(p => p.id === r.profile_id)
    }));
}

export async function toggleAttendance(registrationId: string) {
  const reg = registrationsStore.find(r => r.id === registrationId);
  if (reg) {
    reg.is_attended = !reg.is_attended;
    reg.attended_at = reg.is_attended ? new Date().toISOString() : undefined;

    if (isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await supabase.from('event_registrations').update({ is_attended: reg.is_attended, attended_at: reg.attended_at }).eq('id', registrationId);
      } catch (e) {}
    }
  }
  revalidatePath('/events');
  return { success: true, is_attended: reg?.is_attended };
}
