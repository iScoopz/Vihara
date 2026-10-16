'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentSession, updateProfile, getUserRegistrationHistory } from '@/lib/actions/vihara-actions';
import { createClient } from '@/lib/supabase/client';
import { Profile, ViharaEvent } from '@/types/database';
import { Badge, Button, Field, Panel, StateMessage, buttonClass, inputClass } from '@/components/ui/kit';

const METHOD_LABELS: Record<string, string> = {
  self: 'Daftar sendiri',
  admin: 'Didaftarkan pengurus'
};

function ValueOrEmpty({ value }: { value?: string | null }) {
  return value ? <>{value}</> : <span className="text-ink-3">Belum diisi</span>;
}

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<{ event: ViharaEvent; method: string; isAttended: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // The profile always comes from the signed-in session.
  const loadProfileData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const session = await getCurrentSession();
      const me = session.profile;
      if (!me) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const history = await getUserRegistrationHistory();

      setProfile(me);
      setEditFullName(me.full_name || '');
      setEditEmail(me.email || '');
      setEditPhone(me.phone || '');
      setEditBirthDate(me.birth_date || '');
      setEditAddress(me.address || '');
      setEditEmergencyContact(me.emergency_contact || '');
      setUserRegistrations(history);
    } catch {
      setLoadError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    setProfile(null);
    setUserRegistrations([]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await updateProfile(profile.id, {
      full_name: editFullName,
      phone: editPhone,
      birth_date: editBirthDate,
      address: editAddress,
      emergency_contact: editEmergencyContact
    });

    setSaveSuccessMsg('Perubahan profil sudah disimpan.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    loadProfileData();
  };

  if (loading) {
    return (
      <Panel className="max-w-md mx-auto">
        <StateMessage kind="loading" title="Memuat profil..." />
      </Panel>
    );
  }

  if (loadError) {
    return (
      <Panel className="max-w-md mx-auto">
        <StateMessage
          kind="error"
          title="Profil belum bisa dimuat"
          description="Periksa koneksi internet, lalu coba lagi."
          action={<Button onClick={() => loadProfileData()}>Coba lagi</Button>}
        />
      </Panel>
    );
  }

  if (!profile) {
    return (
      <Panel raised className="max-w-md mx-auto sm:my-8 p-6 sm:p-7 space-y-5">
        <div className="space-y-2">
          <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
          <h1 className="text-[28px] leading-tight font-semibold text-ink">Profil umat</h1>
          <p className="text-sm text-ink-2">
            Masuk dengan akun umat untuk melihat data diri, mendaftar kegiatan, dan melihat riwayat kehadiran.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/login" className={`${buttonClass('primary')} w-full`}>Masuk</Link>
          <Link href="/login/aktivasi" className={`${buttonClass('secondary')} w-full`}>Aktifkan akun</Link>
        </div>
        <p className="text-xs text-ink-3 border-t border-line pt-4">
          Akun bisa diaktifkan kalau email Anda sudah terdaftar di Data Umat. Belum terdaftar? Hubungi pengurus Cetya atau HAN Anda.
        </p>
      </Panel>
    );
  }


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="w-12 h-12 shrink-0 rounded-full bg-surface-2 border border-line text-ink font-semibold flex items-center justify-center"
            aria-hidden
          >
            {profile.full_name.substring(0, 2).toUpperCase()}
          </span>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[28px] leading-tight font-semibold text-ink">{profile.full_name}</h1>
              <Badge>Umat</Badge>
            </div>
            <p className="text-sm text-ink-2 break-words">
              {profile.bagian ? `Bagian ${profile.bagian}` : 'Umat vihara'} · {profile.email || <span className="text-ink-3">Email belum diisi</span>}
            </p>
          </div>
        </div>

        <Button variant="danger" onClick={handleLogout} className="self-start sm:self-auto">Keluar</Button>
      </div>

      <p className="text-sm text-ink-2">
        <span className="font-display text-4xl font-semibold leading-none tabular-nums text-brand">{userRegistrations.length}</span>{' '}
        kegiatan pernah Anda ikuti atau daftar
      </p>

      {saveSuccessMsg && (
        <p role="status" className="text-sm rounded-lg p-3 bg-ok-soft text-ok">{saveSuccessMsg}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <Panel className="p-5 space-y-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-ink">Naungan</h2>
            <p className="text-xs text-ink-3">Diatur oleh pengurus vihara.</p>
          </div>
          <dl className="divide-y divide-line text-sm">
            <div className="py-2.5 flex justify-between gap-4">
              <dt className="text-ink-3">Sentra</dt>
              <dd className="text-ink font-medium text-right"><ValueOrEmpty value={profile.sentra} /></dd>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <dt className="text-ink-3">Cetya</dt>
              <dd className="text-ink font-medium text-right"><ValueOrEmpty value={profile.cetya} /></dd>
            </div>
            <div className="py-2.5 flex justify-between gap-4">
              <dt className="text-ink-3">Kelompok HAN</dt>
              <dd className="text-ink font-medium text-right"><ValueOrEmpty value={profile.han} /></dd>
            </div>
          </dl>
        </Panel>

        <div className="lg:col-span-2 space-y-6">
          <Panel className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-ink">Data diri</h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama lengkap">
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Email" hint="Email dipakai untuk masuk. Minta pengurus jika ingin menggantinya.">
                  <input type="email" value={editEmail} readOnly className={`${inputClass} bg-surface-2 text-ink-2`} />
                </Field>

                <Field label="Nomor HP / WhatsApp">
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Tanggal lahir">
                  <input
                    type="date"
                    required
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Alamat" className="sm:col-span-2">
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className={inputClass}
                  />
                </Field>

                <Field label="Kontak darurat" className="sm:col-span-2">
                  <input
                    type="text"
                    value={editEmergencyContact}
                    onChange={(e) => setEditEmergencyContact(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" className="w-full sm:w-auto">Simpan perubahan</Button>
              </div>
            </form>
          </Panel>

          <Panel>
            <h2 className="text-sm font-semibold text-ink px-5 pt-5 pb-3">Riwayat kegiatan</h2>

            {userRegistrations.length === 0 ? (
              <StateMessage
                kind="empty"
                title="Belum ada riwayat kegiatan"
                description="Kegiatan yang Anda daftar akan muncul di sini."
              />
            ) : (
              <ul className="divide-y divide-line border-t border-line">
                {userRegistrations.map(({ event, method, isAttended }) => (
                  <li key={event.id} className="px-5 py-3.5 flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-sm font-medium text-ink">{event.title}</h3>
                      <p className="text-xs text-ink-3">
                        {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} · {event.location}
                      </p>
                      <p className="text-xs text-ink-3">{METHOD_LABELS[method] || method}</p>
                    </div>
                    {isAttended ? <Badge tone="ok">Hadir</Badge> : <Badge>Terdaftar</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
