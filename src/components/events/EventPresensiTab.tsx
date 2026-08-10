import React, { useState } from 'react';
import { PlusCircle, CheckCircle2, DollarSign, Wallet, AlertCircle, CheckSquare, Receipt, Check, Search, Filter, Share2, Copy } from 'lucide-react';
import { ViharaEvent, EventRegistration, UmatBagian } from '@/types/database';

interface EventPresensiTabProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
  onOpenRegModal: () => void;
  onToggleAttendance: (regId: string) => void;
  onTogglePayment: (regId: string, amount?: number) => void;
  onToggleExtraFeeForReg?: (regId: string, feeId: string, newSelectedIds: string[], newTotalAmount: number) => void;
  onOpenPricingModal?: () => void;
}

export const EventPresensiTab: React.FC<EventPresensiTabProps> = ({
  event,
  registrations,
  onOpenRegModal,
  onToggleAttendance,
  onTogglePayment,
  onToggleExtraFeeForReg,
  onOpenPricingModal
}) => {
  const isComplex = event.is_complex ?? true;
  const pricing = event.pricing_per_bagian || {};
  const extraFees = event.extra_fees || [];

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attended' | 'absent'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [copiedWa, setCopiedWa] = useState(false);

  const handleCopyWaList = () => {
    const dateStr = new Date(event.event_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let waText = `*DAFTAR PESERTA EVENT: ${event.title.toUpperCase()}*\n`;
    waText += `📅 Tanggal: ${dateStr}\n`;
    waText += `📍 Lokasi: ${event.location}\n`;
    waText += `👥 Total: ${registrations.length} Umat\n\n`;

    const sortedRegs = [...registrations].sort((a, b) => {
      const nameA = a.profile?.full_name || '';
      const nameB = b.profile?.full_name || '';
      return nameA.localeCompare(nameB);
    });

    sortedRegs.forEach((r, idx) => {
      waText += `${idx + 1}. ${r.profile?.full_name || 'Umat Vihara'}\n`;
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(waText.trim());
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 3000);
    }
  };

  // Financial & Settlement Calculations (Only if isComplex)
  let totalTargetAmount = 0;
  let totalPaidAmount = 0;
  let countLunas = 0;
  let countHadir = 0;

  registrations.forEach((reg) => {
    if (reg.is_attended) countHadir += 1;

    if (isComplex) {
      const bagian = reg.profile?.bagian || 'Inspirasi';
      const baseFee = pricing[bagian] || 0;
      const selectedFeeIds = reg.selected_extra_fee_ids || [];
      const umatExtraTotal = extraFees
        .filter((f) => selectedFeeIds.includes(f.id))
        .reduce((sum, f) => sum + f.amount, 0);

      const totalFee = baseFee + umatExtraTotal;
      totalTargetAmount += totalFee;

      if (reg.is_paid) {
        countLunas += 1;
        totalPaidAmount += reg.amount_paid !== undefined ? reg.amount_paid : totalFee;
      }
    }
  });

  const totalRemainingAmount = Math.max(0, totalTargetAmount - totalPaidAmount);

  // STABLE SORTING: Always sort alphabetically by Umat's Name to prevent row position jumping
  const sortedRegistrations = [...registrations].sort((a, b) => {
    const nameA = a.profile?.full_name || '';
    const nameB = b.profile?.full_name || '';
    return nameA.localeCompare(nameB);
  });

  // Filter ONLY when search term or filter dropdowns are explicitly active
  const filteredRegistrations = sortedRegistrations.filter((reg) => {
    const name = reg.profile?.full_name || '';
    const han = reg.profile?.han || '';
    const cetya = reg.profile?.cetya || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      han.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cetya.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAttendance =
      attendanceFilter === 'all' ||
      (attendanceFilter === 'attended' && reg.is_attended) ||
      (attendanceFilter === 'absent' && !reg.is_attended);

    const matchesPayment =
      !isComplex ||
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && reg.is_paid) ||
      (paymentFilter === 'unpaid' && !reg.is_paid);

    return matchesSearch && matchesAttendance && matchesPayment;
  });

  return (
    <div className="space-y-6 print:hidden">
      {/* Extra Fees Info Banner (Only for Complex Events) */}
      {isComplex && extraFees.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-extrabold uppercase tracking-wide text-[10px] text-amber-600 dark:text-amber-400">
              📌 Komponen Biaya Tambahan Insidental (Opsional Per Umat):
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {extraFees.map((fee) => (
                <span key={fee.id} className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 font-bold border border-amber-300 dark:border-amber-700">
                  {fee.fee_name}: <span className="font-black text-amber-950 dark:text-amber-100">+ Rp {fee.amount.toLocaleString('id-ID')}</span>
                </span>
              ))}
            </div>
          </div>
          {onOpenPricingModal && (
            <button
              onClick={onOpenPricingModal}
              className="px-3 py-1.5 rounded-xl bg-amber-200 dark:bg-amber-900 hover:bg-amber-300 font-extrabold text-xs text-amber-950 dark:text-amber-100 flex items-center gap-1.5 w-fit transition cursor-pointer"
            >
              <Receipt size={14} />
              <span>Kelola Tarif</span>
            </button>
          )}
        </div>
      )}

      {/* Financial Settlement Overview Summary Cards (Only for Complex Events) */}
      {isComplex ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      ) : (
        /* SIMPLE STATS CARDS FOR IBADAH RUTIN (NO FEES) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Umat Terdaftar</span>
            <p className="text-2xl font-black text-purple-950 dark:text-white">
              {registrations.length} Umat
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Umat Hadir Presensi</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {countHadir} <span className="text-xs font-bold text-slate-500">/ {registrations.length} Hadir ({registrations.length > 0 ? Math.round((countHadir / registrations.length) * 100) : 0}%)</span>
            </p>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {isComplex ? 'Daftar Presensi Umat & Pencatatan Pelunasan Event' : 'Daftar Presensi Umat Ibadah Rutin'}
            </h3>
            <p className="text-xs text-slate-500">
              {isComplex
                ? 'Posisi baris nama umat dijamin stabil. Tandai kehadiran & pelunasan pendaftaran tanpa mengubah urutan baris.'
                : 'Posisi baris nama umat dijamin stabil. Tandai kehadiran presensi umat tanpa kolom biaya.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyWaList}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border shadow-sm ${
                copiedWa
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 border-emerald-200 dark:border-emerald-800'
              }`}
              title="Salin daftar pendaftar event berbentuk teks siap kirim ke WhatsApp"
            >
              {copiedWa ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedWa ? '✓ Copied List WA!' : 'Salin List WA'}</span>
            </button>

            {isComplex && onOpenPricingModal && (
              <button
                onClick={onOpenPricingModal}
                className="px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 text-purple-900 dark:text-purple-200 font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer border border-purple-200 dark:border-purple-800"
              >
                <Receipt size={14} />
                <span>Kelola Tarif & Biaya Tambahan</span>
              </button>
            )}

            <button
              onClick={onOpenRegModal}
              className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap"
            >
              <PlusCircle size={14} />
              <span>Daftarkan Umat (Admin)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1 pb-2 text-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Cari Nama Umat / HAN / Cetya..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={attendanceFilter}
              onChange={(e: any) => setAttendanceFilter(e.target.value)}
              className="bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-purple-600"
            >
              <option value="all">Semua Presensi</option>
              <option value="attended">Hadir Presensi</option>
              <option value="absent">Absen Presensi</option>
            </select>

            {isComplex && (
              <select
                value={paymentFilter}
                onChange={(e: any) => setPaymentFilter(e.target.value)}
                className="bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-purple-600"
              >
                <option value="all">Semua Pelunasan</option>
                <option value="paid">Sudah Lunas</option>
                <option value="unpaid">Belum Lunas</option>
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                <th className="pb-3 w-10 text-center">No</th>
                <th className="pb-3">Nama Lengkap Umat</th>
                <th className="pb-3">Bagian & HAN</th>
                {isComplex && <th className="pb-3">Biaya Tambahan Opsional Umat</th>}
                {isComplex && <th className="pb-3 text-right">Total Biaya</th>}
                {isComplex && <th className="pb-3 text-center">Status Pelunasan</th>}
                <th className="pb-3 text-center">Status Presensi</th>
                <th className="pb-3 text-right">{isComplex ? 'Aksi Pelunasan & Presensi' : 'Aksi Presensi'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
              {filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((reg, index) => {
                  const bagian = reg.profile?.bagian || 'Inspirasi';
                  const baseFee = pricing[bagian] || 0;
                  const selectedFeeIds = reg.selected_extra_fee_ids || [];
                  const umatExtraTotal = extraFees
                    .filter((f) => selectedFeeIds.includes(f.id))
                    .reduce((sum, f) => sum + f.amount, 0);

                  const totalFee = baseFee + umatExtraTotal;
                  const isPaid = Boolean(reg.is_paid);

                  const handleFeeToggle = (feeId: string) => {
                    if (!onToggleExtraFeeForReg) return;
                    let newSelected: string[];
                    if (selectedFeeIds.includes(feeId)) {
                      newSelected = selectedFeeIds.filter((id) => id !== feeId);
                    } else {
                      newSelected = [...selectedFeeIds, feeId];
                    }

                    const newExtraTotal = extraFees
                      .filter((f) => newSelected.includes(f.id))
                      .reduce((sum, f) => sum + f.amount, 0);
                    const newTotal = baseFee + newExtraTotal;

                    onToggleExtraFeeForReg(reg.id, feeId, newSelected, newTotal);
                  };

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

                      {/* Optional Extra Fees (Only Complex) */}
                      {isComplex && (
                        <td className="py-3">
                          {extraFees.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {extraFees.map((fee) => {
                                const isChecked = selectedFeeIds.includes(fee.id);
                                return (
                                  <button
                                    type="button"
                                    key={fee.id}
                                    onClick={() => handleFeeToggle(fee.id)}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border flex items-center gap-1 transition cursor-pointer ${
                                      isChecked
                                        ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                                        : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:text-slate-700'
                                    }`}
                                    title={`Klik untuk ${isChecked ? 'membatalkan' : 'menambahkan'} ${fee.fee_name}`}
                                  >
                                    {isChecked && <Check size={10} />}
                                    <span>{fee.fee_name} (+Rp {fee.amount.toLocaleString('id-ID')})</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Tidak ada biaya ekstra</span>
                          )}
                        </td>
                      )}

                      {/* Total Biaya & Status Pelunasan (Only Complex) */}
                      {isComplex && (
                        <td className="py-3 text-right font-extrabold text-slate-900 dark:text-white">
                          <div>
                            {totalFee > 0 ? `Rp ${totalFee.toLocaleString('id-ID')}` : 'Gratis'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Pokok: Rp {baseFee.toLocaleString('id-ID')}
                            {umatExtraTotal > 0 && ` + Extra: Rp ${umatExtraTotal.toLocaleString('id-ID')}`}
                          </div>
                        </td>
                      )}

                      {isComplex && (
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                          }`}>
                            <span>{isPaid ? '✓ Lunas' : 'Belum Lunas'}</span>
                          </span>
                        </td>
                      )}

                      {/* Presensi Status */}
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

                      {/* Actions */}
                      <td className="py-3 text-right space-x-1.5">
                        {/* Toggle Payment Button (Only Complex) */}
                        {isComplex && (
                          <button
                            onClick={() => onTogglePayment(reg.id, totalFee)}
                            className={`px-2.5 py-1 rounded-lg font-extrabold text-[10px] cursor-pointer transition ${
                              isPaid
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            }`}
                          >
                            {isPaid ? 'Batalkan Lunas' : 'Tandai Lunas'}
                          </button>
                        )}

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
                  <td colSpan={isComplex ? 8 : 5} className="py-6 text-center text-slate-400 text-xs italic">
                    {searchTerm || attendanceFilter !== 'all' || paymentFilter !== 'all'
                      ? 'Tidak ada data umat yang sesuai dengan filter pencarian.'
                      : 'Belum ada umat yang mendaftar pada event ini.'}
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
