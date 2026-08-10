'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CalendarDays, 
  MapPin, 
  Users, 
  Layers, 
  Sparkles,
  Plus,
  Trash2,
  Crown,
  Receipt,
  CheckCircle2,
  Flower2,
  Building2
} from 'lucide-react';
import { createEvent } from '@/lib/actions/vihara-actions';
import { EventCategory, EventOrgStructure, UmatBagian } from '@/types/database';

const BAGIAN_LIST: UmatBagian[] = ['Bintang', 'GM', 'Pro-M 40s', 'Pro-M Progresif', 'Pria', 'Wanita', 'Inspirasi'];

export default function CreateNewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Event Complexity Type Choice (Default: Simple for Ibadah Rutin)
  const [isComplex, setIsComplex] = useState(false);

  // Core Event Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('Cetya Avalokitesvara Makassar');
  const [quota, setQuota] = useState('100');
  const [category, setCategory] = useState<EventCategory>('Gongyo');

  // Tiered Pricing per Bagian State
  const [pricingPerBagian, setPricingPerBagian] = useState<Record<string, string>>({
    'Bintang': '0',
    'GM': '0',
    'Pro-M 40s': '0',
    'Pro-M Progresif': '0',
    'Pria': '0',
    'Wanita': '0',
    'Inspirasi': '0'
  });

  // Structural Leadership Fields (Only required if isComplex === true)
  const [ketuaName, setKetuaName] = useState('Upasaka Hendra Kurniawan');
  const [sekretarisName, setSekretarisName] = useState('Suryani Dewi');
  const [bendaharaName, setBendaharaName] = useState('Budi Santoso');
  const [pjAcaraName, setPjAcaraName] = useState('Suryani Dewi');
  const [pjUmumName, setPjUmumName] = useState('Budi Santoso');
  const [vipList, setVipList] = useState<string[]>(['VIP Pengurus Wilasia Sentra Makassar']);
  const [newVipInput, setNewVipInput] = useState('');

  const handleAddVip = () => {
    if (newVipInput.trim()) {
      setVipList([...vipList, newVipInput.trim()]);
      setNewVipInput('');
    }
  };

  const handleRemoveVip = (index: number) => {
    setVipList(vipList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const orgStructure: EventOrgStructure = {
      ketua_name: ketuaName,
      sekretaris_name: sekretarisName,
      bendahara_name: bendaharaName,
      pj_acara_name: pjAcaraName,
      pj_umum_name: pjUmumName,
      sub_acara: [
        { id: 'sub_a1', role_name: 'Seksi Ritual Gongyo & Altar Utama', pic_name: pjAcaraName }
      ],
      sub_umum: [
        { id: 'sub_u1', role_name: 'Seksi Akomodasi & Transportasi', pic_name: pjUmumName }
      ],
      vip_list: vipList
    };

    const parsedDate = eventDate ? new Date(eventDate) : new Date();
    const validEventDate = isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

    let validEndDate: string | undefined = undefined;
    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (!isNaN(parsedEnd.getTime())) {
        validEndDate = parsedEnd.toISOString();
      }
    }

    const formattedPricing: Record<string, number> = {};
    Object.entries(pricingPerBagian).forEach(([bagianKey, valStr]) => {
      formattedPricing[bagianKey] = parseFloat(valStr) || 0;
    });

    await createEvent({
      title,
      description,
      event_date: validEventDate,
      end_date: validEndDate,
      location,
      category,
      is_complex: isComplex,
      is_published: false, // Default Sebagai Draf / Perencanaan
      quota: parseInt(quota, 10) || 100,
      pic_name: isComplex ? ketuaName : 'Pengurus Vihara',
      pricing_per_bagian: formattedPricing,
      org_structure: isComplex ? orgStructure : undefined
    });

    setLoading(false);
    router.push('/events');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Batal & Kembali</span>
        </Link>

        <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
          Wizard Pembuatan Event
        </span>
      </div>

      {/* Main Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-2 border border-purple-700/50">
        <h1 className="text-2xl font-black tracking-tight">Form Pembuatan Event Baru</h1>
        <p className="text-xs text-purple-200 leading-relaxed">
          Pilih tipe event: **Event Simpel / Ibadah Rutin** (tanpa panitia) atau **Event Kompleks / Besar** (dilengkapi struktur panitia, rundown, & RAB).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* EVENT COMPLEXITY TYPE SELECTION */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3 text-xs">
          <label className="block font-black text-slate-900 dark:text-white text-sm">
            Pilih Skala & Tipe Event:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OPTION 1: EVENT SIMPEL / IBADAH RUTIN */}
            <div
              onClick={() => setIsComplex(false)}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 relative ${
                !isComplex
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-purple-900/60 bg-slate-50/50 dark:bg-purple-950/40 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">
                  <Flower2 size={20} className="text-emerald-600" />
                  <span>Event Simpel / Ibadah Rutin</span>
                </div>
                {!isComplex && <CheckCircle2 size={18} className="text-emerald-600" />}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Cocok untuk Gongyo Harian, Kebaktian Minggu, Doa Rutin, Oteshiki Rutin. **Praktis & Simpel tanpa perlu mengisi Struktur Panitia, Rundown, maupun RAB.**
              </p>
            </div>

            {/* OPTION 2: EVENT KOMPLEKS / BESAR */}
            <div
              onClick={() => setIsComplex(true)}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 relative ${
                isComplex
                  ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 shadow-sm'
                  : 'border-slate-200 dark:border-purple-900/60 bg-slate-50/50 dark:bg-purple-950/40 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-purple-950 dark:text-purple-200 text-sm">
                  <Building2 size={20} className="text-purple-600" />
                  <span>Event Kompleks / Besar</span>
                </div>
                {isComplex && <CheckCircle2 size={18} className="text-purple-600" />}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Cocok untuk Kensyu, Seminar, Festival Besar. **Lengkap dengan Struktur Kepanitiaan (Ketua ➔ Sekben ➔ PJ), Rundown Proposal, Skenario Kerja, & RAB.**
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: INFORMASI UTAMA EVENT */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
            <CalendarDays className="text-purple-600 dark:text-purple-400" size={18} />
            <span>1. Informasi Umum Event</span>
          </h3>

          <div>
            <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Judul Event / Kegiatan</label>
            <input
              type="text"
              required
              placeholder={!isComplex ? "misal: Kebaktian Gongyo Rutin Minggu" : "misal: Gongyo & Oteshiki Bulanan Umat MNSBDI"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Kegiatan</label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan ringkasan acara, tujuan kebaktian, atau ketentuan untuk umat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Event</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tanggal Selesai (Opsional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Lokasi Kegiatan</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Kategori Event (MNSBDI)</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-purple-900 dark:text-purple-200 focus:outline-none focus:border-purple-600"
              >
                <option value="Gongyo">Gongyo</option>
                <option value="Kensyu">Kensyu</option>
                <option value="Pertemuan">Pertemuan</option>
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Target Kuota Umat</label>
              <input
                type="number"
                required
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: BIAYA EVENT PER BAGIAN UMAT (HANYA DITAMPILKAN JIKA EVENT KOMPLEKS) */}
        {isComplex && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 text-xs">
            <div className="border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="text-emerald-500" size={18} />
                <span>2. Pengaturan Biaya Pendaftaran Event per Bagian Umat</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                Tentukan nominal biaya (Rp) untuk masing-masing Bagian Umat. Masukkan 0 jika Gratis.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {BAGIAN_LIST.map((bg) => (
                <div key={bg} className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 space-y-1.5">
                  <label className="block font-black text-purple-950 dark:text-purple-200 text-xs">{bg}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[11px] font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={pricingPerBagian[bg] || '0'}
                      onChange={(e) => setPricingPerBagian({ ...pricingPerBagian, [bg]: e.target.value })}
                      className="w-full bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: HIERARKI KEPANITIAAN UTAMA (HANYA DITAMPILKAN JIKA EVENT KOMPLEKS) */}
        {isComplex && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="text-amber-500" size={18} />
                <span>3. Struktur Panitia Inti Pelaksana Event</span>
              </h3>
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">Tipe Event Kompleks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Ketua Panitia Event</label>
                <input
                  type="text"
                  required={isComplex}
                  placeholder="Nama Ketua Panitia..."
                  value={ketuaName}
                  onChange={(e) => setKetuaName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sekretaris Panitia</label>
                <input
                  type="text"
                  required={isComplex}
                  placeholder="Nama Sekretaris..."
                  value={sekretarisName}
                  onChange={(e) => setSekretarisName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Bendahara Event</label>
                <input
                  type="text"
                  required={isComplex}
                  placeholder="Nama Bendahara..."
                  value={bendaharaName}
                  onChange={(e) => setBendaharaName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">PJ Seksi Acara & Ritual</label>
                <input
                  type="text"
                  required={isComplex}
                  placeholder="Nama PJ Seksi Acara..."
                  value={pjAcaraName}
                  onChange={(e) => setPjAcaraName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">PJ Seksi Umum & Logistik</label>
                <input
                  type="text"
                  required={isComplex}
                  placeholder="Nama PJ Seksi Umum..."
                  value={pjUmumName}
                  onChange={(e) => setPjUmumName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>

            {/* VIP LIST INPUT */}
            <div className="space-y-2 pt-2 border-t border-purple-100 dark:border-purple-900/60">
              <label className="block font-extrabold text-slate-700 dark:text-slate-300">Daftar Tamu VIP / Undangan Khusus</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah Tamu VIP / Pengurus Wilayah..."
                  value={newVipInput}
                  onChange={(e) => setNewVipInput(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={handleAddVip}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah VIP</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {vipList.map((vip, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 font-extrabold text-[11px] flex items-center gap-1.5">
                    <span>👑 {vip}</span>
                    <button type="button" onClick={() => handleRemoveVip(idx)} className="text-amber-700 hover:text-amber-950 dark:text-amber-300">
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl gradient-mnsbdi text-white font-black text-xs hover:opacity-95 transition cursor-pointer shadow-lg shadow-purple-500/25 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan & Buat Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
