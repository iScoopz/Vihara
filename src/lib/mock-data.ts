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
  CetyaProfile,
  HanProfile
} from '@/types/database';

export const INITIAL_SENTRAS = [
  'Sentra Makassar',
  'Sentra Jakarta',
  'Sentra Surabaya',
  'Sentra Medan'
];

export const INITIAL_CETYAS: CetyaProfile[] = [
  {
    id: 'cetya_1',
    name: 'Cetya Avalokitesvara Makassar',
    sentra: 'Sentra Makassar',
    address: 'Jl. Sulawesi No. 88, Makassar',
    leader_name: 'Upasaka Hendra Kurniawan',
    phone: '0411-876543',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cetya_2',
    name: 'Cetya Maitreya Makassar',
    sentra: 'Sentra Makassar',
    address: 'Jl. Veteran Selatan No. 120, Makassar',
    leader_name: 'Budi Santoso',
    phone: '0411-876544',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'cetya_3',
    name: 'Cetya Buddha Gaya Jakarta',
    sentra: 'Sentra Jakarta',
    address: 'Jl. Pluit Kencana No. 45, Jakarta Utara',
    leader_name: 'Tan Sri Wijaya',
    phone: '021-6698765',
    created_at: '2024-01-03T00:00:00Z'
  }
];

export const INITIAL_HANS: HanProfile[] = [
  {
    id: 'han_1',
    name: 'HAN Makassar 01',
    cetya_name: 'Cetya Avalokitesvara Makassar',
    sentra: 'Sentra Makassar',
    leader_name: 'Upasaka Hendra Kurniawan',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'han_2',
    name: 'HAN Makassar 02',
    cetya_name: 'Cetya Maitreya Makassar',
    sentra: 'Sentra Makassar',
    leader_name: 'Suryani Dewi',
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'han_3',
    name: 'HAN Jakarta 01',
    cetya_name: 'Cetya Buddha Gaya Jakarta',
    sentra: 'Sentra Jakarta',
    leader_name: 'Tan Sri Wijaya',
    created_at: '2024-01-03T00:00:00Z'
  }
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'p1',
    role: 'admin',
    full_name: 'Upasaka Hendra Kurniawan',
    email: 'admin@vihara.or.id',
    sentra: 'Sentra Makassar',
    cetya: 'Cetya Avalokitesvara Makassar',
    han: 'HAN Makassar 01',
    bagian: 'Pro-M 40s',
    phone: '081234567890',
    birth_date: '1985-07-15',
    gender: 'L',
    address: 'Jl. Sulawesi No. 88, Makassar',
    emergency_contact: '081299998888',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'p2',
    role: 'umat',
    full_name: 'Suryani Dewi',
    email: 'suryani@vihara.or.id',
    sentra: 'Sentra Makassar',
    cetya: 'Cetya Maitreya Makassar',
    han: 'HAN Makassar 02',
    bagian: 'Wanita',
    phone: '081987654321',
    birth_date: '1992-07-28',
    gender: 'P',
    address: 'Jl. Veteran Selatan No. 120, Makassar',
    emergency_contact: '081911112222',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'p3',
    role: 'umat',
    full_name: 'Budi Santoso',
    email: 'budi@vihara.or.id',
    sentra: 'Sentra Makassar',
    cetya: 'Cetya Avalokitesvara Makassar',
    han: 'HAN Makassar 01',
    bagian: 'Pria',
    phone: '085678901234',
    birth_date: '1988-08-10',
    gender: 'L',
    address: 'Jl. Gunung Latimojong No. 45, Makassar',
    emergency_contact: '085633334444',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: 'p4',
    role: 'umat',
    full_name: 'Tan Sri Wijaya',
    email: 'tansri@vihara.or.id',
    sentra: 'Sentra Jakarta',
    cetya: 'Cetya Buddha Gaya Jakarta',
    han: 'HAN Jakarta 01',
    bagian: 'Bintang',
    phone: '087812345678',
    birth_date: '1995-12-05',
    gender: 'P',
    address: 'Jl. Pluit Kencana No. 45, Jakarta Utara',
    emergency_contact: '087855556666',
    is_active: true,
    created_at: '2024-01-04T00:00:00Z'
  }
];

export const INITIAL_ORG_STRUCTURE: EventOrgStructure = {
  ketua_name: 'Upasaka Hendra Kurniawan',
  sekretaris_name: 'Suryani Dewi',
  bendahara_name: 'Budi Santoso',
  pj_acara_name: 'Suryani Dewi',
  pj_umum_name: 'Budi Santoso',
  sub_acara: [
    { id: 'sub_a1', role_name: 'Seksi Ritual Gongyo & Altar Utama', pic_name: 'Suryani Dewi' },
    { id: 'sub_a2', role_name: 'Seksi Protocol & Pendamping Sangha', pic_name: 'Tan Sri Wijaya' }
  ],
  sub_umum: [
    { id: 'sub_u1', role_name: 'Seksi Akomodasi & Transportasi Umat', pic_name: 'Budi Santoso' },
    { id: 'sub_u2', role_name: 'Seksi Sound System & Media Peliputan', pic_name: 'Hendra Kurniawan' }
  ],
  vip_list: ['VIP Pengurus Wilayah Sentra Makassar', 'Tamu Kehormatan Sangha']
};

export const INITIAL_EVENTS: ViharaEvent[] = [
  {
    id: 'e1',
    title: 'Gongyo & Oteshiki Bulanan Umat MNSBDI',
    description: 'Upacara pembacaan Paritta Gongyo bersama dan peringatan Oteshiki untuk mempererat persaudaraan umat MNSBDI.',
    event_date: '2026-08-01T08:00:00Z',
    end_date: '2026-08-01T12:00:00Z',
    location: 'Cetya Avalokitesvara Makassar',
    quota: 150,
    category: 'Gongyo',
    is_complex: true,
    is_published: true,
    pic_name: 'Upasaka Hendra Kurniawan',
    pricing_per_bagian: {
      'Bintang': 50000,
      'GM': 75000,
      'Pro-M Progresif': 100000,
      'Pro-M 40s': 100000,
      'Pria': 100000,
      'Wanita': 100000,
      'Inspirasi': 100000
    },
    org_structure: INITIAL_ORG_STRUCTURE,
    created_at: '2024-01-10T00:00:00Z',
    proposal_rundowns: [
      { id: 'pr1', event_id: 'e1', day_date: 'Sabtu, 1 Agustus 2026', time_slot: '08:00 - 08:30', activity: 'Registrasi Umat & Sambutan Panitia', notes: 'Pendaftaran di lobby utama' },
      { id: 'pr2', event_id: 'e1', day_date: 'Sabtu, 1 Agustus 2026', time_slot: '08:30 - 10:30', activity: 'Pembacaan Paritta Gongyo & Doa Bersama', notes: 'Gongyo bersama di Altar Utama' },
      { id: 'pr3', event_id: 'e1', day_date: 'Sabtu, 1 Agustus 2026', time_slot: '10:30 - 12:00', activity: 'Dharma Desana & Ramah Tamah Oteshiki', notes: 'Pesan Dharma & Makan Siang Bersama' }
    ],
    skenario_kerja: [
      {
        id: 'sk1',
        event_id: 'e1',
        day_phase: 'H-1 (Jumat, 31 Juli 2026)',
        time_slot: '14:00 - 17:00',
        executor_bidang_pj: 'Bidang Umum - Budi Santoso',
        activity: 'Pemasangan Spanduk, Dekorasi Bunga & Set Up Altar Utama',
        interbid_bidang_pj: 'Seksi Ritual - Suryani Dewi',
        notes: 'Pastikan bunga segar terpasang rapi & lilin merah disiapkan'
      },
      {
        id: 'sk2',
        event_id: 'e1',
        day_phase: 'H-1 (Jumat, 31 Juli 2026)',
        time_slot: '19:00 - 21:00',
        executor_bidang_pj: 'Bidang Acara - Suryani Dewi',
        activity: 'Gladi Clean Sound System, Mic Wireless & Protocol Sangha',
        interbid_bidang_pj: 'Bidang Umum - Hendra Kurniawan',
        notes: 'Cek 4 unit mic wireless & pastikan baterai cadangan penuh'
      },
      {
        id: 'sk3',
        event_id: 'e1',
        day_phase: 'Hari-H (Sabtu, 1 Agustus 2026)',
        time_slot: '07:00 - 08:00',
        executor_bidang_pj: 'Bidang Umum - Budi Santoso',
        activity: 'Penerimaan Konsumsi & Penataan Ruang Makan Umat',
        interbid_bidang_pj: 'Bidang Acara - Suryani Dewi',
        notes: 'Konfirmasi 150 porsi konsumsi vegetarian telah tiba'
      }
    ]
  },
  {
    id: 'e2',
    title: 'Kensyu Penataran & Pelatihan Umat MNSBDI',
    description: 'Kensyu pendalaman ajaran Buddha Dharma Niren Shoshu bagi para pengurus HAN dan Cetya.',
    event_date: '2026-08-15T09:00:00Z',
    end_date: '2026-08-16T17:00:00Z',
    location: 'Sentra Makassar Center',
    quota: 80,
    category: 'Kensyu',
    is_complex: true,
    pic_name: 'Suryani Dewi',
    org_structure: {
      ...INITIAL_ORG_STRUCTURE,
      ketua_name: 'Suryani Dewi',
      pj_acara_name: 'Upasaka Hendra Kurniawan'
    },
    created_at: '2024-01-12T00:00:00Z'
  },
  {
    id: 'e3',
    title: 'Pertemuan Rutin Pengurus HAN & Cetya',
    description: 'Rapat koordinasi mingguan pengurus Cetya dan pimpinan HAN membahas kegiatan pelayanan umat.',
    event_date: '2026-08-20T19:00:00Z',
    location: 'Ruang Rapat Cetya Maitreya Makassar',
    quota: 30,
    category: 'Pertemuan',
    is_complex: false,
    pic_name: 'Budi Santoso',
    created_at: '2024-01-15T00:00:00Z'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv1',
    item_name: 'Buku Paritta Gongyo MNSBDI',
    category: 'Perlengkapan Ritual',
    stock_quantity: 45,
    price_per_unit: 35000,
    unit: 'buku',
    last_updated: '2026-07-01T00:00:00Z'
  },
  {
    id: 'inv2',
    item_name: 'Juzu (Tasbih Doa)',
    category: 'Perlengkapan Umat',
    stock_quantity: 20,
    price_per_unit: 75000,
    unit: 'pcs',
    last_updated: '2026-07-02T00:00:00Z'
  },
  {
    id: 'inv3',
    item_name: 'Lilin Altar Merah Big Size',
    category: 'Perlengkapan Altar',
    stock_quantity: 60,
    price_per_unit: 25000,
    unit: 'pasang',
    last_updated: '2026-07-03T00:00:00Z'
  },
  {
    id: 'inv4',
    item_name: 'Dupa Hio Cendana Super',
    category: 'Perlengkapan Altar',
    stock_quantity: 100,
    price_per_unit: 15000,
    unit: 'pack',
    last_updated: '2026-07-04T00:00:00Z'
  }
];

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'd1',
    donor_name: 'Suryani Dewi',
    amount: 500000,
    donation_type: 'paramita',
    donation_date: '2026-07-20',
    notes: 'Dana Paramita Pelaksanaan Gongyo'
  },
  {
    id: 'd2',
    donor_name: 'Budi Santoso',
    amount: 1000000,
    donation_type: 'operasional',
    donation_date: '2026-07-22',
    notes: 'Dana Operasional Cetya Avalokitesvara'
  },
  {
    id: 'd3',
    donor_name: 'Hendra Kurniawan',
    amount: 2500000,
    donation_type: 'pembangunan',
    donation_date: '2026-07-25',
    notes: 'Dana Renovasi Ruang Kebaktian Utama'
  }
];

export const INITIAL_REGISTRATIONS: EventRegistration[] = [
  {
    id: 'r1',
    event_id: 'e1',
    profile_id: 'p1',
    registration_method: 'self',
    is_attended: true,
    attended_at: '2026-08-01T08:15:00Z',
    created_at: '2026-07-15T00:00:00Z'
  },
  {
    id: 'r2',
    event_id: 'e1',
    profile_id: 'p2',
    registration_method: 'admin',
    registered_by: 'p1',
    is_attended: true,
    attended_at: '2026-08-01T08:20:00Z',
    created_at: '2026-07-16T00:00:00Z'
  },
  {
    id: 'r3',
    event_id: 'e2',
    profile_id: 'p2',
    registration_method: 'self',
    is_attended: false,
    created_at: '2026-07-18T00:00:00Z'
  }
];

export const INITIAL_BUDGETS: EventBudget[] = [
  { id: 'b1', event_id: 'e1', item_name: 'Konsumsi Umat & Sangha', budget_type: 'rab', amount: 3500000, notes: 'Target 150 porsi' },
  { id: 'b2', event_id: 'e1', item_name: 'Dekorasi & Bunga Altar Utama', budget_type: 'rab', amount: 1500000, notes: 'Bunga Segar' },
  { id: 'b3', event_id: 'e1', item_name: 'Sound System & Media Stream', budget_type: 'rab', amount: 2000000 },
  { id: 'b4', event_id: 'e1', item_name: 'Konsumsi Umat & Sangha', budget_type: 'realisasi', amount: 3200000, notes: 'Realisasi Hemat Rp 300rb' },
  { id: 'b5', event_id: 'e1', item_name: 'Dekorasi & Bunga Altar Utama', budget_type: 'realisasi', amount: 1500000 },
  { id: 'b6', event_id: 'e1', item_name: 'Sound System & Media Stream', budget_type: 'realisasi', amount: 1800000, notes: 'Diskon Sewa' }
];

export const INITIAL_COMMITTEES: EventCommittee[] = [];
export const INITIAL_TRANSACTIONS: InventoryTransaction[] = [];
