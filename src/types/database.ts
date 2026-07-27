export type UserRole = 'admin' | 'umat';
export type BudgetType = 'rab' | 'realisasi';
export type RegMethod = 'self' | 'admin';
export type EventCategory = 'Kensyu' | 'Pertemuan' | 'Gongyo';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  han?: string;            // Hasil Akhir Namaskara
  cetya?: string;          // Cetya bernaung
  phone?: string;
  birth_date?: string;     // YYYY-MM-DD
  gender?: 'L' | 'P';
  address?: string;
  emergency_contact?: string;
  is_active: boolean;
  created_at: string;
}

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
  sub_acara: SubSectionRole[];
  pj_umum_name: string;
  sub_umum: SubSectionRole[];
  vip_list: string[];
}

export interface ViharaEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  category: EventCategory;
  is_complex?: boolean;
  quota?: number;
  pic_profile_id?: string;
  pic_name?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  committees?: EventCommittee[];
  org_structure?: EventOrgStructure;
  budgets?: EventBudget[];
  registrations_count?: number;
}

export interface EventCommittee {
  id: string;
  event_id: string;
  profile_id: string;
  committee_role: string;
  profile_name?: string;
}

export interface EventBudget {
  id: string;
  event_id: string;
  item_name: string;
  budget_type: BudgetType;
  amount: number;
  notes?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  profile_id: string;
  registration_method: RegMethod;
  registered_by?: string;
  is_attended: boolean;
  attended_at?: string;
  created_at: string;
  profile?: Profile;
  event?: ViharaEvent;
}

export interface Donation {
  id: string;
  profile_id?: string;
  donor_name: string;
  amount: number;
  donation_date: string;
  purpose: string;
  payment_method?: 'Transfer Bank' | 'Tunai' | 'QRIS';
  notes?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  stock_quantity: number;
  price_per_unit: number;
  unit: string;
  min_stock_alert: number;
  last_updated: string;
}

export interface InventoryTransaction {
  id: string;
  inventory_id: string;
  item_name?: string;
  profile_id?: string;
  buyer_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  transaction_date: string;
  notes?: string;
}
