'use server'

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
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
import { PUBLIC_EVENTS_TAG } from '@/lib/public-events';
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
  EventSkenarioKerja,
  EventExtraFee,
  CoreCommittee
} from '@/types/database';

let profilesStore = [...INITIAL_PROFILES];
const eventsStore = [...INITIAL_EVENTS];
const inventoryStore = [...INITIAL_INVENTORY];
const donationsStore = [...INITIAL_DONATIONS];
let registrationsStore = [...INITIAL_REGISTRATIONS];
let budgetsStore = [...INITIAL_BUDGETS];
const committeesStore = [...INITIAL_COMMITTEES];
const transactionsStore = [...INITIAL_TRANSACTIONS];
let cetyasStore = [...INITIAL_CETYAS];
let hansStore = [...INITIAL_HANS];

// The public landing page caches upcoming events; expire it whenever their visibility changes.
function refreshLandingEvents() {
  revalidateTag(PUBLIC_EVENTS_TAG, { expire: 0 });
  revalidatePath('/');
}

// A new real event starts with an empty committee; demo names belong only to the mock data.
const emptyOrgStructure = (): EventOrgStructure => ({
  ketua_name: '',
  sekretaris_name: '',
  bendahara_name: '',
  pj_acara_name: '',
  pj_umum_name: '',
  sub_acara: [],
  sub_umum: [],
  vip_list: []
});

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// UNIFIED SINGLE-PASS BUNDLE FETCHERS (Reduces 4-5 HTTP POST requests down to 1 single request)
export async function getUmatPageBundle() {
  const [profilesList, sentrasList, cetyasList, hansList] = await Promise.all([
    getProfiles(),
    getSentras(),
    getCetyas(),
    getHans()
  ]);
  return {
    profiles: profilesList,
    sentras: sentrasList,
    cetyas: cetyasList,
    hans: hansList
  };
}

export async function getEventDetailPageBundle(eventId: string) {
  // Profiles are fetched once and reused for the registration join.
  const [eventObj, rawRegs, profilesList] = await Promise.all([
    getEventById(eventId),
    fetchRawRegistrations(eventId),
    getProfiles()
  ]);
  const byId = new Map(profilesList.map(p => [p.id, p]));
  return {
    event: eventObj,
    registrations: rawRegs.map(r => ({ ...r, profile: byId.get(r.profile_id) })),
    profiles: profilesList
  };
}

async function fetchRawRegistrations(eventId: string): Promise<EventRegistration[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Supabase fetchRawRegistrations error:', error);
      } else if (data) {
        return data;
      }
    } catch (e) {
      console.error('fetchRawRegistrations exception:', e);
    }
  }
  return registrationsStore
    .filter(r => r.event_id === eventId)
    .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
}

export async function getDashboardPageBundle() {
  const [eventsList, profilesList, donationsList, inventoryList] = await Promise.all([
    getEvents(),
    getProfiles(),
    getDonations(),
    getInventory()
  ]);
  return {
    events: eventsList,
    profiles: profilesList,
    donations: donationsList,
    inventory: inventoryList
  };
}

export async function getInventoryPageBundle() {
  const [inventoryList, transactionsList, profilesList] = await Promise.all([
    getInventory(),
    getInventoryTransactions(),
    getProfiles()
  ]);
  return {
    inventory: inventoryList,
    transactions: transactionsList,
    profiles: profilesList
  };
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
      } else if (data) {
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
      } else if (data) {
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
      } else if (data) {
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

export async function registerForEvent(eventId: string, targetUmatId?: string, currentUserId?: string) {
  let profileToRegister = currentUserId || '';
  let regMethod: 'self' | 'admin' = 'self';
  let registeredBy: string | undefined = undefined;

  if (!targetUmatId && !currentUserId) {
    return { error: 'Masuk sebagai umat terlebih dahulu untuk mendaftar.' };
  }

  if (targetUmatId) {
    profileToRegister = targetUmatId;
    regMethod = 'admin';
    registeredBy = currentUserId;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      // 1. Directly check Supabase database if profile is already registered for this event
      const { data: dbExisting } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('profile_id', profileToRegister)
        .maybeSingle();

      if (dbExisting) {
        return { error: 'Umat ini sudah terdaftar pada event ini.' };
      }

      // 2. Prepare new registration object
      const newReg: EventRegistration = {
        id: `r_${Date.now()}`,
        event_id: eventId,
        profile_id: profileToRegister,
        registration_method: regMethod,
        registered_by: registeredBy,
        is_attended: false,
        created_at: new Date().toISOString()
      };

      // 3. Insert into Supabase DB and verify clean insertion
      const { error } = await supabase.from('event_registrations').insert([newReg]);
      if (error) {
        console.error('Supabase registerForEvent error:', error);
        if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
          return { error: 'Umat ini sudah terdaftar pada event ini.' };
        }
        return { error: `Gagal mendaftarkan umat: ${error.message}` };
      }

      // Keep in-memory store in sync if present
      const inMemIdx = registrationsStore.findIndex(
        r => r.event_id === eventId && r.profile_id === profileToRegister
      );
      if (inMemIdx === -1) {
        registrationsStore.push(newReg);
      }

      revalidatePath('/events');
      revalidatePath(`/events/${eventId}`);
      revalidatePath('/kegiatan');
      revalidatePath('/profil');

      return { success: true, registration: newReg };
    } catch (e: any) {
      console.error('registerForEvent exception:', e);
      return { error: `Terjadi kesalahan server: ${e?.message || e}` };
    }
  }

  // Fallback for mock data when Supabase is not configured
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
  revalidatePath(`/events/${eventId}`);
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
      } else if (data) {
        return data;
      }
    } catch (e) {
      console.error('getInventory exception:', e);
    }
  }
  return [...inventoryStore];
}

// Reads the item from the database when available; items added in another
// server instance are not in the in-memory store.
async function findInventoryItem(itemId: string): Promise<InventoryItem | undefined> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('inventory').select('*').eq('id', itemId).single();
      if (!error && data) return data;
    } catch (e) {
      console.error('findInventoryItem exception:', e);
    }
  }
  return inventoryStore.find(i => i.id === itemId);
}

function syncInventoryStore(item: InventoryItem) {
  const idx = inventoryStore.findIndex(i => i.id === item.id);
  if (idx !== -1) inventoryStore[idx] = item;
}

export async function recordInventoryPurchase(
  inventoryId: string, 
  quantity: number, 
  buyerName: string, 
  profileId?: string, 
  notes?: string
) {
  const found = await findInventoryItem(inventoryId);
  if (!found) return { error: 'Barang tidak ditemukan.' };
  if (found.stock_quantity < quantity) {
    return { error: `Stok tidak mencukupi. Sisa stok: ${found.stock_quantity} ${found.unit}` };
  }

  const item: InventoryItem = {
    ...found,
    stock_quantity: found.stock_quantity - quantity,
    last_updated: new Date().toISOString()
  };

  const transaction: InventoryTransaction = {
    id: `t_${Date.now()}`,
    inventory_id: inventoryId,
    item_name: item.item_name,
    profile_id: profileId,
    buyer_name: buyerName,
    quantity,
    unit_price: item.price_per_unit,
    total_price: quantity * item.price_per_unit,
    transaction_date: new Date().toISOString(),
    notes
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [stockRes, trxRes] = await Promise.all([
        supabase.from('inventory').update({ stock_quantity: item.stock_quantity, last_updated: item.last_updated }).eq('id', inventoryId),
        supabase.from('inventory_transactions').insert([transaction])
      ]);
      if (stockRes.error || trxRes.error) {
        console.error('Supabase recordInventoryPurchase error:', stockRes.error || trxRes.error);
        return { error: 'Transaksi gagal disimpan ke database.' };
      }
    } catch (e) {
      console.error('recordInventoryPurchase exception:', e);
      return { error: 'Transaksi gagal disimpan ke database.' };
    }
  }

  syncInventoryStore(item);
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
      } else if (data) {
        return data;
      }
    } catch (e) {
      console.error('getInventoryTransactions exception:', e);
    }
  }
  return [...transactionsStore];
}

export async function updateStockQuantity(itemId: string, delta: number) {
  const found = await findInventoryItem(itemId);
  if (!found) return { error: 'Barang tidak ditemukan.' };

  const item: InventoryItem = {
    ...found,
    stock_quantity: Math.max(0, found.stock_quantity + delta),
    last_updated: new Date().toISOString()
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('inventory').update({ stock_quantity: item.stock_quantity, last_updated: item.last_updated }).eq('id', itemId);
      if (error) {
        console.error('Supabase updateStockQuantity error:', error);
        return { error: 'Gagal memperbarui stok.' };
      }
    } catch (e) {
      console.error('updateStockQuantity exception:', e);
      return { error: 'Gagal memperbarui stok.' };
    }
  }

  syncInventoryStore(item);
  revalidatePath('/inventory');
  return { success: true, newQuantity: item.stock_quantity };
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
      } else if (data) {
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
      } else if (data) {
        return data;
      }
    } catch (e) {
      console.error('getProfiles exception:', e);
    }
  }
  return [...profilesStore];
}

export async function getProfileById(id: string): Promise<Profile | null> {
  if (!id) return null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (error) {
        console.error('Supabase getProfileById error:', error);
      } else {
        return data;
      }
    } catch (e) {
      console.error('getProfileById exception:', e);
    }
  }
  return profilesStore.find(p => p.id === id) || null;
}

// Looks up one profile on the server so the login pages never download the whole umat list.
export async function findLoginProfile(query: string, mode: 'admin' | 'umat' | 'umat-by-name'): Promise<Profile | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const profs = await getProfiles();
  if (mode === 'admin') {
    return profs.find(p => p.role === 'admin' && p.email?.toLowerCase() === q)
      || (q === 'admin@vihara.or.id' ? profs.find(p => p.role === 'admin') || null : null);
  }
  return profs.find(p =>
    (p.email && p.email.toLowerCase() === q) ||
    (p.han && p.han.toLowerCase() === q) ||
    (mode === 'umat-by-name' && p.full_name && p.full_name.toLowerCase() === q)
  ) || null;
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
  revalidatePath('/dashboard');
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
  revalidatePath('/dashboard');
  return { success: true };
}

export async function getEvents(): Promise<ViharaEvent[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [eventsRes, regsRes, budgetRes] = await Promise.all([
        supabase.from('events').select('*').order('event_date', { ascending: true }),
        supabase.from('event_registrations').select('event_id'),
        supabase.from('event_budgets').select('*')
      ]);

      if (eventsRes.data) {
        const dbBudgets: EventBudget[] = budgetRes.data || [];

        // Count and group once instead of filtering the full lists per event.
        const regCounts = new Map<string, number>();
        for (const r of regsRes.data || []) {
          regCounts.set(r.event_id, (regCounts.get(r.event_id) || 0) + 1);
        }
        const budgetsByEvent = new Map<string, EventBudget[]>();
        for (const b of dbBudgets) {
          const list = budgetsByEvent.get(b.event_id);
          if (list) list.push(b);
          else budgetsByEvent.set(b.event_id, [b]);
        }

        return eventsRes.data.map(ev => ({
          ...ev,
          registrations_count: regCounts.get(ev.id) || 0,
          budgets: budgetsByEvent.get(ev.id) || [],
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
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [eventRes, prRes, skRes, regRes, budgetRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('event_proposal_rundowns').select('*').eq('event_id', id),
        supabase.from('event_skenario_kerja').select('*').eq('event_id', id),
        supabase.from('event_registrations').select('id', { count: 'exact', head: true }).eq('event_id', id),
        supabase.from('event_budgets').select('*').eq('event_id', id)
      ]);

      if (eventRes.data) {
        const evData = eventRes.data;

        return {
          ...evData,
          registrations_count: regRes.count || 0,
          budgets: budgetRes.data || [],
          committees: committeesStore.filter(c => c.event_id === id),
          proposal_rundowns: prRes.data && prRes.data.length > 0 ? prRes.data : (evData.proposal_rundowns || []),
          skenario_kerja: skRes.data && skRes.data.length > 0 ? skRes.data : (evData.skenario_kerja || [])
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
    is_published: eventData.is_published ?? false,
    created_at: new Date().toISOString(),
    org_structure: eventData.org_structure || (eventData.is_complex ? emptyOrgStructure() : undefined)
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
  revalidatePath('/dashboard');
  revalidatePath('/kegiatan');
  refreshLandingEvents();
  return { success: true, event: newEvent };
}

export async function togglePublishEvent(eventId: string) {
  const ev = eventsStore.find(e => e.id === eventId);
  let currentPublishStatus = ev?.is_published ?? false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: dbEv } = await supabase.from('events').select('is_published').eq('id', eventId).single();
      if (dbEv) {
        currentPublishStatus = dbEv.is_published ?? false;
      }
      const newStatus = !currentPublishStatus;
      const { error } = await supabase.from('events').update({ is_published: newStatus }).eq('id', eventId);
      if (error) console.error('Supabase togglePublishEvent error:', error);
      if (ev) ev.is_published = newStatus;

      revalidatePath('/events');
      revalidatePath(`/events/${eventId}`);
      revalidatePath('/dashboard');
      revalidatePath('/kegiatan');
      refreshLandingEvents();
      return { success: true, is_published: newStatus };
    } catch (e) {
      console.error('togglePublishEvent exception:', e);
    }
  }

  if (ev) {
    ev.is_published = !ev.is_published;
  }

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/dashboard');
  revalidatePath('/kegiatan');
  refreshLandingEvents();
  return { success: true, is_published: ev?.is_published };
}

export async function toggleCompleteEvent(eventId: string) {
  const ev = eventsStore.find(e => e.id === eventId);
  let currentCompleteStatus = ev?.is_completed ?? false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: dbEv } = await supabase.from('events').select('is_completed').eq('id', eventId).single();
      if (dbEv) {
        currentCompleteStatus = dbEv.is_completed ?? false;
      }
      const newStatus = !currentCompleteStatus;
      const { error } = await supabase.from('events').update({ is_completed: newStatus }).eq('id', eventId);
      if (error) console.error('Supabase toggleCompleteEvent error:', error);
      if (ev) ev.is_completed = newStatus;

      revalidatePath('/events');
      revalidatePath(`/events/${eventId}`);
      revalidatePath('/dashboard');
      revalidatePath('/kegiatan');
      refreshLandingEvents();
      return { success: true, is_completed: newStatus };
    } catch (e) {
      console.error('toggleCompleteEvent exception:', e);
    }
  }

  if (ev) {
    ev.is_completed = !ev.is_completed;
  }

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/dashboard');
  revalidatePath('/kegiatan');
  refreshLandingEvents();
  return { success: true, is_completed: ev?.is_completed };
}

export async function updateEventPricing(
  eventId: string,
  pricingPerBagian: Record<string, number>,
  extraFees: EventExtraFee[]
) {
  const ev = eventsStore.find(e => e.id === eventId);
  if (ev) {
    ev.pricing_per_bagian = pricingPerBagian;
    ev.extra_fees = extraFees;
  }

  // Events created in the database are not in the in-memory store,
  // so the database write must not depend on it.
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('events')
        .update({
          pricing_per_bagian: pricingPerBagian,
          extra_fees: extraFees
        })
        .eq('id', eventId);
      if (error) {
        console.error('Supabase updateEventPricing error:', error);
        return { error: 'Gagal menyimpan tarif event.' };
      }
    } catch (e) {
      console.error('updateEventPricing exception:', e);
      return { error: 'Gagal menyimpan tarif event.' };
    }
  }

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  return { success: true, event: ev };
}

// Reads the current org structure from the database when available, so edits
// apply to events that only exist there (not in the in-memory mock store).
async function loadOrgStructure(eventId: string): Promise<EventOrgStructure | null> {
  const ev = eventsStore.find(e => e.id === eventId);
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.from('events').select('org_structure').eq('id', eventId).single();
      if (!error && data) {
        return (data.org_structure as EventOrgStructure | null) || emptyOrgStructure();
      }
    } catch (e) {
      console.error('loadOrgStructure exception:', e);
    }
  }
  if (!ev) return null;
  return ev.org_structure || JSON.parse(JSON.stringify(INITIAL_ORG_STRUCTURE));
}

async function saveOrgStructure(eventId: string, org: EventOrgStructure): Promise<{ success?: boolean; error?: string }> {
  const ev = eventsStore.find(e => e.id === eventId);
  if (ev) ev.org_structure = org;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('events').update({ org_structure: org }).eq('id', eventId);
      if (error) {
        console.error('Supabase saveOrgStructure error:', error);
        return { error: 'Gagal menyimpan struktur panitia.' };
      }
    } catch (e) {
      console.error('saveOrgStructure exception:', e);
      return { error: 'Gagal menyimpan struktur panitia.' };
    }
  }

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

// Updates the core committee and guests while keeping the sub-sections as they are.
export async function updateCoreCommittee(eventId: string, core: CoreCommittee): Promise<{ error?: string; org_structure?: EventOrgStructure }> {
  const org = await loadOrgStructure(eventId);
  if (!org) return { error: 'Event tidak ditemukan' };

  const clean = (v: string) => v.trim();
  const next: EventOrgStructure = {
    ...org,
    ketua_name: clean(core.ketua_name),
    sekretaris_name: clean(core.sekretaris_name),
    bendahara_name: clean(core.bendahara_name),
    pj_acara_name: clean(core.pj_acara_name),
    pj_umum_name: clean(core.pj_umum_name),
    vip_list: core.vip_list.map(clean).filter(Boolean)
  };

  const res = await saveOrgStructure(eventId, next);
  return res.error ? { error: res.error } : { org_structure: next };
}

export async function addSubSectionToOrg(eventId: string, sectionType: 'sub_acara' | 'sub_umum', roleName: string, picName: string) {
  const org = await loadOrgStructure(eventId);
  if (!org) return { error: 'Event tidak ditemukan' };

  const newSub: SubSectionRole = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    role_name: roleName,
    pic_name: picName
  };
  org[sectionType] = [...(org[sectionType] || []), newSub];

  const res = await saveOrgStructure(eventId, org);
  return res.error ? res : { success: true, subSection: newSub };
}

export async function updateSubSectionInOrg(
  eventId: string,
  sectionType: 'sub_acara' | 'sub_umum',
  subId: string,
  roleName: string,
  picName: string
) {
  const org = await loadOrgStructure(eventId);
  if (!org) return { error: 'Event tidak ditemukan' };

  org[sectionType] = (org[sectionType] || []).map(s =>
    s.id === subId ? { ...s, role_name: roleName, pic_name: picName } : s
  );
  return saveOrgStructure(eventId, org);
}

export async function deleteSubSectionFromOrg(eventId: string, sectionType: 'sub_acara' | 'sub_umum', subId: string) {
  const org = await loadOrgStructure(eventId);
  if (!org) return { error: 'Event tidak ditemukan' };

  org[sectionType] = (org[sectionType] || []).filter(s => s.id !== subId);
  return saveOrgStructure(eventId, org);
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

export async function deleteBudgetItem(id: string, eventId?: string) {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_budgets').delete().eq('id', id);
      if (error) console.error('Supabase deleteBudgetItem error:', error);
    } catch (e) {
      console.error('deleteBudgetItem exception:', e);
    }
  }

  budgetsStore = budgetsStore.filter(b => b.id !== id);
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
  }
  revalidatePath('/events');
  return { success: true };
}

export async function deleteBudgetItems(ids: string[], eventId?: string) {
  if (!ids || ids.length === 0) return { success: true };
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from('event_budgets').delete().in('id', ids);
      if (error) console.error('Supabase deleteBudgetItems error:', error);
    } catch (e) {
      console.error('deleteBudgetItems exception:', e);
    }
  }

  budgetsStore = budgetsStore.filter(b => !ids.includes(b.id));
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
  }
  revalidatePath('/events');
  return { success: true };
}

export async function updateGroupedBudget(
  eventId: string, 
  data: {
    itemName: string;
    rabId?: string;
    rabAmount: number;
    realisasiId?: string;
    realisasiAmount: number;
    pemasukanId?: string;
    pemasukanAmount: number;
  }
) {
  const cleanName = data.itemName.trim();

  const syncType = async (id?: string, type?: 'rab' | 'realisasi' | 'pemasukan', amount: number = 0) => {
    if (!type) return;
    if (id && amount > 0) {
      const existing = budgetsStore.find(b => b.id === id);
      if (existing) {
        existing.item_name = cleanName;
        existing.amount = amount;
      }
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          await supabase.from('event_budgets').update({ item_name: cleanName, amount }).eq('id', id);
        } catch (e) {}
      }
    } else if (id && amount === 0) {
      budgetsStore = budgetsStore.filter(b => b.id !== id);
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          await supabase.from('event_budgets').delete().eq('id', id);
        } catch (e) {}
      }
    } else if (!id && amount > 0) {
      const newB: EventBudget = {
        id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        event_id: eventId,
        item_name: cleanName,
        budget_type: type,
        amount
      };
      budgetsStore.push(newB);
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          await supabase.from('event_budgets').insert([newB]);
        } catch (e) {}
      }
    }
  };

  await Promise.all([
    syncType(data.rabId, 'rab', data.rabAmount),
    syncType(data.realisasiId, 'realisasi', data.realisasiAmount),
    syncType(data.pemasukanId, 'pemasukan', data.pemasukanAmount)
  ]);

  if (eventId) {
    revalidatePath(`/events/${eventId}`);
  }
  revalidatePath('/events');
  return { success: true };
}

export async function getRegistrationsForEvent(eventId: string) {
  const regs = await fetchRawRegistrations(eventId);
  if (regs.length === 0) return [];

  let profilesList: Profile[] = profilesStore;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      // Only the registered profiles, not the whole umat table.
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', regs.map(r => r.profile_id));
      if (data) profilesList = data;
    } catch (e) {
      console.error('getRegistrationsForEvent exception:', e);
    }
  }

  const byId = new Map(profilesList.map(p => [p.id, p]));
  return regs.map(r => ({ ...r, profile: byId.get(r.profile_id) }));
}

export async function getUserRegisteredEventIds(profileId: string): Promise<string[]> {
  if (!profileId) return [];
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('profile_id', profileId);
      if (data && !error) {
        return data.map(r => r.event_id);
      }
    } catch (e) {
      console.error('getUserRegisteredEventIds exception:', e);
    }
  }
  return registrationsStore
    .filter(r => r.profile_id === profileId)
    .map(r => r.event_id);
}

export async function getUserRegistrationHistory(profileId: string): Promise<{ event: ViharaEvent; method: string; isAttended: boolean }[]> {
  if (!profileId) return [];
  const [eventsList, userRegs] = await Promise.all([
    getEvents(),
    (async () => {
      if (isSupabaseConfigured()) {
        try {
          const supabase = await createClient();
          const { data } = await supabase
            .from('event_registrations')
            .select('*')
            .eq('profile_id', profileId);
          if (data) return data;
        } catch (e) {
          console.error('getUserRegistrationHistory exception:', e);
        }
      }
      return registrationsStore.filter(r => r.profile_id === profileId);
    })()
  ]);

  const history: { event: ViharaEvent; method: string; isAttended: boolean }[] = [];
  for (const reg of userRegs) {
    const ev = eventsList.find(e => e.id === reg.event_id);
    if (ev) {
      history.push({
        event: ev,
        method: reg.registration_method,
        isAttended: reg.is_attended
      });
    }
  }
  return history;
}

// The umat portal only knows the event and the umat, not the registration id.
export async function cancelOwnRegistration(eventId: string, profileId: string) {
  if (!eventId || !profileId) return { error: 'Data pendaftaran tidak lengkap.' };

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('profile_id', profileId);
      if (error) {
        console.error('Supabase cancelOwnRegistration error:', error);
        return { error: 'Pendaftaran belum bisa dibatalkan.' };
      }
    } catch (e) {
      console.error('cancelOwnRegistration exception:', e);
      return { error: 'Pendaftaran belum bisa dibatalkan.' };
    }
  }

  registrationsStore = registrationsStore.filter(r => !(r.event_id === eventId && r.profile_id === profileId));

  revalidatePath('/events');
  revalidatePath(`/events/${eventId}`);
  revalidatePath('/kegiatan');
  revalidatePath('/profil');
  return { success: true };
}

export async function cancelRegistration(registrationId: string) {
  let eventId = '';
  const reg = registrationsStore.find(r => r.id === registrationId);
  if (reg) eventId = reg.event_id;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      if (!eventId) {
        const { data: dbReg } = await supabase.from('event_registrations').select('event_id').eq('id', registrationId).single();
        if (dbReg) eventId = dbReg.event_id;
      }
      const { error } = await supabase.from('event_registrations').delete().eq('id', registrationId);
      if (error) console.error('Supabase cancelRegistration error:', error);
    } catch (e) {
      console.error('cancelRegistration exception:', e);
    }
  }

  registrationsStore = registrationsStore.filter(r => r.id !== registrationId);

  revalidatePath('/events');
  if (eventId) revalidatePath(`/events/${eventId}`);
  revalidatePath('/kegiatan');
  revalidatePath('/profil');
  return { success: true };
}

export async function toggleAttendance(registrationId: string) {
  const reg = registrationsStore.find(r => r.id === registrationId);
  let currentAttended = reg?.is_attended ?? false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: dbReg } = await supabase.from('event_registrations').select('is_attended').eq('id', registrationId).single();
      if (dbReg) {
        currentAttended = dbReg.is_attended ?? false;
      }
      const newAttended = !currentAttended;
      const attendedAt = newAttended ? new Date().toISOString() : null;
      const { error } = await supabase.from('event_registrations').update({ is_attended: newAttended, attended_at: attendedAt }).eq('id', registrationId);
      if (error) console.error('Supabase toggleAttendance error:', error);
      if (reg) {
        reg.is_attended = newAttended;
        reg.attended_at = attendedAt || undefined;
      }
      revalidatePath('/events');
      return { success: true, is_attended: newAttended };
    } catch (e) {
      console.error('toggleAttendance exception:', e);
    }
  }

  if (reg) {
    reg.is_attended = !reg.is_attended;
    reg.attended_at = reg.is_attended ? new Date().toISOString() : undefined;
  }
  revalidatePath('/events');
  return { success: true, is_attended: reg?.is_attended };
}

export async function toggleRegistrationPayment(registrationId: string, amount?: number) {
  const reg = registrationsStore.find(r => r.id === registrationId);
  let currentPaid = reg?.is_paid ?? false;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: dbReg } = await supabase.from('event_registrations').select('is_paid').eq('id', registrationId).single();
      if (dbReg) {
        currentPaid = dbReg.is_paid ?? false;
      }
      const newPaid = !currentPaid;
      const paidAt = newPaid ? new Date().toISOString() : null;
      const amountPaid = newPaid ? (amount !== undefined ? amount : (reg?.amount_paid || 0)) : 0;

      const { error } = await supabase.from('event_registrations').update({ 
        is_paid: newPaid, 
        paid_at: paidAt,
        amount_paid: amountPaid
      }).eq('id', registrationId);

      if (error) console.error('Supabase toggleRegistrationPayment error:', error);
      if (reg) {
        reg.is_paid = newPaid;
        reg.paid_at = paidAt || undefined;
        reg.amount_paid = amountPaid;
      }
      revalidatePath('/events');
      return { success: true, is_paid: newPaid };
    } catch (e) {
      console.error('toggleRegistrationPayment exception:', e);
    }
  }

  if (reg) {
    reg.is_paid = !reg.is_paid;
    reg.paid_at = reg.is_paid ? new Date().toISOString() : undefined;
    if (amount !== undefined) {
      reg.amount_paid = reg.is_paid ? amount : 0;
    }
  }
  revalidatePath('/events');
  return { success: true, is_paid: reg?.is_paid };
}

export async function updateRegistrationExtraFees(registrationId: string, feeIds: string[], calculatedTotalAmount?: number) {
  const reg = registrationsStore.find(r => r.id === registrationId);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const newAmount = calculatedTotalAmount !== undefined ? calculatedTotalAmount : (reg?.amount_paid || 0);
      const { error } = await supabase
        .from('event_registrations')
        .update({ 
          selected_extra_fee_ids: feeIds,
          amount_paid: newAmount
        })
        .eq('id', registrationId);

      if (error) console.error('Supabase updateRegistrationExtraFees error:', error);
      if (reg) {
        reg.selected_extra_fee_ids = feeIds;
        if (reg.is_paid && calculatedTotalAmount !== undefined) {
          reg.amount_paid = calculatedTotalAmount;
        }
      }
      revalidatePath('/events');
      return { success: true, selected_extra_fee_ids: feeIds };
    } catch (e) {
      console.error('updateRegistrationExtraFees exception:', e);
    }
  }

  if (reg) {
    reg.selected_extra_fee_ids = feeIds;
    if (reg.is_paid && calculatedTotalAmount !== undefined) {
      reg.amount_paid = calculatedTotalAmount;
    }
  }

  revalidatePath('/events');
  return { success: true, selected_extra_fee_ids: reg?.selected_extra_fee_ids };
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
