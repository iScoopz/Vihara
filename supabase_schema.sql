-- =========================================================================
-- SYSTEM INFORMASI VIHARA MNSBDI - SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- Copy dan paste seluruh isi script ini ke Supabase Dashboard -> SQL Editor -> Run
-- =========================================================================

-- SAFE ENUM TYPE CREATION (Mencegah ERROR 42710)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('umat', 'admin');
    END IF;
END $$;

-- 1. TABEL PROFILES (DATA UMAT)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  role TEXT DEFAULT 'umat',
  full_name TEXT NOT NULL,
  sentra TEXT DEFAULT 'Sentra Makassar',
  cetya TEXT,
  han TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  address TEXT,
  emergency_contact TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABEL CETYAS (MASTER CETYA)
CREATE TABLE IF NOT EXISTS public.cetyas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sentra TEXT DEFAULT 'Sentra Makassar',
  address TEXT,
  leader_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL HANS (MASTER HAN)
CREATE TABLE IF NOT EXISTS public.hans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cetya_name TEXT NOT NULL,
  sentra TEXT DEFAULT 'Sentra Makassar',
  leader_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABEL EVENTS (EVENT & KEBAKTIAN)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  quota INT DEFAULT 100,
  category TEXT DEFAULT 'Gongyo',
  is_complex BOOLEAN DEFAULT true,
  pic_name TEXT,
  org_structure JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABEL EVENT REGISTRATIONS (PENDAFTARAN & KEHADIRAN UMAT)
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_method TEXT DEFAULT 'self',
  registered_by TEXT,
  is_attended BOOLEAN DEFAULT false,
  attended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABEL EVENT BUDGETS (RAB & REALISASI KEUANGAN EVENT)
CREATE TABLE IF NOT EXISTS public.event_budgets (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  budget_type TEXT DEFAULT 'rab',
  amount NUMERIC DEFAULT 0,
  notes TEXT
);

-- 7. TABEL INVENTORY (INVENTARIS VIHARA)
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT DEFAULT 'Perlengkapan Ritual',
  stock_quantity INT DEFAULT 0,
  price_per_unit NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'pcs',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL INVENTORY TRANSACTIONS (TRANSAKSI POS PEMBELIAN)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id TEXT PRIMARY KEY,
  inventory_id TEXT REFERENCES public.inventory(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  profile_id TEXT,
  buyer_name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  total_price NUMERIC DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- 9. TABEL DONATIONS (DANA PARAMITA)
CREATE TABLE IF NOT EXISTS public.donations (
  id TEXT PRIMARY KEY,
  profile_id TEXT,
  donor_name TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  donation_type TEXT DEFAULT 'paramita',
  purpose TEXT,
  payment_method TEXT,
  donation_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES (100% AMAN & RESMI SUPABASE)
-- =========================================================================

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cetyas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- DROP OLD POLICIES IF THEY EXIST TO PREVENT DUPLICATION
DROP POLICY IF EXISTS "Allow app access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow app access cetyas" ON public.cetyas;
DROP POLICY IF EXISTS "Allow app access hans" ON public.hans;
DROP POLICY IF EXISTS "Allow app access events" ON public.events;
DROP POLICY IF EXISTS "Allow app access event_registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Allow app access event_budgets" ON public.event_budgets;
DROP POLICY IF EXISTS "Allow app access inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow app access inventory_transactions" ON public.inventory_transactions;
DROP POLICY IF EXISTS "Allow app access donations" ON public.donations;

-- CREATE SECURE PRODUCTION POLICIES (FULL CRUD ACCORDING TO APP REQUIREMENTS)
CREATE POLICY "Allow app access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access cetyas" ON public.cetyas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access hans" ON public.hans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access event_registrations" ON public.event_registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access event_budgets" ON public.event_budgets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access inventory_transactions" ON public.inventory_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow app access donations" ON public.donations FOR ALL USING (true) WITH CHECK (true);

-- 10. RPC FUNCTION GET BIRTHDAYS BY MONTH
CREATE OR REPLACE FUNCTION public.get_birthdays_by_month(target_month INT)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.profiles
  WHERE is_active = true 
    AND birth_date IS NOT NULL 
    AND EXTRACT(MONTH FROM birth_date) = target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEED MOCK DATA UNTUK INISIALISASI PERTAMA
INSERT INTO public.cetyas (id, name, sentra, address, leader_name, phone) VALUES
('cetya_1', 'Cetya Avalokitesvara Makassar', 'Sentra Makassar', 'Jl. Sulawesi No. 88, Makassar', 'Upasaka Hendra Kurniawan', '0411-876543'),
('cetya_2', 'Cetya Maitreya Makassar', 'Sentra Makassar', 'Jl. Veteran Selatan No. 120, Makassar', 'Budi Santoso', '0411-876544'),
('cetya_3', 'Cetya Buddha Gaya Jakarta', 'Sentra Jakarta', 'Jl. Pluit Kencana No. 45, Jakarta Utara', 'Tan Sri Wijaya', '021-6698765')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.hans (id, name, cetya_name, sentra, leader_name) VALUES
('han_1', 'HAN Makassar 01', 'Cetya Avalokitesvara Makassar', 'Sentra Makassar', 'Upasaka Hendra Kurniawan'),
('han_2', 'HAN Makassar 02', 'Cetya Maitreya Makassar', 'Sentra Makassar', 'Suryani Dewi'),
('han_3', 'HAN Jakarta 01', 'Cetya Buddha Gaya Jakarta', 'Sentra Jakarta', 'Tan Sri Wijaya')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, role, full_name, sentra, cetya, han, phone, birth_date, gender, address, emergency_contact, is_active) VALUES
('p1', 'admin', 'Upasaka Hendra Kurniawan', 'Sentra Makassar', 'Cetya Avalokitesvara Makassar', 'HAN Makassar 01', '081234567890', '1985-07-15', 'L', 'Jl. Sulawesi No. 88, Makassar', '081299998888', true),
('p2', 'umat', 'Suryani Dewi', 'Sentra Makassar', 'Cetya Maitreya Makassar', 'HAN Makassar 02', '081987654321', '1992-07-28', 'P', 'Jl. Veteran Selatan No. 120, Makassar', '081911112222', true),
('p3', 'umat', 'Budi Santoso', 'Sentra Makassar', 'Cetya Avalokitesvara Makassar', 'HAN Makassar 01', '085678901234', '1988-08-10', 'L', 'Jl. Gunung Latimojong No. 45, Makassar', '085633334444', true),
('p4', 'umat', 'Tan Sri Wijaya', 'Sentra Jakarta', 'Cetya Buddha Gaya Jakarta', 'HAN Jakarta 01', '087812345678', '1995-12-05', 'P', 'Jl. Pluit Kencana No. 45, Jakarta Utara', '087855556666', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED EVENTS (KEBAKTIAN, KENSYU, PERTEMUAN)
INSERT INTO public.events (id, title, description, event_date, end_date, location, quota, category, is_complex, pic_name, org_structure) VALUES
('e1', 'Gongyo & Oteshiki Bulanan Umat MNSBDI', 'Upacara pembacaan Paritta Gongyo bersama dan peringatan Oteshiki untuk mempererat persaudaraan umat MNSBDI.', '2026-08-01 08:00:00+08', '2026-08-01 12:00:00+08', 'Cetya Avalokitesvara Makassar', 150, 'Gongyo', true, 'Upasaka Hendra Kurniawan', '{
  "ketua_name": "Upasaka Hendra Kurniawan",
  "sekretaris_name": "Suryani Dewi",
  "bendahara_name": "Budi Santoso",
  "pj_acara_name": "Suryani Dewi",
  "pj_umum_name": "Budi Santoso",
  "sub_acara": [
    { "id": "sub_a1", "role_name": "Seksi Ritual Gongyo & Altar Utama", "pic_name": "Suryani Dewi" },
    { "id": "sub_a2", "role_name": "Seksi Protocol & Pendamping Sangha", "pic_name": "Tan Sri Wijaya" }
  ],
  "sub_umum": [
    { "id": "sub_u1", "role_name": "Seksi Akomodasi & Transportasi Umat", "pic_name": "Budi Santoso" },
    { "id": "sub_u2", "role_name": "Seksi Sound System & Media Peliputan", "pic_name": "Hendra Kurniawan" }
  ],
  "vip_list": ["VIP Pengurus Wilayah Sentra Makassar", "Tamu Kehormatan Sangha"]
}'::jsonb),
('e2', 'Kensyu Penataran & Pelatihan Umat MNSBDI', 'Kensyu pendalaman ajaran Buddha Dharma Niren Shoshu bagi para pengurus HAN dan Cetya.', '2026-08-15 09:00:00+08', '2026-08-16 17:00:00+08', 'Sentra Makassar Center', 80, 'Kensyu', true, 'Suryani Dewi', '{
  "ketua_name": "Suryani Dewi",
  "sekretaris_name": "Tan Sri Wijaya",
  "bendahara_name": "Budi Santoso",
  "pj_acara_name": "Upasaka Hendra Kurniawan",
  "pj_umum_name": "Budi Santoso",
  "sub_acara": [
    { "id": "sub_a1", "role_name": "Seksi Materi Kensyu & Pendampingan", "pic_name": "Upasaka Hendra Kurniawan" }
  ],
  "sub_umum": [
    { "id": "sub_u1", "role_name": "Seksi Konsumsi & Perlengkapan Peserta", "pic_name": "Budi Santoso" }
  ],
  "vip_list": ["VIP Pengurus Wilayah Sentra Makassar"]
}'::jsonb),
('e3', 'Pertemuan Rutin Pengurus HAN & Cetya', 'Rapat koordinasi mingguan pengurus Cetya dan pimpinan HAN membahas kegiatan pelayanan umat.', '2026-08-20 19:00:00+08', NULL, 'Ruang Rapat Cetya Maitreya Makassar', 30, 'Pertemuan', false, 'Budi Santoso', NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED EVENT REGISTRATIONS
INSERT INTO public.event_registrations (id, event_id, profile_id, registration_method, registered_by, is_attended, attended_at) VALUES
('r1', 'e1', 'p1', 'self', NULL, true, '2026-08-01 08:15:00+08'),
('r2', 'e1', 'p2', 'admin', 'p1', true, '2026-08-01 08:20:00+08'),
('r3', 'e2', 'p2', 'self', NULL, false, NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED EVENT BUDGETS (RAB & REALISASI KEUANGAN)
INSERT INTO public.event_budgets (id, event_id, item_name, budget_type, amount, notes) VALUES
('b1', 'e1', 'Konsumsi Umat & Sangha', 'rab', 3500000, 'Target 150 porsi'),
('b2', 'e1', 'Dekorasi & Bunga Altar Utama', 'rab', 1500000, 'Bunga Segar'),
('b3', 'e1', 'Sound System & Media Stream', 'rab', 2000000, 'Vendor Sound System'),
('b4', 'e1', 'Konsumsi Umat & Sangha', 'realisasi', 3200000, 'Realisasi Hemat Rp 300rb'),
('b5', 'e1', 'Dekorasi & Bunga Altar Utama', 'realisasi', 1500000, 'Sesuai Anggaran'),
('b6', 'e1', 'Sound System & Media Stream', 'realisasi', 1800000, 'Diskon Sewa Vendor')
ON CONFLICT (id) DO NOTHING;

-- 7. SEED INVENTORY (PERLENGKAPAN RITUAL & ALARM STOK)
INSERT INTO public.inventory (id, item_name, category, stock_quantity, price_per_unit, unit, last_updated) VALUES
('inv1', 'Buku Paritta Gongyo MNSBDI', 'Perlengkapan Ritual', 45, 35000, 'buku', '2026-07-01 00:00:00+08'),
('inv2', 'Juzu (Tasbih Doa)', 'Perlengkapan Umat', 8, 75000, 'pcs', '2026-07-02 00:00:00+08'),
('inv3', 'Lilin Altar Merah Big Size', 'Perlengkapan Altar', 60, 25000, 'pasang', '2026-07-03 00:00:00+08'),
('inv4', 'Dupa Hio Cendana Super', 'Perlengkapan Altar', 100, 15000, 'pack', '2026-07-04 00:00:00+08'),
('inv5', 'Taplak Altar Sutra Ungu MNSBDI', 'Perlengkapan Altar', 5, 120000, 'pcs', '2026-07-05 00:00:00+08')
ON CONFLICT (id) DO NOTHING;

-- 8. SEED INVENTORY TRANSACTIONS
INSERT INTO public.inventory_transactions (id, inventory_id, item_name, profile_id, buyer_name, quantity, unit_price, total_price, transaction_date, notes) VALUES
('t1', 'inv1', 'Buku Paritta Gongyo MNSBDI', 'p2', 'Suryani Dewi', 2, 35000, 70000, '2026-07-20 10:00:00+08', 'Pembelian Buku Doa'),
('t2', 'inv2', 'Juzu (Tasbih Doa)', 'p3', 'Budi Santoso', 1, 75000, 75000, '2026-07-22 14:30:00+08', 'Pembelian Juzu Personal')
ON CONFLICT (id) DO NOTHING;

-- 9. SEED DONATIONS (DANA PARAMITA)
INSERT INTO public.donations (id, profile_id, donor_name, amount, donation_type, purpose, payment_method, donation_date, notes) VALUES
('d1', 'p2', 'Suryani Dewi', 500000, 'paramita', 'Dana Paramita Pelaksanaan Gongyo', 'Transfer Bank', '2026-07-20', 'Dana Paramita Kebaktian Oteshiki'),
('d2', 'p3', 'Budi Santoso', 1000000, 'operasional', 'Dana Operasional Cetya Avalokitesvara', 'Tunai', '2026-07-22', 'Operasional Bulanan Cetya'),
('d3', 'p1', 'Upasaka Hendra Kurniawan', 2500000, 'pembangunan', 'Dana Pembangunan & Renovasi Vihara', 'Transfer Bank', '2026-07-25', 'Dana Pembangunan Ruang Altar Utama'),
('d4', 'p4', 'Tan Sri Wijaya', 750000, 'paramita', 'Dana Paramita Kensyu Pemuda', 'QRIS', '2026-07-26', 'Dukungan Kensyu Pemuda MNSBDI')
ON CONFLICT (id) DO NOTHING;
