'use client'

import { useState, useEffect } from 'react';
import { UserCheck, MapPin, Building, Phone, Calendar, History, CheckCircle2, Compass, Home } from 'lucide-react';
import { getProfileById, findLoginProfile, updateProfile, getUserRegistrationHistory } from '@/lib/actions/vihara-actions';
import { Profile, ViharaEvent } from '@/types/database';

export default function MemberProfilePage() {
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<{ event: ViharaEvent; method: string; isAttended: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  // Login form state for Umat
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Edit Profile Form State
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSentra, setEditSentra] = useState('Sentra Makassar');
  const [editCetya, setEditCetya] = useState('');
  const [editHan, setEditHan] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const loadProfileData = async (userId: string) => {
    setLoading(true);
    const [me, history] = await Promise.all([
      getProfileById(userId),
      getUserRegistrationHistory(userId)
    ]);
    if (!me) {
      setLoading(false);
      return;
    }

    setProfile(me);
    setEditFullName(me.full_name || '');
    setEditEmail(me.email || '');
    setEditPhone(me.phone || '');
    setEditBirthDate(me.birth_date || '');
    setEditAddress(me.address || '');
    setEditSentra(me.sentra || 'Sentra Makassar');
    setEditCetya(me.cetya || '');
    setEditHan(me.han || '');
    setEditEmergencyContact(me.emergency_contact || '');

    setUserRegistrations(history);
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('vihara_umat_id');
      if (savedId) {
        setLoggedUserId(savedId);
        loadProfileData(savedId);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const handleUmatLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginInput.trim()) return;

    const found = await findLoginProfile(loginInput, 'umat-by-name');

    if (found) {
      localStorage.setItem('vihara_umat_id', found.id);
      setLoggedUserId(found.id);
      loadProfileData(found.id);
    } else {
      setLoginError('Profil Umat tidak ditemukan dengan Email, HAN, atau Nama tersebut.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vihara_umat_id');
    setLoggedUserId(null);
    setProfile(null);
    setUserRegistrations([]);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    await updateProfile(profile.id, {
      full_name: editFullName,
      email: editEmail.trim() || undefined,
      phone: editPhone,
      birth_date: editBirthDate,
      address: editAddress,
      sentra: editSentra,
      cetya: editCetya,
      han: editHan,
      emergency_contact: editEmergencyContact
    });

    setSaveSuccessMsg('Perubahan profil berhasil disimpan.');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    loadProfileData(profile.id);
  };

  if (loading) {
    return <div className="p-16 text-center text-xs font-medium text-[#86868b]">Memuat profil Umat...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto shadow-xs">
          <UserCheck size={22} />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Akses Profil Umat</h1>
          <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
            Masukkan email terdaftar atau kode HAN untuk melihat riwayat kegiatan.
          </p>
        </div>

        {loginError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {loginError}
          </div>
        )}

        <form onSubmit={handleUmatLogin} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Email Umat / Kode HAN / Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Contoh: suryani@vihara.or.id atau HAN Makassar 02"
              className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-black/30 dark:focus:border-white/30 font-medium transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            Buka Profil Saya
          </button>
        </form>

        <div className="pt-4 border-t border-black/[0.04] dark:border-white/[0.06] space-y-2 text-left">
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider block">
            Pilihan Cepat Profil Umat:
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setLoginInput('suryani@vihara.or.id'); }}
              className="w-full px-4 py-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] text-neutral-900 dark:text-white text-xs font-medium border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <span>Suryani Dewi (suryani@vihara.or.id)</span>
              <span className="text-[11px] text-[#5e35b1] dark:text-amber-400 font-semibold">Pilih</span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginInput('budi@vihara.or.id'); }}
              className="w-full px-4 py-2 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] text-neutral-900 dark:text-white text-xs font-medium border border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.04] dark:hover:bg-white/[0.08] text-left flex items-center justify-between cursor-pointer transition-all"
            >
              <span>Budi Santoso (budi@vihara.or.id)</span>
              <span className="text-[11px] text-[#5e35b1] dark:text-amber-400 font-semibold">Pilih</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Apple-style Profile Summary Card */}
      <div className="p-8 sm:p-9 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] text-neutral-900 dark:text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#1d1d1f] dark:bg-white text-white dark:text-black font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
            {profile.full_name.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">{profile.full_name}</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-black/[0.04] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-300 px-2.5 py-0.5 rounded-full border border-black/[0.06] dark:border-white/[0.08]">
                Umat
              </span>
            </div>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
              {profile.bagian ? `Bagian ${profile.bagian}` : 'Umat Vihara'} &bull; {profile.email || 'Email belum diatur'}
            </p>
            <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
              HAN Naungan: <strong className="font-semibold text-neutral-900 dark:text-white">{profile.han || 'HAN Utama'}</strong> ({profile.cetya || 'Cetya Utama'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-center px-4">
            <p className="text-[10px] text-[#86868b] font-semibold uppercase tracking-wider">Partisipasi</p>
            <p className="text-lg font-bold text-neutral-900 dark:text-white">{userRegistrations.length} Event</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 transition-all cursor-pointer"
          >
            Keluar Akun
          </button>
        </div>
      </div>

      {/* Grid Profil & Data Diri Umat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1: Status Naungan Resmi (Read-Only) */}
        <div className="space-y-6">
          <div className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <Compass className="text-[#5e35b1] dark:text-amber-400" size={16} />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Lokasi Naungan Vihara</h2>
            </div>

            <p className="text-xs text-[#86868b] leading-relaxed">
              Lokasi Sentra, Cetya, dan Kelompok HAN bersifat resmi dan diatur secara terpusat oleh Pengurus Admin Vihara.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[#86868b] text-[10px] font-semibold block uppercase mb-0.5">1. Sentra Wilayah</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Compass size={13} className="text-[#86868b]" />
                  {profile.sentra || 'Sentra Makassar'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[#86868b] text-[10px] font-semibold block uppercase mb-0.5">2. Cetya Bernaung</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Building size={13} className="text-[#86868b]" />
                  {profile.cetya || 'Cetya Avalokitesvara Makassar'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
                <span className="text-[#86868b] text-[10px] font-semibold block uppercase mb-0.5">3. Kelompok HAN</span>
                <span className="font-semibold text-neutral-900 dark:text-white text-xs flex items-center gap-1.5">
                  <Home size={13} className="text-[#86868b]" />
                  {profile.han || 'HAN Makassar 01'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 2 & 3: Form Edit Data Diri & Riwayat */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <UserCheck size={16} className="text-amber-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Pengaturan Data Diri Profil Umat</h2>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300">Nama Lengkap Umat</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:border-black/30 dark:focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300">Email Login Terdaftar</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:border-black/30 dark:focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300">No. Handphone / WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:border-black/30 dark:focus:border-white/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:border-black/30 dark:focus:border-white/30"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:border-black/30 dark:focus:border-white/30"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300">Kontak Darurat</label>
                  <input
                    type="text"
                    value={editEmergencyContact}
                    onChange={(e) => setEditEmergencyContact(e.target.value)}
                    className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl px-4 py-2.5 text-xs text-neutral-900 dark:text-white font-medium focus:outline-none focus:border-black/30 dark:focus:border-white/30"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold px-6 py-2.5 rounded-full text-xs shadow-xs transition-all cursor-pointer"
                >
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>

          {/* Riwayat Activity Event */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
              <History className="text-amber-500" size={16} />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Riwayat Kebaktian & Event Umat</h2>
            </div>

            {userRegistrations.length === 0 ? (
              <div className="p-8 text-center text-[#86868b] text-xs">
                Belum ada riwayat partisipasi event.
              </div>
            ) : (
              <div className="space-y-2.5">
                {userRegistrations.map(({ event, method, isAttended }) => (
                  <div key={event.id} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-neutral-900 dark:text-white text-xs">{event.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] text-[#86868b]">
                          {method}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#86868b]">
                        {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; {event.location}
                      </p>
                    </div>

                    <div>
                      {isAttended ? (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Hadir
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                          Terdaftar
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
