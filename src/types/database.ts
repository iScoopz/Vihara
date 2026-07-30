export type UserRole = 'umat' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  han?: string;
  cetya?: string;
  sentra?: string;
  bagian?: 'Inspirasi Pria Wanita' | 'Pro-M 40s' | 'Pro-M Progresif' | 'GM' | 'Bintang';
  phone?: string;
  birth_date?: string;
  gender?: 'L' | 'P';
  address?: string;
  emergency_contact?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface CetyaProfile {
  id: string;
  name: string;
  sentra: string;
  address?: string;
  leader_name?: string;
  phone?: string;
  created_at?: string;
}

export interface HanProfile {
  id: string;
  name: string;
  cetya_name: string;
  sentra: string;
  leader_name?: string;
  created_at?: string;
}

export type EventCategory = 'Kensyu' | 'Pertemuan' | 'Gongyo';

export interface SubSectionRole {
  id: string;
  role_name: string;
  pic_name: string;
}

export interface EventOrgStructure {
  ketua_name: string;
  sekretaris_name: string;
  bendahara_name: string;
  pj_acara_name: string;
  pj_umum_name: string;
  sub_acara: SubSectionRole[];
  sub_umum: SubSectionRole[];
  vip_list: string[];
}

export interface EventProposalRundown {
  id: string;
  event_id: string;
  day_date: string;
  time_slot: string;
  activity: string;
  notes?: string;
}

export interface EventSkenarioKerja {
  id: string;
  event_id: string;
  day_phase: string; // e.g. "H-1 (Jumat, 31 Juli 2026)" or "Hari-H (Sabtu, 1 Agustus 2026)"
  time_slot: string; // e.g. "08:00 - 09:30"
  executor_bidang_pj: string; // e.g. "Bidang Acara - Suryani Dewi"
  activity: string; // e.g. "Check Sound System & Set Up Altar"
  interbid_bidang_pj: string; // e.g. "Bidang Umum & Logistik - Budi Santoso"
  notes?: string; // e.g. "Pastikan 4 mic wireless terisi baterai"
}

export interface ViharaEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  quota?: number;
  category?: EventCategory;
  is_complex?: boolean;
  is_published?: boolean;
  pic_name?: string;
  org_structure?: EventOrgStructure;
  created_at?: string;
  registrations_count?: number;
  budgets?: EventBudget[];
  committees?: EventCommittee[];
  proposal_rundowns?: EventProposalRundown[];
  skenario_kerja?: EventSkenarioKerja[];
}

export interface EventRegistration {
  id: string;
  event_id: string;
  profile_id: string;
  registration_method: 'self' | 'admin';
  registered_by?: string;
  is_attended: boolean;
  attended_at?: string;
  created_at?: string;
  profile?: Profile;
}

export interface EventBudget {
  id: string;
  event_id: string;
  item_name: string;
  budget_type: 'rab' | 'realisasi';
  amount: number;
  notes?: string;
}

export interface EventCommittee {
  id: string;
  event_id: string;
  profile_id: string;
  role_title: string;
  section: string;
  profile?: Profile;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  stock_quantity: number;
  price_per_unit: number;
  unit: string;
  last_updated: string;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  item_name: string;
  profile_id?: string;
  buyer_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  transaction_date: string;
  notes?: string;
}

export interface Donation {
  id: string;
  profile_id?: string;
  donor_name: string;
  amount: number;
  donation_type?: 'paramita' | 'operasional' | 'pembangunan' | 'lainnya';
  purpose?: string;
  payment_method?: string;
  donation_date: string;
  notes?: string;
  created_at?: string;
}
