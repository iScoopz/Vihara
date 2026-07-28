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
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
}

// SENTRA, CETYA, HAN ACTIONS
export async function getSentras(): Promise<string[]> {
  return [...INITIAL_SENTRAS];
}

export async function getCetyas(): Promise<CetyaProfile[]> {
  return [...cetyasStore];
}

export async function addCetya(cetya: Omit<CetyaProfile, 'id' | 'created_at'>) {
  const newCetya: CetyaProfile = {
    ...cetya,
    id: `cetya_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  cetyasStore.push(newCetya);
  revalidatePath('/umat');
  return { success: true, cetya: newCetya };
}

export async function updateCetya(id: string, data: Partial<Omit<CetyaProfile, 'id' | 'created_at'>>) {
  const index = cetyasStore.findIndex(c => c.id === id);
  if (index === -1) return { error: 'Cetya tidak ditemukan' };

  cetyasStore[index] = { ...cetyasStore[index], ...data };
  revalidatePath('/umat');
  return { success: true, cetya: cetyasStore[index] };
}

export async function deleteCetya(id: string) {
  cetyasStore = cetyasStore.filter(c => c.id !== id);
  revalidatePath('/umat');
  return { success: true };
}

export async function getHans(): Promise<HanProfile[]> {
  return [...hansStore];
}

export async function addHan(han: Omit<HanProfile, 'id' | 'created_at'>) {
  const newHan: HanProfile = {
    ...han,
    id: `han_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  hansStore.push(newHan);
  revalidatePath('/umat');
  return { success: true, han: newHan };
}

export async function updateHan(id: string, data: Partial<Omit<HanProfile, 'id' | 'created_at'>>) {
  const index = hansStore.findIndex(h => h.id === id);
  if (index === -1) return { error: 'HAN tidak ditemukan' };

  hansStore[index] = { ...hansStore[index], ...data };
  revalidatePath('/umat');
  return { success: true, han: hansStore[index] };
}

export async function deleteHan(id: string) {
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
      if (!error && data) return data;
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

  registrationsStore.push(newReg);

  revalidatePath('/events');
  revalidatePath('/kegiatan');
  revalidatePath('/profil');

  return { success: true, registration: newReg };
}

export async function getInventory(): Promise<InventoryItem[]> {
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

  transactionsStore.unshift(transaction);

  revalidatePath('/inventory');
  return { success: true, transaction, remainingStock: item.stock_quantity };
}

export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  return [...transactionsStore];
}

export async function updateStockQuantity(itemId: string, delta: number) {
  const item = inventoryStore.find(i => i.id === itemId);
  if (item) {
    item.stock_quantity = Math.max(0, item.stock_quantity + delta);
    item.last_updated = new Date().toISOString();
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
  inventoryStore.unshift(newItem);
  revalidatePath('/inventory');
  return { success: true, item: newItem };
}

export async function getDonations(): Promise<Donation[]> {
  return [...donationsStore];
}

export async function addDonation(donation: Omit<Donation, 'id' | 'created_at'>) {
  const newDonation: Donation = {
    ...donation,
    id: `d_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  donationsStore.unshift(newDonation);
  revalidatePath('/donations');
  return { success: true, donation: newDonation };
}

export async function getProfiles(): Promise<Profile[]> {
  return [...profilesStore];
}

export async function addProfile(profile: Omit<Profile, 'id' | 'created_at'>) {
  const newProfile: Profile = {
    ...profile,
    id: `p_${Date.now()}`,
    created_at: new Date().toISOString()
  };
  profilesStore.push(newProfile);
  revalidatePath('/umat');
  return { success: true, profile: newProfile };
}

export async function updateProfile(id: string, updatedData: Partial<Omit<Profile, 'id' | 'created_at'>>) {
  const index = profilesStore.findIndex(p => p.id === id);
  if (index === -1) return { error: 'Data umat tidak ditemukan.' };

  profilesStore[index] = {
    ...profilesStore[index],
    ...updatedData
  };

  revalidatePath('/umat');
  revalidatePath('/profil');
  revalidatePath('/dashboard');
  revalidatePath('/calendar');

  return { success: true, profile: profilesStore[index] };
}

export async function deleteProfile(id: string) {
  profilesStore = profilesStore.filter(p => p.id !== id);
  revalidatePath('/umat');
  return { success: true };
}

export async function getEvents(): Promise<ViharaEvent[]> {
  return eventsStore.map(ev => ({
    ...ev,
    registrations_count: registrationsStore.filter(r => r.event_id === ev.id).length,
    budgets: budgetsStore.filter(b => b.event_id === ev.id),
    committees: committeesStore.filter(c => c.event_id === ev.id),
    org_structure: ev.org_structure || (ev.is_complex ? INITIAL_ORG_STRUCTURE : undefined)
  }));
}

export async function getEventById(id: string): Promise<ViharaEvent | null> {
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

  revalidatePath(`/events/${eventId}`);
  return { success: true, subSection: newSub };
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

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function addBudgetItem(budget: Omit<EventBudget, 'id'>) {
  const newBudget: EventBudget = {
    ...budget,
    id: `b_${Date.now()}`
  };
  budgetsStore.push(newBudget);
  revalidatePath('/events');
  return { success: true, budget: newBudget };
}

export async function getRegistrationsForEvent(eventId: string) {
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
  }
  revalidatePath('/events');
  return { success: true, is_attended: reg?.is_attended };
}
