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
  Crown
} from 'lucide-react';
import { createEvent } from '@/lib/actions/vihara-actions';
import { EventCategory, EventOrgStructure } from '@/types/database';

export default function CreateNewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Core Event Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('Cetya Avalokitesvara Makassar');
  const [quota, setQuota] = useState('100');
  const [category, setCategory] = categoryState();

  function categoryState(): [EventCategory, (c: EventCategory) => void] {
    return useState<EventCategory>('Gongyo');
  }

  const [isComplex, setIsComplex] = useState(true);

  // Structural Leadership Fields
  const [ketuaName, setKetuaName] = useState('Upasaka Hendra Kurniawan');
  const [sekretarisName, setSekretarisName] = useState('Suryani Dewi');
  const [bendaharaName, setBendaharaName] = useState('Budi Santoso');
  const [pjAcaraName, setPjAcaraName] = useState('Suryani Dewi');
  const [pjUmumName, setPjUmumName] = useState('Budi Santoso');
  const [vipList, setVipList] = useState<string[]>(['VIP Pengurus Wilayah Sentra Makassar']);
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
      pic_name: ketuaName,
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
          Isi detail event dan susunan struktur panitia utama (Ketua ➔ Sekben ➔ PJ Acara ➔ PJ Umum & VIP)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="misal: Gongyo & Oteshiki Bulanan Umat MNSBDI"
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
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Lokasi Pelaksanaan</label>
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

        {/* SECTION 2: HIERARKI KEPANITIAAN UTAMA */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="text-amber-500" size={18} />
              <span>2. Struktur Panitia Inti Vihara</span>
            </h3>

            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isComplex}
                onChange={(e) => setIsComplex(e.target.checked)}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="font-bold text-purple-900 dark:text-purple-300">Aktifkan Struktur Panitia Kompleks</span>
            </label>
          </div>

          {isComplex && (
            <div className="space-y-4">
              {/* Level 1: Ketua Panitia */}
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-1">
                <label className="block font-black text-purple-950 dark:text-purple-200 text-xs uppercase">Ketua Panitia Utama</label>
                <input
                  type="text"
                  required
                  value={ketuaName}
                  onChange={(e) => setKetuaName(e.target.value)}
                  className="w-full bg-white dark:bg-purple-900/80 border border-purple-200 dark:border-purple-700 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-900 dark:text-white"
                />
              </div>

              {/* Level 2: Sekben */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">Sekretaris Panitia</label>
                  <input
                    type="text"
                    required
                    value={sekretarisName}
                    onChange={(e) => setSekretarisName(e.target.value)}
                    className="w-full bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">Bendahara Panitia</label>
                  <input
                    type="text"
                    required
                    value={bendaharaName}
                    onChange={(e) => setBendaharaName(e.target.value)}
                    className="w-full bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Level 3: PJ Acara & PJ Bidang Umum */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                  <label className="block font-black text-purple-900 dark:text-purple-200 text-xs uppercase">PJ Acara Utama</label>
                  <input
                    type="text"
                    required
                    value={pjAcaraName}
                    onChange={(e) => setPjAcaraName(e.target.value)}
                    className="w-full bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                  <label className="block font-black text-amber-900 dark:text-amber-300 text-xs uppercase">PJ Bidang Umum Utama</label>
                  <input
                    type="text"
                    required
                    value={pjUmumName}
                    onChange={(e) => setPjUmumName(e.target.value)}
                    className="w-full bg-white dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* VIP List */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                <label className="block font-extrabold text-amber-900 dark:text-amber-300 text-xs">Daftar Tamu VIP</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="misal: VIP Pengurus Wilayah Sentra Makassar"
                    value={newVipInput}
                    onChange={(e) => setNewVipInput(e.target.value)}
                    className="flex-1 bg-white dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddVip}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs shadow cursor-pointer"
                  >
                    + Tambah VIP
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {vipList.map((vip, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px] shadow-sm">
                      <span>👑 {vip}</span>
                      <button type="button" onClick={() => handleRemoveVip(i)} className="text-amber-700 hover:text-rose-600">
                        <Trash2 size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/events"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="gradient-mnsbdi text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 hover:opacity-95 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{loading ? 'Menyimpan Event...' : 'Simpan & Terbitkan Event'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
