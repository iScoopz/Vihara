import { Profile, ViharaEvent, InventoryItem, Donation, EventRegistration, EventBudget, EventCommittee, InventoryTransaction, EventOrgStructure } from '@/types/database';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'p1',
    role: 'admin',
    full_name: 'Upasaka Hendra Kurniawan',
    han: 'HAN-Jakarta-01',
    cetya: 'Cetya Avalokitesvara',
    phone: '081234567890',
    birth_date: '1985-07-15',
    gender: 'L',
    address: 'Jl. Pluit Kencana No. 12, Jakarta Utara',
    emergency_contact: '081299887766 (Istri)',
    is_active: true,
    created_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'p2',
    role: 'umat',
    full_name: 'Suryani Dewi',
    han: 'HAN-Jakarta-02',
    cetya: 'Cetya Maitreya',
    phone: '081987654321',
    birth_date: '1992-07-28',
    gender: 'P',
    address: 'Jl. Sunter Agung Barat 5 No. 8, Jakarta Utara',
    emergency_contact: '081911223344 (Suami)',
    is_active: true,
    created_at: '2024-02-15T09:30:00Z',
  },
  {
    id: 'p3',
    role: 'umat',
    full_name: 'Budi Santoso',
    han: 'HAN-Jakarta-01',
    cetya: 'Cetya Avalokitesvara',
    phone: '081311223344',
    birth_date: '1990-11-12',
    gender: 'L',
    address: 'Jl. Jelambar Utama No. 45, Jakarta Barat',
    is_active: true,
    created_at: '2024-03-01T10:15:00Z',
  },
  {
    id: 'p4',
    role: 'umat',
    full_name: 'Lani Wijaya',
    han: 'HAN-Tangerang-01',
    cetya: 'Cetya Buddha Gaya',
    phone: '081555667788',
    birth_date: '1998-07-04',
    gender: 'P',
    address: 'Gading Serpong Cluster Bovinia No. 15, Tangerang',
    is_active: true,
    created_at: '2024-04-12T14:20:00Z',
  },
  {
    id: 'p5',
    role: 'umat',
    full_name: 'Kevin Tan',
    han: 'HAN-Jakarta-02',
    cetya: 'Cetya Maitreya',
    phone: '081777889900',
    birth_date: '2001-03-22',
    gender: 'L',
    address: 'Jl. Boulevard Kelapa Gading No. 88, Jakarta Utara',
    is_active: true,
    created_at: '2024-05-05T11:00:00Z',
  },
];

export const INITIAL_ORG_STRUCTURE: EventOrgStructure = {
  ketua_name: 'Upasaka Hendra Kurniawan',
  sekretaris_name: 'Suryani Dewi',
  bendahara_name: 'Budi Santoso',
  pj_acara_name: 'Suryani Dewi',
  sub_acara: [
    { id: 'sub_a1', role_name: 'Seksi Ritual Gongyo & Daimoku', pic_name: 'Suryani Dewi' },
    { id: 'sub_a2', role_name: 'Seksi Pembicara Kensyu MNSBDI', pic_name: 'Budi Santoso' },
    { id: 'sub_a3', role_name: 'Seksi Protocol & Penerima Tamu', pic_name: 'Kevin Tan' }
  ],
  pj_umum_name: 'Budi Santoso',
  sub_umum: [
    { id: 'sub_u1', role_name: 'Seksi Akomodasi & Transportasi Peserta Kensyu', pic_name: 'Budi Santoso' },
    { id: 'sub_u2', role_name: 'Seksi Sound System & Media Pembacaan', pic_name: 'Kevin Tan' },
    { id: 'sub_u3', role_name: 'Seksi Konsumsi Umat MNSBDI', pic_name: 'Lani Wijaya' },
    { id: 'sub_u4', role_name: 'Seksi Keamanan & Parkir', pic_name: 'Hendra Kurniawan' }
  ],
  vip_list: ['Bhante / Pandita MNSBDI', 'Pengurus Pusat MNSBDI']
};

export const INITIAL_EVENTS: ViharaEvent[] = [
  {
    id: 'e1',
    title: 'Gongyo & Oteshiki MNSBDI Akbar',
    description: 'Upacara pembacaan Gongyo bersama umat Nichiren Shoshu Buddha Dharma Indonesia (MNSBDI).',
    event_date: '2026-08-02T09:00:00Z',
    end_date: '2026-08-02T13:00:00Z',
    location: 'Dhammasala Utama Cetya MNSBDI',
    category: 'Gongyo',
    is_complex: true,
    quota: 250,
    pic_profile_id: 'p1',
    pic_name: 'Upasaka Hendra Kurniawan',
    status: 'upcoming',
    created_at: '2026-07-01T00:00:00Z',
    org_structure: INITIAL_ORG_STRUCTURE
  },
  {
    id: 'e2',
    title: 'Kensyu Penataran Umat MNSBDI 2026',
    description: 'Pelatihan dan penataran pendalaman ajaran MNSBDI untuk umat daerah.',
    event_date: '2026-08-15T08:00:00Z',
    end_date: '2026-08-15T15:00:00Z',
    location: 'Aula Kensyu MNSBDI',
    category: 'Kensyu',
    is_complex: true,
    quota: 150,
    pic_profile_id: 'p2',
    pic_name: 'Suryani Dewi',
    status: 'upcoming',
    created_at: '2026-07-10T00:00:00Z',
    org_structure: INITIAL_ORG_STRUCTURE
  },
  {
    id: 'e3',
    title: 'Pertemuan Rutin Umat MNSBDI Wilayah Jakarta',
    description: 'Diskusi dan silaturahmi rutin bulanan pengurus dan umat MNSBDI.',
    event_date: '2026-07-28T19:00:00Z',
    end_date: '2026-07-28T21:00:00Z',
    location: 'Ruang Pertemuan Cetya',
    category: 'Pertemuan',
    is_complex: false,
    quota: 50,
    pic_profile_id: 'p1',
    pic_name: 'Upasaka Hendra Kurniawan',
    status: 'ongoing',
    created_at: '2026-07-01T00:00:00Z',
  },
];

export const INITIAL_COMMITTEES: EventCommittee[] = [
  { id: 'c1', event_id: 'e1', profile_id: 'p1', committee_role: 'Ketua Panitia', profile_name: 'Upasaka Hendra Kurniawan' },
  { id: 'c2', event_id: 'e1', profile_id: 'p2', committee_role: 'Sekretaris', profile_name: 'Suryani Dewi' },
  { id: 'c3', event_id: 'e1', profile_id: 'p3', committee_role: 'Bendahara', profile_name: 'Budi Santoso' },
];

export const INITIAL_BUDGETS: EventBudget[] = [
  { id: 'b1', event_id: 'e1', item_name: 'Persembahan Altar & Bunga Segar', budget_type: 'rab', amount: 1500000, notes: 'Anggaran Bunga & Buah' },
  { id: 'b2', event_id: 'e1', item_name: 'Konsumsi Umat & Peserta Kensyu', budget_type: 'rab', amount: 3500000, notes: 'Makanan Vegetaris 200 Porsi' },
  { id: 'b3', event_id: 'e1', item_name: 'Cenderamata & Transport Pembicara', budget_type: 'rab', amount: 2000000, notes: 'Akomodasi MNSBDI' },
  { id: 'b4', event_id: 'e1', item_name: 'Persembahan Altar & Bunga Segar', budget_type: 'realisasi', amount: 1420000, notes: 'Nota Pasar Kembang' },
  { id: 'b5', event_id: 'e1', item_name: 'Konsumsi Umat & Peserta Kensyu', budget_type: 'realisasi', amount: 3300000, notes: 'Katering Vegetaris Sukses' },
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'r1',
    event_id: 'e1',
    profile_id: 'p2',
    registration_method: 'self',
    is_attended: false,
    created_at: '2026-07-22T10:00:00Z',
  },
  {
    id: 'r2',
    event_id: 'e1',
    profile_id: 'p3',
    registration_method: 'admin',
    registered_by: 'p1',
    is_attended: true,
    attended_at: '2026-07-22T10:30:00Z',
    created_at: '2026-07-22T10:30:00Z',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv1', item_name: 'Dupa Harum Cendana (Isi 100)', category: 'Dupa', stock_quantity: 145, price_per_unit: 45000, unit: 'Karton', min_stock_alert: 20, last_updated: '2026-07-25T10:00:00Z' },
  { id: 'inv2', item_name: 'Dupa Merah Jumbo (Isi 50)', category: 'Dupa', stock_quantity: 12, price_per_unit: 65000, unit: 'Karton', min_stock_alert: 15, last_updated: '2026-07-24T12:00:00Z' },
  { id: 'inv3', item_name: 'Lilin Merah 24 Jam', category: 'Lilin', stock_quantity: 85, price_per_unit: 35000, unit: 'Pasang', min_stock_alert: 30, last_updated: '2026-07-26T09:00:00Z' },
  { id: 'inv4', item_name: 'Lilin Lotus 3 Hari', category: 'Lilin', stock_quantity: 8, price_per_unit: 120000, unit: 'Pasang', min_stock_alert: 10, last_updated: '2026-07-20T11:00:00Z' },
  { id: 'inv5', item_name: 'Minyak Pelita Murni 1 Liter', category: 'Minyak', stock_quantity: 45, price_per_unit: 28000, unit: 'Botol', min_stock_alert: 15, last_updated: '2026-07-27T08:00:00Z' },
  { id: 'inv6', item_name: 'Buku Paritta & Gongyo MNSBDI', category: 'Buku', stock_quantity: 200, price_per_unit: 50000, unit: 'Pcs', min_stock_alert: 50, last_updated: '2026-07-15T15:00:00Z' },
];

export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  { id: 't1', inventory_id: 'inv1', item_name: 'Dupa Harum Cendana (Isi 100)', profile_id: 'p2', buyer_name: 'Suryani Dewi', quantity: 2, unit_price: 45000, total_price: 90000, transaction_date: '2026-07-26T14:00:00Z', notes: 'Pembelian langsung di sekretariat' },
  { id: 't2', inventory_id: 'inv3', item_name: 'Lilin Merah 24 Jam', profile_id: 'p3', buyer_name: 'Budi Santoso', quantity: 1, unit_price: 35000, total_price: 35000, transaction_date: '2026-07-27T09:30:00Z', notes: 'Untuk pelita persembahan' },
];

export const INITIAL_DONATIONS: Donation[] = [
  { id: 'd1', profile_id: 'p2', donor_name: 'Suryani Dewi', amount: 500000, donation_date: '2026-07-25', purpose: 'Dana Operasional Cetya MNSBDI', payment_method: 'Transfer Bank', notes: 'Transfer via BCA', created_at: '2026-07-25T10:00:00Z' },
  { id: 'd2', donor_name: 'Hamba Buddha MNSBDI (Anonim)', amount: 1500000, donation_date: '2026-07-26', purpose: 'Dana Kensyu MNSBDI', payment_method: 'Tunai', notes: 'Kotak Dana Vihara', created_at: '2026-07-26T14:00:00Z' },
  { id: 'd3', profile_id: 'p3', donor_name: 'Budi Santoso', amount: 300000, donation_date: '2026-07-27', purpose: 'Dana Pelita Gongyo', payment_method: 'QRIS', notes: 'Tunai di sekretariat', created_at: '2026-07-27T09:00:00Z' },
];
