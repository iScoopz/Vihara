import React from 'react';
import { PlusCircle, CheckCircle2, DollarSign, Wallet, AlertCircle, CheckSquare } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';

interface EventPresensiTabProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
  onOpenRegModal: () => void;
  onToggleAttendance: (regId: string) => void;
  onTogglePayment: (regId: string, amount?: number) => void;
}

export const EventPresensiTab: React.FC<EventPresensiTabProps> = ({
  event,
  registrations,
  onOpenRegModal,
  onToggleAttendance,
  onTogglePayment
}) => {
  const pricing = event.pricing_per_bagian || {};

  // Financial & Settlement Calculations
  let totalTargetAmount = 0;
  let totalPaidAmount = 0;
  let countLunas = 0;

  registrations.forEach((reg) => {
    const bagian = reg.profile?.bagian || 'Inspirasi';
    const fee = pricing[bagian] || 0;
    totalTargetAmount += fee;

    if (reg.is_paid) {
      countLunas += 1;
      totalPaidAmount += reg.amount_paid !== undefined ? reg.amount_paid : fee;
    }
  });

  const totalRemainingAmount = Math.max(0, totalTargetAmount - totalPaidAmount);

  return (
    <div className="space-y-6 print:hidden">
      {/* Financial Settlement Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Target Uang Pendaftaran */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Biaya Event</span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              Rp {totalTargetAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-purple-600 dark:text-purple-300 font-bold mt-0.5">
              Dari {registrations.length} Umat Terdaftar
            </p>
          </div>
        </div>

        {/* Card 2: Total Pelunasan Terkumpul */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Terkumpul Lunas</span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              Rp {totalPaidAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              {countLunas} Umat Sudah Lunas
            </p>
          </div>
        </div>

        {/* Card 3: Belum Lunas / Tunggakan */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Belum Lunas</span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertCircle size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400">
              Rp {totalRemainingAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
              {registrations.length - countLunas} Umat Belum Lunas
            </p>
          </div>
        </div>

        {/* Card 4: Rasio Pelunasan */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Status Pelunasan</span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <CheckSquare size={16} />
            </div>
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {registrations.length > 0 ? Math.round((countLunas / registrations.length) * 100) : 0}%
            </p>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              {countLunas} / {registrations.length} Umat
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Daftar Presensi Umat & Pencatatan Pelunasan Event
            </h3>
            <p className="text-xs text-slate-500">
              Tandai kehadiran dan pelunasan biaya event untuk setiap umat terdaftar.
            </p>
          </div>

          <button
            onClick={onOpenRegModal}
            className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
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
                <th className="pb-3">Bagian & HAN</th>
                <th className="pb-3 text-right">Tarif Event</th>
                <th className="pb-3 text-center">Status Pelunasan</th>
                <th className="pb-3 text-center">Status Presensi</th>
                <th className="pb-3 text-right">Aksi Pelunasan & Presensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
              {registrations.length > 0 ? (
                registrations.map((reg, index) => {
                  const bagian = reg.profile?.bagian || 'Inspirasi';
                  const fee = pricing[bagian] || 0;
                  const isPaid = Boolean(reg.is_paid);

                  return (
                    <tr key={reg.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                      <td className="py-3 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {reg.profile?.full_name || 'Umat Vihara'}
                      </td>
                      <td className="py-3 text-slate-500">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 mr-1.5">
                          {bagian}
                        </span>
                        <span>{reg.profile?.han || '-'}</span>
                      </td>
                      <td className="py-3 text-right font-extrabold text-slate-900 dark:text-white">
                        {fee > 0 ? `Rp ${fee.toLocaleString('id-ID')}` : 'Gratis'}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          <span>{isPaid ? '✓ Lunas' : 'Belum Lunas'}</span>
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center justify-center gap-1 w-fit mx-auto ${
                          reg.is_attended
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                        }`}>
                          <CheckCircle2 size={12} />
                          <span>{reg.is_attended ? 'Hadir' : 'Absen'}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        {/* Toggle Payment Button */}
                        <button
                          onClick={() => onTogglePayment(reg.id, fee)}
                          className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] cursor-pointer transition ${
                            isPaid
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                          }`}
                        >
                          {isPaid ? 'Batalkan Lunas' : 'Tandai Lunas'}
                        </button>

                        {/* Toggle Attendance Button */}
                        <button
                          onClick={() => onToggleAttendance(reg.id)}
                          className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] cursor-pointer transition ${
                            reg.is_attended
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                          }`}
                        >
                          {reg.is_attended ? 'Batalkan Presensi' : 'Tandai Hadir'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400 text-xs italic">
                    Belum ada umat yang mendaftar pada event ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
