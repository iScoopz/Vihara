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
  onCancelRegistration?: (regId: string) => void;
}

export const EventPresensiTab: React.FC<EventPresensiTabProps> = ({
  event,
  registrations,
  onOpenRegModal,
  onToggleAttendance,
  onTogglePayment,
  onToggleExtraFeeForReg,
  onOpenPricingModal,
  onCancelRegistration
}) => {
  const isComplex = event.is_complex ?? true;
  const pricing = event.pricing_per_bagian || {};
  const extraFees = event.extra_fees || [];

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attended' | 'absent'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [copiedWa, setCopiedWa] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeA - timeB;
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

  // SORT BY REGISTRATION ORDER: First to register comes first (No. 1 = earliest created_at)
  const sortedRegistrations = [...registrations].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeA - timeB;
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
              📌 Komponen Biaya Tambahan (Pilihan):
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
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Peserta Terdaftar</span>
            <p className="text-2xl font-black text-purple-950 dark:text-white">
              {registrations.length} Orang
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-1">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Jumlah Hadir</span>
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
              {isComplex ? 'Daftar Peserta & Kehadiran' : 'Daftar Kehadiran Umat'}
            </h3>
            <p className="text-xs text-slate-500">
              {isComplex
                ? 'Kelola status pembayaran dan kehadiran peserta kegiatan.'
                : 'Tandai kehadiran umat yang hadir dalam kegiatan ibadah.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyWaList}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer border shadow-sm ${
                copiedWa
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 border-emerald-200 dark:border-emerald-800'
              }`}
              title="Salin daftar pendaftar event berbentuk teks siap kirim ke WhatsApp"
            >
              {copiedWa ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedWa ? '✓ Berhasil Disalin!' : 'Salin List WA'}</span>
            </button>

            {isComplex && onOpenPricingModal && (
              <button
                onClick={onOpenPricingModal}
                className="px-3.5 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 hover:bg-purple-200 text-purple-900 dark:text-purple-200 font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-purple-200 dark:border-purple-800"
              >
                <Receipt size={14} />
                <span>Atur Biaya</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenRegModal}
              className="px-4 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm border border-purple-700/60 cursor-pointer whitespace-nowrap active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Tambah Peserta</span>
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
              className="w-full bg-slate-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
              className="flex-1 sm:flex-initial bg-slate-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="all">Semua Kehadiran</option>
              <option value="attended">Sudah Hadir</option>
              <option value="absent">Belum Hadir</option>
            </select>

            {isComplex && (
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="flex-1 sm:flex-initial bg-slate-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">Semua Status Pembayaran</option>
                <option value="paid">✓ Lunas</option>
                <option value="unpaid">Belum Lunas</option>
              </select>
            )}
          </div>
        </div>

        {/* Presensi Table Wrapper (Responsive Scrollable Container) */}
        <div className="overflow-x-auto scrollbar-none rounded-xl border border-purple-100 dark:border-purple-900/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-purple-900 text-white font-extrabold border-b border-purple-800">
                <th className="py-3 px-2 text-center w-10">No</th>
                <th className="py-3 px-3">Nama Lengkap Peserta</th>
                <th className="py-3 px-3">Bagian & HAN</th>

                {/* Optional Extra Fees Column (Only Complex) */}
                {isComplex && <th className="py-3 px-3">Biaya Tambahan</th>}
                {isComplex && <th className="py-3 px-3 text-right">Total Biaya</th>}
                {isComplex && <th className="py-3 px-3 text-center">Pembayaran</th>}
                <th className="py-3 px-3 text-center">Kehadiran</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-950/40">
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
                      <td className="py-3 px-2 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {reg.profile?.full_name || 'Umat Vihara'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 mr-1.5">
                          {bagian}
                        </span>
                        <span>{reg.profile?.han || '-'}</span>
                      </td>

                      {/* Optional Extra Fees (Only Complex) */}
                      {isComplex && (
                        <td className="py-3 px-3">
                          {extraFees.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {extraFees.map((fee) => {
                                const isChecked = selectedFeeIds.includes(fee.id);
                                return (
                                  <button
                                    type="button"
                                    key={fee.id}
                                    onClick={() => handleFeeToggle(fee.id)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border flex items-center gap-1 transition cursor-pointer ${
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
                        <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
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
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                          }`}>
                            <span>{isPaid ? '✓ Lunas' : 'Belum Lunas'}</span>
                          </span>
                        </td>
                      )}

                      {/* Presensi Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
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
                      <td className="py-3 px-3 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5 min-w-[220px]">
                          {/* Toggle Payment Button (Only Complex) */}
                          {isComplex && (
                            <button
                              type="button"
                              onClick={() => onTogglePayment(reg.id, totalFee)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition shadow-xs active:scale-95 ${
                                isPaid
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm'
                              }`}
                            >
                              {isPaid ? 'Batalkan Lunas' : 'Tandai Lunas'}
                            </button>
                          )}

                          {/* Toggle Attendance Button */}
                          <button
                            type="button"
                            onClick={() => onToggleAttendance(reg.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition shadow-xs active:scale-95 ${
                              reg.is_attended
                                ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 hover:bg-amber-200 border border-amber-300 dark:border-amber-700/60'
                                : 'bg-purple-700 hover:bg-purple-800 text-white font-extrabold shadow-sm'
                            }`}
                          >
                            {reg.is_attended ? 'Batalkan Hadir' : 'Tandai Hadir'}
                          </button>

                          {/* Cancel Registration Button (Fast Non-blocking Inline Confirmation) */}
                          {onCancelRegistration && (
                            confirmDeleteId === reg.id ? (
                              <div className="inline-flex items-center gap-1 animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onCancelRegistration(reg.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl font-extrabold text-[11px] bg-rose-600 text-white hover:bg-rose-700 active:scale-95 cursor-pointer shadow-sm"
                                  title="Konfirmasi pembatalan pendaftaran"
                                >
                                  Yakin Batal?
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1.5 rounded-xl text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  title="Tutup konfirmasi"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(reg.id)}
                                className="px-2.5 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer transition text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50 active:scale-95"
                                title="Batalkan Pendaftaran Umat"
                              >
                                Batal
                              </button>
                            )
                          )}
                        </div>
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
