'use client'

import { useState, useEffect } from 'react';
import { UserCheck, MapPin, Building, Phone, Calendar, History, CheckCircle2, Edit2, Compass, Home } from 'lucide-react';
import { getProfiles, getEvents, getRegistrationsForEvent, updateProfile } from '@/lib/actions/vihara-actions';
import { Profile, ViharaEvent } from '@/types/database';

export default function MemberProfilePage() {
  const [loggedUserId, setLoggedUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<{ event: ViharaEvent; method: string; isAttended: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  // Login form state for Umat
  const [loginInput, setLoginInput] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    const profs = await getProfiles();
    const me = profs.find(p => p.id === userId);
    if (!me) {
      setLoading(false);
      return;
    }

    setProfile(me);

    const allEvents = await getEvents();
    const history: { event: ViharaEvent; method: string; isAttended: boolean }[] = [];

    for (const ev of allEvents) {
      const regs = await getRegistrationsForEvent(ev.id);
      const myReg = regs.find(r => r.profile_id === userId);
      if (myReg) {
        history.push({
          event: ev,
          method: myReg.registration_method,
          isAttended: myReg.is_attended
        });
      }
    }
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

    const profs = await getProfiles();
    const query = loginInput.trim().toLowerCase();
    const found = profs.find(p => 
      (p.email && p.email.toLowerCase() === query) ||
      (p.han && p.han.toLowerCase() === query) ||
      (p.full_name && p.full_name.toLowerCase() === query)
    );

    if (found) {
      localStorage.setItem('vihara_umat_id', found.id);
      setLoggedUserId(found.id);
      loadProfileData(found.id);
    } else {
      setLoginError('Profil Umat tidak ditemukan dengan Email / HAN / Nama tersebut.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vihara_umat_id');
    setLoggedUserId(null);
    setProfile(null);
    setUserRegistrations([]);
  };

  const openEditModal = () => {
    if (!profile) return;
    setEditFullName(profile.full_name || '');
    setEditEmail(profile.email || '');
    setEditPhone(profile.phone || '');
    setEditBirthDate(profile.birth_date || '');
    setEditAddress(profile.address || '');
    setEditSentra(profile.sentra || 'Sentra Makassar');
    setEditCetya(profile.cetya || '');
    setEditHan(profile.han || '');
    setEditEmergencyContact(profile.emergency_contact || '');
    setIsEditModalOpen(true);
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

    setSaveSuccessMsg('✓ Profil berhasil diperbarui!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    setIsEditModalOpen(false);
    loadProfileData(profile.id);
  };

  if (loading) {
    return <div className="p-12 text-center text-purple-600 dark:text-purple-300 font-extrabold">Memuat data profil Umat...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl gradient-mnsbdi flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-lg shadow-purple-900/40">
          🪷
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Akses Profil Umat</h2>
          <p className="text-xs text-slate-500">Masukkan Email terdaftar atau Kode HAN Anda untuk melihat profil & riwayat kegiatan.</p>
        </div>

        {loginError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
            {loginError}
          </div>
        )}

        <form onSubmit={handleUmatLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Umat / Kode HAN / Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Contoh: suryani@vihara.or.id atau HAN Makassar 02"
              className="w-full bg-slate-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-semibold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs transition shadow-lg shadow-purple-900/30 hover:opacity-90 cursor-pointer"
          >
            Buka Profil Saya
          </button>
        </form>

        <div className="pt-4 border-t border-purple-100 dark:border-purple-900/60 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Atau Coba Akses Akun Demo Umat:
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => { setLoginInput('suryani@vihara.or.id'); }}
              className="w-full px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 text-xs font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-left flex items-center justify-between"
            >
              <span>Suryani Dewi (suryani@vihara.or.id)</span>
              <span className="text-[10px] text-amber-500 font-black">Pilih →</span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginInput('budi@vihara.or.id'); }}
              className="w-full px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-900 dark:text-purple-200 text-xs font-bold border border-purple-200 dark:border-purple-800 hover:bg-purple-100 text-left flex items-center justify-between"
            >
              <span>Budi Santoso (budi@vihara.or.id)</span>
              <span className="text-[10px] text-amber-500 font-black">Pilih →</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-500" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Profile Header Banner Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-purple-700/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
            {profile.full_name.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{profile.full_name}</h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded shadow">
                Profil Umat Vihara
              </span>
            </div>
            <p className="text-xs text-amber-300 font-semibold">
              {profile.bagian ? `Bagian ${profile.bagian}` : 'Umat Vihara'} &bull; {profile.email || 'Email belum diatur'}
            </p>
            <p className="text-xs text-purple-200">
              HAN Naungan: <strong className="font-mono text-amber-200">{profile.han || 'HAN Utama'}</strong> ({profile.cetya || 'Cetya Utama'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-600/50 text-center px-5">
            <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Total Partisipasi</p>
            <p className="text-xl font-black text-amber-300">{userRegistrations.length} Event</p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition border border-purple-700/50 cursor-pointer shadow"
          >
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>

      {/* Grid Profil & Data Diri Umat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom 1: Status Naungan Resmi (Read-Only Ditetapkan Admin) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-purple-950 dark:text-purple-200 border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <Compass className="text-purple-600 dark:text-purple-400" size={18} />
              <span>Lokasi Naungan Vihara</span>
            </h3>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Lokasi Sentra, Cetya, dan Kelompok HAN bersifat resmi dan diatur secara terpusat oleh Pengurus Admin Vihara.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60">
                <span className="text-slate-400 text-[10px] font-bold block uppercase mb-1">1. Sentra Utama Wilayah</span>
                <span className="font-extrabold text-purple-950 dark:text-purple-200 text-sm flex items-center gap-1.5">
                  <Compass size={14} className="text-purple-600" />
                  {profile.sentra || 'Sentra Makassar'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <span className="text-slate-400 text-[10px] font-bold block uppercase mb-1">2. Cetya Bernaung</span>
                <span className="font-bold text-amber-900 dark:text-amber-300 text-xs flex items-center gap-1.5">
                  <Building size={14} className="text-amber-500" />
                  {profile.cetya || 'Cetya Avalokitesvara Makassar'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800">
                <span className="text-slate-400 text-[10px] font-bold block uppercase mb-1">3. Kelompok HAN Terdaftar</span>
                <span className="font-mono font-black text-purple-900 dark:text-purple-100 text-xs flex items-center gap-1.5">
                  <Home size={14} className="text-purple-500" />
                  {profile.han || 'HAN Makassar 01'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom 2 & 3: Form Edit Data Diri Mandiri Umat & Riwayat */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold text-purple-950 dark:text-purple-200 border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <UserCheck size={18} className="text-amber-500" />
              <span>Pengaturan Data Diri Profil Umat</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Umat</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Login Terdaftar</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. Handphone / WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kontak Darurat</label>
                  <input
                    type="text"
                    value={editEmergencyContact}
                    onChange={(e) => setEditEmergencyContact(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="gradient-mnsbdi text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg hover:opacity-95 transition cursor-pointer"
                >
                  Simpan Perubahan Profil Umat
                </button>
              </div>
            </form>
          </div>

          {/* Riwayat Activity Event */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <History className="text-amber-500" size={18} />
              <span>Riwayat Kebaktian & Event Umat</span>
            </h3>

            {userRegistrations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Belum ada riwayat partisipasi event.
              </div>
            ) : (
              <div className="space-y-3">
                {userRegistrations.map(({ event, method, isAttended }) => (
                  <div key={event.id} className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-purple-950 dark:text-white text-xs">{event.title}</h4>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                          method === 'admin' ? 'bg-purple-200 text-purple-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {method}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {event.location}
                      </p>
                    </div>

                    <div>
                      {isAttended ? (
                        <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Hadir
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
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
