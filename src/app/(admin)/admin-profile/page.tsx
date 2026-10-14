'use client'

import { useState, useEffect, useCallback } from 'react';
import { getProfiles, updateProfile } from '@/lib/actions/vihara-actions';
import { Profile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { Button, Field, PageHeader, Panel, StateMessage, inputClass } from '@/components/ui/kit';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const loadData = useCallback(async () => {
    setLoadState('loading');
    try {
      const profs = await getProfiles();
      let currentAdmin: Profile | undefined;

      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vihara_admin_profile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            currentAdmin = profs.find(p => p.id === parsed.id || p.email === parsed.email);
          } catch {}
        }
      }

      if (!currentAdmin) {
        currentAdmin = profs.find(p => p.role === 'admin');
      }

      if (currentAdmin) {
        setProfile(currentAdmin);
        setFullName(currentAdmin.full_name || '');
        setEmail(currentAdmin.email || '');
        setPhone(currentAdmin.phone || '');
        setBirthDate(currentAdmin.birth_date || '');
        setAddress(currentAdmin.address || '');
        setEmergencyContact(currentAdmin.emergency_contact || '');
      }
      setLoadState('ready');
    } catch (e) {
      console.error('Admin profile load error:', e);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMsg(null);

    try {
      const updatedData = {
        full_name: fullName,
        email: email.trim() || undefined,
        phone: phone,
        birth_date: birthDate,
        address: address,
        emergency_contact: emergencyContact
      };

      // Validate the password first so a rejected form saves nothing.
      if (newPassword.trim()) {
        if (newPassword !== confirmPassword) {
          setSaving(false);
          setMsg({ type: 'error', text: 'Konfirmasi kata sandi tidak sama dengan kata sandi baru.' });
          return;
        }
        if (newPassword.length < 6) {
          setSaving(false);
          setMsg({ type: 'error', text: 'Kata sandi minimal 6 karakter.' });
          return;
        }
      }

      await updateProfile(profile.id, updatedData);

      if (newPassword.trim()) {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setProfile({ ...profile, ...updatedData });
          setSaving(false);
          setMsg({ type: 'error', text: `Data profil tersimpan, tetapi kata sandi gagal diganti: ${error.message}` });
          return;
        }
      }

      const updatedProfileObj = { ...profile, ...updatedData };
      setProfile(updatedProfileObj);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vihara_admin_profile', JSON.stringify(updatedProfileObj));
      }

      setSaving(false);
      setMsg({ type: 'success', text: 'Perubahan profil tersimpan.' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg(null), 4000);
    } catch (err: unknown) {
      setSaving(false);
      const message = err instanceof Error ? err.message : 'Kesalahan tidak dikenal';
      setMsg({ type: 'error', text: `Profil gagal disimpan: ${message}` });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Profil saya" description="Data diri dan kata sandi akun pengurus." />

      {loadState === 'loading' && (
        <Panel><StateMessage kind="loading" title="Memuat profil..." /></Panel>
      )}

      {loadState === 'error' && (
        <Panel>
          <StateMessage
            kind="error"
            title="Profil gagal dimuat."
            description="Periksa koneksi lalu coba lagi."
            action={<Button size="sm" onClick={loadData}>Coba lagi</Button>}
          />
        </Panel>
      )}

      {loadState === 'ready' && !profile && (
        <Panel>
          <StateMessage kind="empty" title="Akun pengurus tidak ditemukan." description="Masuk ulang sebagai pengurus lalu buka halaman ini lagi." />
        </Panel>
      )}

      {loadState === 'ready' && profile && (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Panel className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-ink">Data diri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nama lengkap">
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} autoComplete="name" />
              </Field>
              <Field label="Email login">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
              </Field>
              <Field label="Nomor HP atau WhatsApp">
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputClass} tabular-nums`} autoComplete="tel" />
              </Field>
              <Field label="Tanggal lahir">
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
              </Field>
              <Field label="Alamat" className="sm:col-span-2">
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} autoComplete="street-address" />
              </Field>
              <Field label="Kontak darurat" className="sm:col-span-2">
                <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </Panel>

          <Panel className="p-5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-ink">Kata sandi</h2>
              <p className="text-xs text-ink-3">Biarkan kosong kalau tidak ingin mengganti kata sandi.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Kata sandi baru" hint="Minimal 6 karakter.">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} autoComplete="new-password" />
              </Field>
              <Field label="Ulangi kata sandi baru">
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} autoComplete="new-password" />
              </Field>
            </div>
          </Panel>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
            <div className="min-h-[1.25rem] text-sm">
              {msg?.type === 'success' && <p role="status" className="text-ok">{msg.text}</p>}
              {msg?.type === 'error' && <p role="alert" className="text-danger">{msg.text}</p>}
            </div>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan perubahan'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
