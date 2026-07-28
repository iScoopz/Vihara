'use client'

import { useState, useEffect } from 'react';
import { UserCheck, MapPin, Building, Phone, Calendar, History, CheckCircle2, Edit2, Compass, Home } from 'lucide-react';
import { getProfiles, getEvents, getRegistrationsForEvent, updateProfile } from '@/lib/actions/vihara-actions';
import { Profile, ViharaEvent } from '@/types/database';

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<{ event: ViharaEvent; method: string; isAttended: boolean }[]>([]);
  
  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editSentra, setEditSentra] = useState('Sentra Makassar');
  const [editCetya, setEditCetya] = useState('');
  const [editHan, setEditHan] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const currentUmatId = 'p2'; // Simulated logged-in Umat (Suryani Dewi)

  const loadProfileData = async () => {
    const profs = await getProfiles();
    const me = profs.find(p => p.id === currentUmatId) || profs[1];
    setProfile(me);

    const allEvents = await getEvents();
    const history: { event: ViharaEvent; method: string; isAttended: boolean }[] = [];

    for (const ev of allEvents) {
      const regs = await getRegistrationsForEvent(ev.id);
      const myReg = regs.find(r => r.profile_id === currentUmatId);
      if (myReg) {
        history.push({
          event: ev,
          method: myReg.registration_method,
          isAttended: myReg.is_attended
        });
      }
    }
    setUserRegistrations(history);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const openEditModal = () => {
    if (!profile) return;
    setEditFullName(profile.full_name || '');
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
    loadProfileData();
  };

  if (!profile) {
    return <div className="p-8 text-center text-slate-400">Loading profil umat...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Profile Banner Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-purple-700/50">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg">
            {profile.full_name.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{profile.full_name}</h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400 text-slate-950 px-2 py-0.5 rounded shadow">
                Umat Aktif
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Naungan Wilayah: <strong>{profile.sentra || 'Sentra Makassar'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openEditModal}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition"
          >
            <Edit2 size={16} />
            <span>Edit Profil Saya</span>
          </button>

          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-600/50 text-center">
            <p className="text-[10px] text-purple-300 font-bold">Total Partisipasi Event</p>
            <p className="text-xl font-black text-amber-300">{userRegistrations.length} Event</p>
          </div>
        </div>
      </div>

      {/* Grid Info & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Data Diri */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
            <h3 className="text-base font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
              <UserCheck className="text-purple-600 dark:text-purple-400" size={18} />
              <span>Informasi Keanggotaan</span>
            </h3>

            <button
              onClick={openEditModal}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit2 size={12} /> Edit
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* URUTAN HIERARKI: SENTRA -> CETYA -> HAN */}
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">1. Sentra Utama Wilayah</span>
              <span className="font-extrabold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <Compass size={14} className="text-purple-600" />
                {profile.sentra || 'Sentra Makassar'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">2. Cetya Bernaung</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building size={14} className="text-amber-500" />
                {profile.cetya || 'Cetya Avalokitesvara Makassar'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">3. Kelompok HAN</span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded border border-purple-200 dark:border-purple-800 inline-block">
                <Home size={12} className="inline mr-1" />
                {profile.han || 'HAN Makassar 01'}
              </span>
            </div>

            <div className="pt-2 border-t border-purple-100 dark:border-purple-900/60">
              <span className="text-slate-400 block font-semibold mb-0.5">Nomor Telepon</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Phone size={14} className="text-slate-400" />
                {profile.phone || '081987654321'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Tanggal Lahir</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar size={14} className="text-purple-500" />
                {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Alamat Tempat Tinggal</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-500" />
                {profile.address || 'Belum diisi'}
              </span>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
            <History className="text-amber-500" size={18} />
            <span>Riwayat Partisipasi Event Saya</span>
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
                      <h4 className="font-extrabold text-purple-950 dark:text-white text-sm">{event.title}</h4>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        method === 'admin' ? 'bg-purple-200 text-purple-900' : 'bg-emerald-200 text-emerald-900'
                      }`}>
                        reg: {method}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(event.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {event.location}
                    </p>
                  </div>

                  <div>
                    {isAttended ? (
                      <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Kehadiran Terverifikasi
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                        Terdaftar (Belum Kebaktian)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Profil Umat */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <h3 className="text-lg font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
                <Edit2 size={18} className="text-amber-500" />
                <span>Edit Profil Saya</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-semibold"
                />
              </div>

              {/* HIERARKI: SENTRA -> CETYA -> HAN */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">1. Sentra</label>
                  <input
                    type="text"
                    value={editSentra}
                    onChange={(e) => setEditSentra(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2 py-1.5 text-xs text-purple-950 dark:text-purple-200 font-extrabold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">2. Cetya</label>
                  <input
                    type="text"
                    value={editCetya}
                    onChange={(e) => setEditCetya(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2 py-1.5 text-xs text-amber-700 dark:text-amber-300 font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">3. HAN</label>
                  <input
                    type="text"
                    value={editHan}
                    onChange={(e) => setEditHan(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2 py-1.5 text-xs font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    required
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kontak Darurat</label>
                <input
                  type="text"
                  placeholder="Nama & No HP Keluarga"
                  value={editEmergencyContact}
                  onChange={(e) => setEditEmergencyContact(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
