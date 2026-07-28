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
