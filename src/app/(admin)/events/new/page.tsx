'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, ArrowLeft, Users } from 'lucide-react';
import { getProfiles, createEvent } from '@/lib/actions/vihara-actions';
import { Profile, EventCategory, EventOrgStructure } from '@/types/database';

export default function NewEventPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('Dhammasala MNSBDI');
  const [category, setCategory] = useState<EventCategory>('Gongyo');
  const [isComplex, setIsComplex] = useState(true);
  const [quota, setQuota] = useState('100');
  const [loading, setLoading] = useState(false);

  // Structural Leadership Fields
  const [ketuaName, setKetuaName] = useState('Upasaka Hendra Kurniawan');
  const [sekretarisName, setSekretarisName] = useState('Suryani Dewi');
  const [bendaharaName, setBendaharaName] = useState('Budi Santoso');
  const [pjAcaraName, setPjAcaraName] = useState('Suryani Dewi');
  const [pjUmumName, setPjUmumName] = useState('Budi Santoso');
  const [vipInput, setVipInput] = useState('Bhante / Pandita MNSBDI, Pengurus Pusat MNSBDI');

  useEffect(() => {
    async function loadUmat() {
      const profs = await getProfiles();
      setProfiles(profs);
    }
    loadUmat();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const vipList = vipInput.split(',').map(v => v.trim()).filter(v => v !== '');

    const orgStructure: EventOrgStructure = {
      ketua_name: ketuaName,
      sekretaris_name: sekretarisName,
      bendahara_name: bendaharaName,
      pj_acara_name: pjAcaraName,
      sub_acara: [
        { id: `sub_a_${Date.now()}_1`, role_name: 'Seksi Ritual Gongyo & Daimoku', pic_name: pjAcaraName },
        { id: `sub_a_${Date.now()}_2`, role_name: 'Seksi Pembicara Kensyu MNSBDI', pic_name: sekretarisName }
      ],
      pj_umum_name: pjUmumName,
      sub_umum: [
        { id: `sub_u_${Date.now()}_1`, role_name: 'Seksi Akomodasi & Transportasi Peserta', pic_name: pjUmumName },
        { id: `sub_u_${Date.now()}_2`, role_name: 'Seksi Sound System & Media Pembacaan', pic_name: 'Kevin Tan' },
        { id: `sub_u_${Date.now()}_3`, role_name: 'Seksi Konsumsi Umat MNSBDI', pic_name: 'Lani Wijaya' }
      ],
      vip_list: vipList
    };

    await createEvent({
      title,
      description,
      event_date: new Date(eventDate).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : undefined,
      location,
      category,
      is_complex: isComplex,
      quota: parseInt(quota, 10) || 100,
      pic_name: ketuaName,
      status: 'upcoming',
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
          <span>Kembali ke Daftar Event</span>
        </Link>

        <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
          Form Buat Event MNSBDI
        </span>
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-xl space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-purple-600 dark:text-purple-400" size={28} />
            <span>Buat Event Baru MNSBDI</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pilih Kategori Khusus MNSBDI (Kensyu, Pertemuan, Gongyo) dan pengurus kepanitiaan</p>
        </div>

        <form onSubmit={handleCreateEvent} className="space-y-5 text-xs">
          {/* Tipe Skala Event */}
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 space-y-2">
            <label className="block font-extrabold text-purple-950 dark:text-purple-200">
              Skala Event MNSBDI
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsComplex(false)}
                className={`p-3 rounded-xl border text-left font-bold transition ${
                  !isComplex 
                    ? 'bg-purple-600 text-white border-purple-600 shadow' 
                    : 'bg-white dark:bg-[#160e29] text-slate-700 dark:text-slate-300 border-purple-200 dark:border-purple-800'
                }`}
              >
                <span className="block text-sm font-extrabold mb-0.5">Event Rutin Biasa</span>
                <span className="text-[11px] opacity-90 font-normal">Gongyo harian / pertemuan rutin biasa.</span>
              </button>

              <button
                type="button"
                onClick={() => setIsComplex(true)}
                className={`p-3 rounded-xl border text-left font-bold transition ${
                  isComplex 
                    ? 'bg-purple-600 text-white border-purple-600 shadow' 
                    : 'bg-white dark:bg-[#160e29] text-slate-700 dark:text-slate-300 border-purple-200 dark:border-purple-800'
                }`}
              >
                <span className="block text-sm font-extrabold mb-0.5">Event Skala Besar / Kompleks</span>
                <span className="text-[11px] opacity-90 font-normal">Event Kensyu Besar / Gongyo Akbar dengan hierarki Ketua, Sekben, PJ Acara & PJ Umum.</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Judul Event / Kegiatan MNSBDI
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gongyo & Oteshiki MNSBDI 2568 BE Akbar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div>
            <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi & Agenda Kegiatan
            </label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan rincian agenda Kensyu / Gongyo / Pertemuan MNSBDI..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Mulai Event
              </label>
              <input
                type="datetime-local"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Waktu Selesai Event (Opsional)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-extrabold text-purple-950 dark:text-purple-200 mb-1">
                Kategori Event MNSBDI
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-purple-50 dark:bg-purple-950 border border-purple-300 dark:border-purple-800 rounded-xl px-3 py-2 text-xs font-extrabold text-purple-950 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="Gongyo">Gongyo</option>
                <option value="Kensyu">Kensyu</option>
                <option value="Pertemuan">Pertemuan</option>
              </select>
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                Target Kuota Umat
              </label>
              <input
                type="number"
                required
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* STRUCTURAL LEADERSHIP FOR COMPLEX EVENT */}
          {isComplex && (
            <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-4">
              <h3 className="text-sm font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
                <Users size={18} className="text-amber-500" />
                <span>Struktur Kepanitiaan Utama Event</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Ketua Panitia</label>
                  <input
                    type="text"
                    required
                    value={ketuaName}
                    onChange={(e) => setKetuaName(e.target.value)}
                    className="w-full bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Sekretaris (Sekben)</label>
                  <input
                    type="text"
                    required
                    value={sekretarisName}
                    onChange={(e) => setSekretarisName(e.target.value)}
                    className="w-full bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Bendahara (Sekben)</label>
                  <input
                    type="text"
                    required
                    value={bendaharaName}
                    onChange={(e) => setBendaharaName(e.target.value)}
                    className="w-full bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PJ) Acara</label>
                  <input
                    type="text"
                    required
                    value={pjAcaraName}
                    onChange={(e) => setPjAcaraName(e.target.value)}
                    className="w-full bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold text-purple-900 dark:text-purple-200"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PJ) Bidang Umum</label>
                  <input
                    type="text"
                    required
                    value={pjUmumName}
                    onChange={(e) => setPjUmumName(e.target.value)}
                    className="w-full bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold text-amber-700 dark:text-amber-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">Daftar VIP (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  placeholder="Bhante / Pandita MNSBDI, Pengurus Pusat MNSBDI"
                  value={vipInput}
                  onChange={(e) => setVipInput(e.target.value)}
                  className="w-full bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-purple-100 dark:border-purple-900 flex justify-end gap-3">
            <Link
              href="/events"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="gradient-mnsbdi text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer"
            >
              {loading ? 'Menyimpan...' : 'Simpan & Publikasikan Event MNSBDI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
