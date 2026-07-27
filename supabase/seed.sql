-- Seed initial mock data for Vihara Information System

-- 1. Insert dummy records into auth.users (to satisfy foreign key constraint profiles_id_fkey)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@vihara.or.id', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Upasaka Hendra Kurniawan"}', NOW(), NOW(), 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'suryani@vihara.or.id', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Suryani Dewi"}', NOW(), NOW(), 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'budi@vihara.or.id', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Budi Santoso"}', NOW(), NOW(), 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'lani@vihara.or.id', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lani Wijaya"}', NOW(), NOW(), 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'kevin@vihara.or.id', '$2a$10$abcdefghijklmnopqrstuu', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kevin Tan"}', NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert sample profiles
INSERT INTO profiles (id, role, full_name, han, cetya, phone, birth_date, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Upasaka Hendra Kurniawan', 'HAN-001', 'Cetya Avalokitesvara', '081234567890', '1985-07-15', true),
('00000000-0000-0000-0000-000000000002', 'umat', 'Suryani Dewi', 'HAN-002', 'Cetya Maitreya', '081987654321', '1992-07-28', true),
('00000000-0000-0000-0000-000000000003', 'umat', 'Budi Santoso', 'HAN-001', 'Cetya Avalokitesvara', '081311223344', '1990-11-12', true),
('00000000-0000-0000-0000-000000000004', 'umat', 'Lani Wijaya', 'HAN-003', 'Cetya Buddha Gaya', '081555667788', '1998-07-04', true),
('00000000-0000-0000-0000-000000000005', 'umat', 'Kevin Tan', 'HAN-002', 'Cetya Maitreya', '081777889900', '2001-03-22', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert sample events
INSERT INTO events (id, title, description, event_date, location, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Puja Bhakti Asadha 2568 BE', 'Kebaktian memperingati Hari Raya Asadha bersama Sangha', NOW() + INTERVAL '5 days', 'Dhammasala Utama', 'upcoming'),
('11111111-1111-1111-1111-111111111112', 'Donor Darah & Bakti Sosial Vihara', 'Kegiatan sosial kemanusiaan rutin tiga bulanan', NOW() + INTERVAL '12 days', 'Halaman Vihara', 'upcoming'),
('11111111-1111-1111-1111-111111111113', 'Kelas Meditasi Vipassana Minggu Ini', 'Latihan meditasi bersama dipimpin oleh Samanera', NOW() - INTERVAL '3 days', 'Ruang Meditasi Lt. 2', 'completed')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert sample inventory
INSERT INTO inventory (item_name, category, stock_quantity, unit, min_stock_alert) VALUES
('Dupa Harum Cendana (Isi 100)', 'Dupa', 150, 'Karton', 20),
('Dupa Merah Jumbo (Isi 50)', 'Dupa', 12, 'Karton', 15),
('Lilin Merah 24 Jam', 'Lilin', 85, 'Pasang', 30),
('Lilin Lotus 3 Hari', 'Lilin', 8, 'Pasang', 10),
('Minyak Pelita Murni 1 Liter', 'Minyak', 45, 'Botol', 15),
('Buku Paritta Suci (Revisi 2024)', 'Buku', 200, 'Pcs', 50);

-- 5. Insert sample donations
INSERT INTO donations (donor_name, amount, donation_date, purpose, notes) VALUES
('Suryani Dewi', 500000, CURRENT_DATE - INTERVAL '2 days', 'Dana Operasional Vihara', 'Bantuan bulanan'),
('Hamba Buddha (Anonim)', 1000000, CURRENT_DATE - INTERVAL '1 day', 'Dana Pembangunan', 'Untuk renovasi Cetiya'),
('Budi Santoso', 250000, CURRENT_DATE, 'Dana Pelita', 'Pelita penerangan bulan Asadha');
