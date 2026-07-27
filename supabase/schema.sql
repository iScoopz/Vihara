-- PostgreSQL Schema v3 for Vihara MNSBDI Information System
-- Target Database: Supabase PostgreSQL

CREATE TYPE user_role AS ENUM ('admin', 'umat');
CREATE TYPE budget_type AS ENUM ('rab', 'realisasi');
CREATE TYPE reg_method AS ENUM ('self', 'admin');
CREATE TYPE event_category AS ENUM ('Kensyu', 'Pertemuan', 'Gongyo');

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'umat',
  full_name VARCHAR(255) NOT NULL,
  han VARCHAR(100),
  cetya VARCHAR(255),
  phone VARCHAR(50),
  birth_date DATE,
  gender VARCHAR(10),
  address TEXT,
  emergency_contact VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location VARCHAR(255) NOT NULL,
  category event_category NOT NULL DEFAULT 'Gongyo',
  is_complex BOOLEAN DEFAULT false,
  quota INT DEFAULT 100,
  pic_profile_id UUID REFERENCES public.profiles(id),
  pic_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Event Committees Table
CREATE TABLE IF NOT EXISTS public.event_committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  committee_role VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Event Budgets Table
CREATE TABLE IF NOT EXISTS public.event_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  budget_type budget_type NOT NULL DEFAULT 'rab',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  registration_method reg_method NOT NULL DEFAULT 'self',
  registered_by UUID REFERENCES public.profiles(id),
  is_attended BOOLEAN DEFAULT false,
  attended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

-- 6. Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  price_per_unit NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  min_stock_alert INT NOT NULL DEFAULT 10,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Inventory Transactions Table (POS Purchase Log)
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id),
  buyer_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(12,2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- Automatic Trigger for Stock Reduction upon Inventory Transaction
CREATE OR REPLACE FUNCTION deduct_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.inventory
  SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity),
      last_updated = NOW()
  WHERE id = NEW.inventory_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_inventory_stock
AFTER INSERT ON public.inventory_transactions
FOR EACH ROW EXECUTE FUNCTION deduct_inventory_stock();

-- 8. Donations Table (Dana Paramita)
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id),
  donor_name VARCHAR(255) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  donation_date DATE NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'Transfer Bank',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC Function for Birthday Query by Month
CREATE OR REPLACE FUNCTION get_birthdays_by_month(target_month INT)
RETURNS SETOF public.profiles AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.profiles
  WHERE is_active = true
    AND birth_date IS NOT NULL
    AND EXTRACT(MONTH FROM birth_date) = target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
