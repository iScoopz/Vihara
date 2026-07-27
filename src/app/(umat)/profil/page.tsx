'use client'

import { useState, useEffect } from 'react';
import { UserCheck, MapPin, Building, Phone, Calendar, History, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { getProfiles, getEvents, getRegistrationsForEvent } from '@/lib/actions/vihara-actions';
import { Profile, ViharaEvent } from '@/types/database';

export default function MemberProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<{ event: ViharaEvent; method: string; isAttended: boolean }[]>([]);

  const currentUmatId = 'p2'; // Simulated logged-in Umat (Suryani Dewi)

  useEffect(() => {
    async function loadProfileData() {
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
    }

    loadProfileData();
  }, []);

  if (!profile) {
    return <div className="p-8 text-center text-slate-400">Loading profil umat...</div>;
  }

  return (
    <div className="space-y-6">
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
            <p className="text-xs text-purple-200">Terdaftar sejak 2024 • RLS Protected Data</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-600/50 text-center">
            <p className="text-[10px] text-purple-300 font-bold">Total Partisipasi Event</p>
            <p className="text-xl font-black text-amber-300">{userRegistrations.length} Event</p>
          </div>
        </div>
      </div>

      {/* Grid Info & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Data Diri */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-indigo-900 pb-3 flex items-center gap-2">
            <UserCheck className="text-purple-600 dark:text-purple-400" size={18} />
            <span>Informasi Keanggotaan</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Kode HAN (Hasil Akhir Namaskara)</span>
              <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded border border-purple-200 dark:border-purple-800 inline-block">
                {profile.han || 'HAN-Jakarta-02'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Cetya Bernaung</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Building size={14} className="text-amber-500" />
                {profile.cetya || 'Cetya Maitreya'}
              </span>
            </div>

            <div>
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
          </div>
        </div>

        {/* History Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-indigo-900 pb-3 flex items-center gap-2">
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
                <div key={event.id} className="p-4 rounded-xl bg-purple-50/50 dark:bg-indigo-950/60 border border-purple-100 dark:border-indigo-900 flex items-center justify-between">
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
    </div>
  );
}
