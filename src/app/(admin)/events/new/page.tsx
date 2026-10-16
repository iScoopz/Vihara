'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { createEvent } from '@/lib/actions/vihara-actions';
import { EventCategory, EventOrgStructure, UmatBagian } from '@/types/database';
import { Button, Field, PageHeader, Panel, buttonClass, inputClass, selectClass } from '@/components/ui/kit';

const BAGIAN_LIST: UmatBagian[] = ['Bintang', 'GM', 'Pro-M 40s', 'Pro-M Progresif', 'Pria', 'Wanita', 'Inspirasi'];

const SCALE_OPTIONS = [
  {
    value: false,
    label: 'Ibadah rutin',
    description: 'Gongyo harian, kebaktian Minggu, doa rutin. Tanpa panitia, susunan acara, atau RAB.'
  },
  {
    value: true,
    label: 'Event besar',
    description: 'Kensyu, seminar, festival. Dengan struktur panitia, susunan acara, jadwal tim, dan RAB.'
  }
];

export default function CreateNewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Routine worship (no committee) is the common case, so it is the default.
  const [isComplex, setIsComplex] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [quota, setQuota] = useState('100');
  const [category, setCategory] = useState<EventCategory>('Gongyo');

  const [pricingPerBagian, setPricingPerBagian] = useState<Record<string, string>>({
    'Bintang': '0',
    'GM': '0',
    'Pro-M 40s': '0',
    'Pro-M Progresif': '0',
    'Pria': '0',
    'Wanita': '0',
    'Inspirasi': '0'
  });

  // Committee fields are only required when isComplex is true.
  const [ketuaName, setKetuaName] = useState('');
  const [sekretarisName, setSekretarisName] = useState('');
  const [bendaharaName, setBendaharaName] = useState('');
  const [pjAcaraName, setPjAcaraName] = useState('');
  const [pjUmumName, setPjUmumName] = useState('');
  const [vipList, setVipList] = useState<string[]>([]);
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
    setSubmitError('');

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

    try {
      await createEvent({
        title,
        description,
        event_date: validEventDate,
        end_date: validEndDate,
        location,
        category,
        is_complex: isComplex,
        is_published: false,
        quota: parseInt(quota, 10) || 100,
        pic_name: isComplex ? ketuaName : 'Pengurus Vihara',
        pricing_per_bagian: formattedPricing,
        org_structure: isComplex ? orgStructure : undefined
      });
    } catch {
      setLoading(false);
      setSubmitError('Event gagal disimpan. Periksa koneksi lalu coba lagi.');
      return;
    }

    setLoading(false);
    router.push('/events');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-20 md:pb-0">
      <Link href="/events" className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft size={14} aria-hidden />
        Daftar event
      </Link>

      <PageHeader title="Buat event" description="Event baru disimpan sebagai draf. Terbitkan dari halaman event saat sudah siap." />

      <form onSubmit={handleSubmit} className="space-y-5">
        <Panel className="p-4 sm:p-5">
          <fieldset>
            <legend className="text-base font-semibold text-ink mb-3">Jenis event</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCALE_OPTIONS.map(option => {
                const checked = isComplex === option.value;
                return (
                  <label
                    key={option.label}
                    className={`flex gap-3 p-3.5 rounded-lg border cursor-pointer ${
                      checked ? 'border-brand bg-brand-soft' : 'border-line-strong hover:bg-surface-2'
                    }`}
                  >
                    <input
                      type="radio"
                      name="event-scale"
                      checked={checked}
                      onChange={() => setIsComplex(option.value)}
                      className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--brand)]"
                    />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-semibold text-ink">{option.label}</span>
                      <span className="block text-xs text-ink-2">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Panel>

        <Panel className="p-4 sm:p-5 space-y-4">
          <h2 className="text-base font-semibold text-ink">Informasi umum</h2>

          <Field label="Judul">
            <input
              type="text"
              required
              placeholder={!isComplex ? 'Contoh: Gongyo Rutin Minggu' : 'Contoh: Kensyu Nasional'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Deskripsi">
            <textarea
              rows={3}
              required
              placeholder="Ringkasan acara dan ketentuan untuk umat"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tanggal mulai">
              <input type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Tanggal selesai (opsional)">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Lokasi">
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Kategori">
              <select value={category} onChange={(e) => setCategory(e.target.value as EventCategory)} className={selectClass}>
                <option value="Gongyo">Gongyo</option>
                <option value="Kensyu">Kensyu</option>
                <option value="Pertemuan">Pertemuan</option>
              </select>
            </Field>
            <Field label="Kuota umat">
              <input
                type="number"
                inputMode="numeric"
                required
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className={`${inputClass} tabular-nums`}
              />
            </Field>
          </div>
        </Panel>

        {isComplex && (
          <Panel className="p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Biaya pendaftaran per bagian</h2>
              <p className="text-xs text-ink-3">Isi 0 jika gratis.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {BAGIAN_LIST.map((bg) => (
                <Field key={bg} label={bg}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-3" aria-hidden>Rp</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="5000"
                      value={pricingPerBagian[bg] || '0'}
                      onChange={(e) => setPricingPerBagian({ ...pricingPerBagian, [bg]: e.target.value })}
                      className={`${inputClass} pl-9 tabular-nums`}
                    />
                  </div>
                </Field>
              ))}
            </div>
          </Panel>
        )}

        {isComplex && (
          <Panel className="p-4 sm:p-5 space-y-4">
            <h2 className="text-base font-semibold text-ink">Panitia inti</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Ketua panitia">
                <input type="text" required={isComplex} value={ketuaName} onChange={(e) => setKetuaName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Sekretaris">
                <input type="text" required={isComplex} value={sekretarisName} onChange={(e) => setSekretarisName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Bendahara">
                <input type="text" required={isComplex} value={bendaharaName} onChange={(e) => setBendaharaName(e.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="PJ Acara dan ritual">
                <input type="text" required={isComplex} value={pjAcaraName} onChange={(e) => setPjAcaraName(e.target.value)} className={inputClass} />
              </Field>
              <Field label="PJ Umum dan logistik">
                <input type="text" required={isComplex} value={pjUmumName} onChange={(e) => setPjUmumName(e.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="space-y-2 pt-4 border-t border-line">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
                <Field label="Tamu undangan khusus (VIP)">
                  <input
                    type="text"
                    placeholder="Contoh: Pengurus wilayah"
                    value={newVipInput}
                    onChange={(e) => setNewVipInput(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Button onClick={handleAddVip} disabled={!newVipInput.trim()}>
                  <Plus size={14} aria-hidden />
                  Tambah tamu
                </Button>
              </div>

              {vipList.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {vipList.map((vip, idx) => (
                    <li key={idx} className="inline-flex items-center gap-1 rounded-lg border border-line-strong bg-surface-2 pl-2.5 text-sm text-ink">
                      {vip}
                      <button
                        type="button"
                        onClick={() => handleRemoveVip(idx)}
                        aria-label={`Hapus ${vip}`}
                        className="w-11 h-11 md:w-9 md:h-9 inline-flex items-center justify-center rounded-lg text-ink-2 hover:text-danger cursor-pointer"
                      >
                        <X size={14} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Panel>
        )}

        {submitError && (
          <p role="alert" className="text-sm text-danger">{submitError}</p>
        )}

        {/* Phones: pinned above the bottom nav so Simpan stays in thumb reach on this long form. */}
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 grid grid-cols-2 gap-2 px-4 py-3 bg-surface border-t border-line md:static md:z-auto md:flex md:justify-end md:p-0 md:bg-transparent md:border-0">
          <Link href="/events" className={buttonClass('secondary')}>
            Batal
          </Link>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan sebagai draf'}
          </Button>
        </div>
      </form>
    </div>
  );
}
