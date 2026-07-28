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
  HanProfile,
  EventProposalRundown,
  EventSkenarioKerja
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
      if (error) {
        console.error('Supabase getCetyas error:', error);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('getCetyas exception:', e);
    }
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
      const { error } = await supabase.from('cetyas').insert([newCetya]);
      if (error) console.error('Supabase addCetya error:', error);
    } catch (e) {
      console.error('addCetya exception:', e);
    }
  }

  cetyasStore.push(newCetya);
  revalidatePath('/umat');
  return { success: true, cetya: newCetya };
}

export async function updateCetya(id: string, data: Partial<Omit<CetyaProfile, 'id' | 'created_at'>>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('cetyas').update(data).eq('id', id);
      if (error) console.error('Supabase updateCetya error:', error);
    } catch (e) {
      console.error('updateCetya exception:', e);
    }
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
      const { error } = await supabase.from('cetyas').delete().eq('id', id);
      if (error) console.error('Supabase deleteCetya error:', error);
    } catch (e) {
      console.error('deleteCetya exception:', e);
    }
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
      if (error) {
        console.error('Supabase getHans error:', error);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('getHans exception:', e);
    }
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
      const { error } = await supabase.from('hans').insert([newHan]);
      if (error) console.error('Supabase addHan error:', error);
    } catch (e) {
      console.error('addHan exception:', e);
    }
  }

  hansStore.push(newHan);
  revalidatePath('/umat');
  return { success: true, han: newHan };
}

export async function updateHan(id: string, data: Partial<Omit<HanProfile, 'id' | 'created_at'>>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('hans').update(data).eq('id', id);
      if (error) console.error('Supabase updateHan error:', error);
    } catch (e) {
      console.error('updateHan exception:', e);
    }
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
      const { error } = await supabase.from('hans').delete().eq('id', id);
      if (error) console.error('Supabase deleteHan error:', error);
    } catch (e) {
      console.error('deleteHan exception:', e);
    }
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
      if (error) {
        console.error('Supabase getUpcomingBirthdays rpc error:', error);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('getUpcomingBirthdays exception:', e);
    }
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
      const { error } = await supabase.from('event_registrations').insert([newReg]);
      if (error) console.error('Supabase registerForEvent error:', error);
    } catch (e) {
      console.error('registerForEvent exception:', e);
    }
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
      if (error) {
        console.error('Supabase getInventory error:', error);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('getInventory exception:', e);
    }
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
    } catch (e) {
      console.error('recordInventoryPurchase exception:', e);
    }
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
      if (error) {
        console.error('Supabase getInventoryTransactions error:', error);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('getInventoryTransactions exception:', e);
    }
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
      } catch (e) {
        console.error('updateStockQuantity exception:', e);
      }
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
      const { error } = await supabase.from('inventory').insert([newItem]);
      if (error) console.error('Supabase addInventoryItem error:', error);
    } catch (e) {
      console.error('addInventoryItem exception:', e);
    }
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
      if (error) {
        console.error('Supabase getDonations error:', error);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('getDonations exception:', e);
    }
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
      const { error } = await supabase.from('donations').insert([newDonation]);
      if (error) console.error('Supabase addDonation error:', error);
    } catch (e) {
      console.error('addDonation exception:', e);
    }
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
      if (error) {
        console.error('Supabase getProfiles error:', error);
      } else if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.error('getProfiles exception:', e);
    }
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
      const { error } = await supabase.from('profiles').insert([newProfile]);
      if (error) console.error('Supabase addProfile error:', error);
    } catch (e) {
      console.error('addProfile exception:', e);
    }
  }

  profilesStore.push(newProfile);
  revalidatePath('/umat');
  return { success: true, profile: newProfile };
}

export async function updateProfile(id: string, updatedData: Partial<Omit<Profile, 'id' | 'created_at'>>) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('profiles').update(updatedData).eq('id', id);
      if (error) console.error('Supabase updateProfile error:', error);
    } catch (e) {
      console.error('updateProfile exception:', e);
    }
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
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) console.error('Supabase deleteProfile error:', error);
    } catch (e) {
      console.error('deleteProfile exception:', e);
    }
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
      if (error) {
        console.error('Supabase getEvents error:', error);
      } else if (data && data.length > 0) {
        return data.map(ev => ({
          ...ev,
          registrations_count: registrationsStore.filter(r => r.event_id === ev.id).length,
          budgets: budgetsStore.filter(b => b.event_id === ev.id),
          committees: committeesStore.filter(c => c.event_id === ev.id)
        }));
      }
    } catch (e) {
      console.error('getEvents exception:', e);
    }
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
  let proposalRundowns: EventProposalRundown[] = [];
  let skenarioKerja: EventSkenarioKerja[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) {
        console.error('Supabase getEventById error:', error);
      } else if (data) {
        const { data: prData } = await supabase.from('event_proposal_rundowns').select('*').eq('event_id', id);
        const { data: skData } = await supabase.from('event_skenario_kerja').select('*').eq('event_id', id);
        return {
          ...data,
          registrations_count: registrationsStore.filter(r => r.event_id === id).length,
          budgets: budgetsStore.filter(b => b.event_id === id),
          committees: committeesStore.filter(c => c.event_id === id),
          proposal_rundowns: prData && prData.length > 0 ? prData : (data.proposal_rundowns || []),
          skenario_kerja: skData && skData.length > 0 ? skData : (data.skenario_kerja || [])
        };
      }
    } catch (e) {
      console.error('getEventById exception:', e);
    }
  }

  const ev = eventsStore.find(e => e.id === id);
  if (!ev) return null;

  return {
    ...ev,
    registrations_count: registrationsStore.filter(r => r.event_id === id).length,
    budgets: budgetsStore.filter(b => b.event_id === id),
    committees: committeesStore.filter(c => c.event_id === id),
    org_structure: ev.org_structure || (ev.is_complex ? INITIAL_ORG_STRUCTURE : undefined),
    proposal_rundowns: ev.proposal_rundowns || [],
    skenario_kerja: ev.skenario_kerja || []
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
      const { error } = await supabase.from('events').insert([newEvent]);
      if (error) console.error('Supabase createEvent error:', error);
    } catch (e) {
      console.error('createEvent exception:', e);
    }
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
      const { error } = await supabase.from('events').update({ org_structure: org }).eq('id', eventId);
      if (error) console.error('Supabase addSubSectionToOrg error:', error);
    } catch (e) {
      console.error('addSubSectionToOrg exception:', e);
    }
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
      const { error } = await supabase.from('events').update({ org_structure: org }).eq('id', eventId);
      if (error) console.error('Supabase updateSubSectionInOrg error:', error);
    } catch (e) {
      console.error('updateSubSectionInOrg exception:', e);
    }
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
      const { error } = await supabase.from('events').update({ org_structure: org }).eq('id', eventId);
      if (error) console.error('Supabase deleteSubSectionFromOrg error:', error);
    } catch (e) {
      console.error('deleteSubSectionFromOrg exception:', e);
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_budgets').insert([newBudget]);
      if (error) console.error('Supabase addBudgetItem error:', error);
    } catch (e) {
      console.error('addBudgetItem exception:', e);
    }
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
      if (error) {
        console.error('Supabase getRegistrationsForEvent error:', error);
      } else if (data && data.length > 0) {
        return data.map(r => ({
          ...r,
          profile: profilesStore.find(p => p.id === r.profile_id)
        }));
      }
    } catch (e) {
      console.error('getRegistrationsForEvent exception:', e);
    }
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
        const { error } = await supabase.from('event_registrations').update({ is_attended: reg.is_attended, attended_at: reg.attended_at }).eq('id', registrationId);
        if (error) console.error('Supabase toggleAttendance error:', error);
      } catch (e) {
        console.error('toggleAttendance exception:', e);
      }
    }
  }
  revalidatePath('/events');
  return { success: true, is_attended: reg?.is_attended };
}

// PROPOSAL RUNDOWN ACTIONS
export async function addProposalRundown(eventId: string, item: Omit<EventProposalRundown, 'id' | 'event_id'>) {
  const newItem: EventProposalRundown = {
    ...item,
    id: `pr_${Date.now()}`,
    event_id: eventId
  };

  const ev = eventsStore.find(e => e.id === eventId);
  if (ev) {
    if (!ev.proposal_rundowns) ev.proposal_rundowns = [];
    ev.proposal_rundowns.push(newItem);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_proposal_rundowns').insert([newItem]);
      if (error) console.error('Supabase addProposalRundown error:', error);
    } catch (e) {
      console.error('addProposalRundown exception:', e);
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true, item: newItem };
}

export async function updateProposalRundown(eventId: string, itemId: string, itemData: Partial<Omit<EventProposalRundown, 'id' | 'event_id'>>) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (ev && ev.proposal_rundowns) {
    const idx = ev.proposal_rundowns.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      ev.proposal_rundowns[idx] = { ...ev.proposal_rundowns[idx], ...itemData };
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_proposal_rundowns').update(itemData).eq('id', itemId);
      if (error) console.error('Supabase updateProposalRundown error:', error);
    } catch (e) {
      console.error('updateProposalRundown exception:', e);
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function deleteProposalRundown(eventId: string, itemId: string) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (ev && ev.proposal_rundowns) {
    ev.proposal_rundowns = ev.proposal_rundowns.filter(i => i.id !== itemId);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_proposal_rundowns').delete().eq('id', itemId);
      if (error) console.error('Supabase deleteProposalRundown error:', error);
    } catch (e) {
      console.error('deleteProposalRundown exception:', e);
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

// SKENARIO KERJA ACTIONS
export async function addSkenarioKerja(eventId: string, item: Omit<EventSkenarioKerja, 'id' | 'event_id'>) {
  const newItem: EventSkenarioKerja = {
    ...item,
    id: `sk_${Date.now()}`,
    event_id: eventId
  };

  const ev = eventsStore.find(e => e.id === eventId);
  if (ev) {
    if (!ev.skenario_kerja) ev.skenario_kerja = [];
    ev.skenario_kerja.push(newItem);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_skenario_kerja').insert([newItem]);
      if (error) console.error('Supabase addSkenarioKerja error:', error);
    } catch (e) {
      console.error('addSkenarioKerja exception:', e);
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true, item: newItem };
}

export async function updateSkenarioKerja(eventId: string, itemId: string, itemData: Partial<Omit<EventSkenarioKerja, 'id' | 'event_id'>>) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (ev && ev.skenario_kerja) {
    const idx = ev.skenario_kerja.findIndex(i => i.id === itemId);
    if (idx !== -1) {
      ev.skenario_kerja[idx] = { ...ev.skenario_kerja[idx], ...itemData };
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_skenario_kerja').update(itemData).eq('id', itemId);
      if (error) console.error('Supabase updateSkenarioKerja error:', error);
    } catch (e) {
      console.error('updateSkenarioKerja exception:', e);
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function deleteSkenarioKerja(eventId: string, itemId: string) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (ev && ev.skenario_kerja) {
    ev.skenario_kerja = ev.skenario_kerja.filter(i => i.id !== itemId);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_skenario_kerja').delete().eq('id', itemId);
      if (error) console.error('Supabase deleteSkenarioKerja error:', error);
    } catch (e) {
      console.error('deleteSkenarioKerja exception:', e);
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}
