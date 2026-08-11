import React from 'react';
import { Plus, FileSpreadsheet, TrendingUp, TrendingDown, DollarSign, Wallet, Users } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';
import { exportRABToExcel } from '@/lib/export-utils';

interface EventRABTabProps {
  event: ViharaEvent;
  registrations?: EventRegistration[];
  onOpenBudgetModal: () => void;
}

export const EventRABTab: React.FC<EventRABTabProps> = ({ event, registrations = [], onOpenBudgetModal }) => {
  const pemasukanItems = event.budgets?.filter(b => b.budget_type === 'pemasukan') || [];
  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];

  // Calculate total Umat registration fees for ALL registered Umat (Base Price + Extra Fees)
  const pricing = event.pricing_per_bagian || {};
  const extraFees = event.extra_fees || [];
  let totalUmatRegistrationFees = 0;
  let totalUmatPaidFees = 0;

  registrations.forEach((reg) => {
    const bagian = reg.profile?.bagian || 'Inspirasi';
    const baseFee = pricing[bagian] || 0;
    const selectedFeeIds = reg.selected_extra_fee_ids || [];
    const extraTotal = extraFees
      .filter((f) => selectedFeeIds.includes(f.id))
      .reduce((sum, f) => sum + f.amount, 0);

    const expectedFee = baseFee + extraTotal;
    totalUmatRegistrationFees += expectedFee;

    if (reg.is_paid) {
      totalUmatPaidFees += reg.amount_paid !== undefined ? reg.amount_paid : expectedFee;
    }
  });

  const totalPemasukanManual = pemasukanItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPemasukanGlobal = totalPemasukanManual + totalUmatRegistrationFees;
  const totalRAB = rabItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + curr.amount, 0);
  const saldoKasGlobal = totalPemasukanGlobal - totalRealisasi;

  return (
    <div className="space-y-6 print:hidden">
      <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet size={18} className="text-purple-600" />
              <span>RAB, Realisasi & Dana Paramita (Keuangan Event)</span>
            </h3>
            <p className="text-xs text-slate-500">Pencatatan Pemasukan Dana Paramita, Biaya Pendaftaran Umat, Target Anggaran RAB, dan Realisasi Pengeluaran Event.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportRABToExcel(event.title, event.budgets || [], totalUmatRegistrationFees, registrations.length)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow cursor-pointer"
            >
              <FileSpreadsheet size={14} />
              <span>Export RAB Excel</span>
            </button>

            <button
              onClick={onOpenBudgetModal}
              className="px-3 py-1.5 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1 shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Item Keuangan</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Card Total Pemasukan Global */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold mb-1">
              <span className="text-[11px]">Proyeksi Pemasukan Total:</span>
              <TrendingUp size={14} />
            </div>
            <strong className="text-base font-black text-emerald-950 dark:text-emerald-100 block">
              Rp {totalPemasukanGlobal.toLocaleString('id-ID')}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">
              (Total {registrations.length} Umat: Rp {totalUmatRegistrationFees.toLocaleString('id-ID')} + Paramita: Rp {totalPemasukanManual.toLocaleString('id-ID')})
            </span>
          </div>

          {/* Card Target RAB */}
          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
            <div className="flex items-center justify-between text-purple-800 dark:text-purple-300 font-bold mb-1">
              <span className="text-[11px]">Target RAB (Rencana):</span>
              <DollarSign size={14} />
            </div>
            <strong className="text-base font-black text-purple-950 dark:text-purple-100 block">
              Rp {totalRAB.toLocaleString('id-ID')}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Total Rencana Pengeluaran</span>
          </div>

          {/* Card Realisasi */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-300 font-bold mb-1">
              <span className="text-[11px]">Realisasi (Pengeluaran):</span>
              <TrendingDown size={14} />
            </div>
            <strong className="text-base font-black text-amber-950 dark:text-amber-100 block">
              Rp {totalRealisasi.toLocaleString('id-ID')}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">Pengeluaran Terpakai</span>
          </div>

          {/* Card Saldo Kas */}
          <div className={`p-3.5 rounded-xl border ${
            saldoKasGlobal >= 0 
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-100'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100'
          }`}>
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="text-[11px]">Saldo Keuangan Event:</span>
              <Wallet size={14} />
            </div>
            <strong className="text-base font-black block">
              Rp {saldoKasGlobal.toLocaleString('id-ID')}
            </strong>
            <span className="text-[10px] opacity-80 block mt-0.5">
              {saldoKasGlobal >= 0 ? 'Surplus Anggaran' : 'Defisit Anggaran'}
            </span>
          </div>
        </div>

        {/* Financial Table with Dana Paramita & Total Biaya Event Umat */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                <th className="pb-3 w-10 text-center">No</th>
                <th className="pb-3">Nama Item / Deskripsi</th>
                <th className="pb-3 text-center">Jenis Record</th>
                <th className="pb-3 text-right text-emerald-600 dark:text-emerald-400">Dana Paramita & Biaya Event (Pemasukan)</th>
                <th className="pb-3 text-right text-slate-700 dark:text-slate-300">Pengeluaran (RAB / Realisasi)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
              {/* Mandatory Row: Biaya Event dari Umat Terdaftar */}
              <tr className="bg-emerald-50/70 dark:bg-emerald-950/50 font-black">
                <td className="py-3 text-center text-emerald-700 dark:text-emerald-300">1</td>
                <td className="py-3 text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5">
                  <Users size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Biaya Event Umat Terdaftar ({registrations.length} Umat)</span>
                </td>
                <td className="py-3 text-center">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-100">
                    👥 Biaya Event Umat
                  </span>
                </td>
                <td className="py-3 text-right text-emerald-700 dark:text-emerald-300 text-sm">
                  + Rp {totalUmatRegistrationFees.toLocaleString('id-ID')}
                </td>
                <td className="py-3 text-right text-slate-400">-</td>
              </tr>

              {event.budgets && event.budgets.length > 0 ? (
                event.budgets.map((b, i) => {
                  const isPemasukan = b.budget_type === 'pemasukan';
                  return (
                    <tr key={b.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                      <td className="py-3 text-center font-bold text-slate-500">{i + 2}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{b.item_name}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          b.budget_type === 'pemasukan'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.budget_type === 'rab'
                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {b.budget_type === 'pemasukan' ? '✨ Dana Paramita' : b.budget_type === 'rab' ? '📊 Target RAB' : '💸 Realisasi'}
                        </span>
                      </td>
                      {/* Kolom Dana Paramita (Pemasukan) */}
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {isPemasukan ? `+ Rp ${b.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                      {/* Kolom Pengeluaran */}
                      <td className="py-3 text-right font-black text-slate-900 dark:text-white">
                        {!isPemasukan ? `Rp ${b.amount.toLocaleString('id-ID')}` : '-'}
                      </td>
                    </tr>
                  );
                })
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
