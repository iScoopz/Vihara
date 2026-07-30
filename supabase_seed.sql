-- =========================================================================
-- SYSTEM INFORMASI VIHARA MNSBDI - DEDICATED SEED DATA SCRIPT FOR SUPABASE
-- Copy dan jalankan di Supabase SQL Editor setelah tabel-tabel dibuat
-- =========================================================================

-- 1. SEED MASTER CETYA
INSERT INTO public.cetyas (id, name, sentra, address, leader_name, phone) VALUES
('cetya_1', 'Cetya Avalokitesvara Makassar', 'Sentra Makassar', 'Jl. Sulawesi No. 88, Makassar', 'Upasaka Hendra Kurniawan', '0411-876543'),
('cetya_2', 'Cetya Maitreya Makassar', 'Sentra Makassar', 'Jl. Veteran Selatan No. 120, Makassar', 'Budi Santoso', '0411-876544'),
('cetya_3', 'Cetya Buddha Gaya Jakarta', 'Sentra Jakarta', 'Jl. Pluit Kencana No. 45, Jakarta Utara', 'Tan Sri Wijaya', '021-6698765')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED MASTER HAN
INSERT INTO public.hans (id, name, cetya_name, sentra, leader_name) VALUES
('han_1', 'HAN Makassar 01', 'Cetya Avalokitesvara Makassar', 'Sentra Makassar', 'Upasaka Hendra Kurniawan'),
('han_2', 'HAN Makassar 02', 'Cetya Maitreya Makassar', 'Sentra Makassar', 'Suryani Dewi'),
('han_3', 'HAN Jakarta 01', 'Cetya Buddha Gaya Jakarta', 'Sentra Jakarta', 'Tan Sri Wijaya')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PROFILES (DATA UMAT & ADMIN)
INSERT INTO public.profiles (id, role, full_name, sentra, cetya, han, phone, birth_date, gender, address, emergency_contact, is_active) VALUES
('p1', 'admin', 'Upasaka Hendra Kurniawan', 'Sentra Makassar', 'Cetya Avalokitesvara Makassar', 'HAN Makassar 01', '081234567890', '1985-07-15', 'L', 'Jl. Sulawesi No. 88, Makassar', '081299998888', true),
('p2', 'umat', 'Suryani Dewi', 'Sentra Makassar', 'Cetya Maitreya Makassar', 'HAN Makassar 02', '081987654321', '1992-07-28', 'P', 'Jl. Veteran Selatan No. 120, Makassar', '081911112222', true),
('p3', 'umat', 'Budi Santoso', 'Sentra Makassar', 'Cetya Avalokitesvara Makassar', 'HAN Makassar 01', '085678901234', '1988-08-10', 'L', 'Jl. Gunung Latimojong No. 45, Makassar', '085633334444', true),
('p4', 'umat', 'Tan Sri Wijaya', 'Sentra Jakarta', 'Cetya Buddha Gaya Jakarta', 'HAN Jakarta 01', '087812345678', '1995-12-05', 'P', 'Jl. Pluit Kencana No. 45, Jakarta Utara', '087855556666', true)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED EVENTS
INSERT INTO public.events (id, title, description, event_date, end_date, location, quota, category, is_complex, is_published, pic_name, org_structure) VALUES
('e1', 'Gongyo & Oteshiki Bulanan Umat MNSBDI', 'Upacara pembacaan Paritta Gongyo bersama dan peringatan Oteshiki untuk mempererat persaudaraan umat MNSBDI.', '2026-08-01 08:00:00+08', '2026-08-01 12:00:00+08', 'Cetya Avalokitesvara Makassar', 150, 'Gongyo', true, true, 'Upasaka Hendra Kurniawan', '{
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
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED EVENT PROPOSAL RUNDOWNS
INSERT INTO public.event_proposal_rundowns (id, event_id, day_date, time_slot, activity, notes) VALUES
('pr1', 'e1', 'Sabtu, 1 Agustus 2026', '08:00 - 08:30', 'Registrasi Umat & Sambutan Panitia', 'Pendaftaran di lobby utama'),
('pr2', 'e1', 'Sabtu, 1 Agustus 2026', '08:30 - 10:30', 'Pembacaan Paritta Gongyo & Doa Bersama', 'Gongyo bersama di Altar Utama'),
('pr3', 'e1', 'Sabtu, 1 Agustus 2026', '10:30 - 12:00', 'Dharma Desana & Ramah Tamah Oteshiki', 'Pesan Dharma & Makan Siang Bersama')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED EVENT SKENARIO KERJA
INSERT INTO public.event_skenario_kerja (id, event_id, day_phase, time_slot, executor_bidang_pj, activity, interbid_bidang_pj, notes) VALUES
('sk1', 'e1', 'H-1 (Jumat, 31 Juli 2026)', '14:00 - 17:00', 'Bidang Umum - Budi Santoso', 'Pemasangan Spanduk, Dekorasi Bunga & Set Up Altar Utama', 'Seksi Ritual - Suryani Dewi', 'Pastikan bunga segar terpasang rapi & lilin merah disiapkan'),
('sk2', 'e1', 'H-1 (Jumat, 31 Juli 2026)', '19:00 - 21:00', 'Bidang Acara - Suryani Dewi', 'Gladi Clean Sound System, Mic Wireless & Protocol Sangha', 'Bidang Umum - Hendra Kurniawan', 'Cek 4 unit mic wireless & pastikan baterai cadangan penuh'),
('sk3', 'e1', 'Hari-H (Sabtu, 1 Agustus 2026)', '07:00 - 08:00', 'Bidang Umum - Budi Santoso', 'Penerimaan Konsumsi & Penataan Ruang Makan Umat', 'Bidang Acara - Suryani Dewi', 'Konfirmasi 150 porsi konsumsi vegetarian telah tiba')
ON CONFLICT (id) DO NOTHING;
