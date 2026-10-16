// Subset of src/types/database.ts in the web app: only what the mobile app reads or writes.

export type UserRole = 'umat' | 'admin';

export type UmatBagian = 'Pria' | 'Wanita' | 'Inspirasi' | 'Pro-M 40s' | 'Pro-M Progresif' | 'GM' | 'Bintang';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email?: string | null;
  han?: string | null;
  cetya?: string | null;
  sentra?: string | null;
  bagian?: UmatBagian | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: 'L' | 'P' | null;
  address?: string | null;
  emergency_contact?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
}

export type EventCategory = 'Kensyu' | 'Pertemuan' | 'Gongyo';

export interface EventExtraFee {
  id: string;
  fee_name: string;
  amount: number;
}

export interface ViharaEvent {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
  end_date?: string | null;
  location: string;
  quota?: number | null;
  category?: EventCategory | null;
  is_complex?: boolean | null;
  is_published?: boolean | null;
  is_completed?: boolean | null;
  pricing_per_bagian?: Record<string, number> | null;
  extra_fees?: EventExtraFee[] | null;
  created_at?: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  profile_id: string;
  registration_method: 'self' | 'admin';
  registered_by?: string | null;
  is_attended: boolean;
  attended_at?: string | null;
  is_paid?: boolean | null;
  paid_at?: string | null;
  amount_paid?: number | null;
  selected_extra_fee_ids?: string[] | null;
  created_at?: string | null;
}

export interface Participant extends EventRegistration {
  profile?: Profile;
}
