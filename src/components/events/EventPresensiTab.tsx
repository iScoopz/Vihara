import React from 'react';
import { PlusCircle, CheckCircle2 } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';

interface EventPresensiTabProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
  onOpenRegModal: () => void;
  onToggleAttendance: (regId: string) => void;
}

export const EventPresensiTab: React.FC<EventPresensiTabProps> = ({
  event,
  registrations,
  onOpenRegModal,
  onToggleAttendance
}) => {
  const quota = event.quota || 100;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
      <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Daftar Umat Terdaftar & Presensi Kehadiran
          </h3>
          <p className="text-xs text-slate-500">Tabel presensi umat terdaftar pada event ini.</p>
        </div>

        <button
          onClick={onOpenRegModal}
          className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <PlusCircle size={14} />
          <span>Daftarkan Umat (Admin)</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
              <th className="pb-3 w-10 text-center">No</th>
              <th className="pb-3">Nama Lengkap Umat</th>
              <th className="pb-3">Cetya & HAN</th>
              <th className="pb-3 text-center">Metode Pendaftaran</th>
              <th className="pb-3 text-center">Status Presensi</th>
              <th className="pb-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
            {registrations.length > 0 ? (
              registrations.map((reg, index) => (
                <tr key={reg.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                  <td className="py-3 text-center font-bold text-slate-500">{index + 1}</td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {reg.profile?.full_name || 'Umat Vihara'}
                  </td>
                  <td className="py-3 text-slate-500">
                    {reg.profile?.cetya || '-'} / {reg.profile?.han || '-'}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      reg.registration_method === 'admin'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {reg.registration_method === 'admin' ? 'By Admin' : 'Mandiri'}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center justify-center gap-1 w-fit mx-auto ${
                      reg.is_attended
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                    }`}>
                      <CheckCircle2 size={12} />
                      <span>{reg.is_attended ? 'Hadir Presensi' : 'Belum Presensi'}</span>
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onToggleAttendance(reg.id)}
                      className={`px-3 py-1 rounded-lg font-extrabold text-[11px] cursor-pointer transition ${
                        reg.is_attended
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                      }`}
                    >
                      {reg.is_attended ? 'Batalkan Presensi' : 'Tandai Hadir'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 text-xs italic">
                  Belum ada umat yang mendaftar pada event ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
