'use client'

import { useState, useEffect } from 'react';
import { UserCheck, Edit2, Shield, Save, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { getProfiles, updateProfile } from '@/lib/actions/vihara-actions';
import { Profile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const profs = await getProfiles();
      let currentAdmin: Profile | undefined;
      
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('vihara_admin_profile');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            currentAdmin = profs.find(p => p.id === parsed.id || p.email === parsed.email);
          } catch (e) {}
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
    }
    loadData();
  }, []);

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

      await updateProfile(profile.id, updatedData);

      // If new password entered, update in Supabase Auth
      if (newPassword.trim()) {
        if (newPassword !== confirmPassword) {
          setSaving(false);
          setMsg({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
          return;
        }
        if (newPassword.length < 6) {
          setSaving(false);
          setMsg({ type: 'error', text: 'Password minimal 6 karakter!' });
          return;
        }

        try {
          const supabase = createClient();
          await supabase.auth.updateUser({ password: newPassword });
        } catch (e) {}
      }

      const updatedProfileObj = { ...profile, ...updatedData };
      setProfile(updatedProfileObj);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vihara_admin_profile', JSON.stringify(updatedProfileObj));
      }

      setSaving(false);
      setMsg({ type: 'success', text: '✓ Profil Pengurus Admin berhasil diperbarui!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMsg(null), 4000);
    } catch (err: any) {
      setSaving(false);
      setMsg({ type: 'error', text: `Gagal memperbarui profil: ${err.message || 'Error'}` });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/60 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-purple-950 dark:text-white flex items-center gap-3">
            <Shield className="text-amber-500" size={28} />
            <span>Pengaturan Profil Admin</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola informasi data diri dan kata sandi akun Pengurus Admin Vihara MNSBDI
          </p>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold border shadow-sm ${
          msg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
        }`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Card 1: Data Diri */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-purple-950 dark:text-purple-200 border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
            <UserCheck size={18} className="text-amber-500" />
            <span>Informasi Pengurus</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Pengurus</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Email Login Admin</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">No. Handphone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Alamat Tempat Tinggal</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Kontak Darurat</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Ubah Password */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-purple-950 dark:text-purple-200 border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
            <KeyRound size={18} className="text-amber-500" />
            <span>Ubah Kata Sandi (Password)</span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kosongkan form kata sandi di bawah jika Anda tidak ingin mengubah password akun Anda saat ini.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                placeholder="Minimal 6 karakter..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                placeholder="Ulangi kata sandi baru..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold px-6 py-2.5 rounded-full text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            {saving ? (
              <span>Menyimpan Perubahan...</span>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Perubahan Profil</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
