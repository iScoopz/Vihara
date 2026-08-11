import React from 'react';
import { Plus, FileSpreadsheet, TrendingUp, TrendingDown, DollarSign, Wallet, Users, Trash2, Edit2, CheckCircle2, AlertTriangle, ArrowDown } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';
import { exportRABToExcel } from '@/lib/export-utils';

export interface GroupedBudgetItem {
  key: string;
  itemName: string;
  pemasukan: number;
  rab: number;
  realisasi: number;
  notes: string;
  pemasukanId?: string;
  rabId?: string;
  realisasiId?: string;
}

interface EventRABTabProps {
  event: ViharaEvent;
  registrations?: EventRegistration[];
  onOpenBudgetModal: (initialName?: string, initialType?: 'rab' | 'realisasi' | 'pemasukan') => void;
  onOpenEditBudgetModal?: (item: GroupedBudgetItem) => void;
  onDeleteBudgetItems?: (ids: string[]) => void;
}

export const EventRABTab: React.FC<EventRABTabProps> = ({ 
  event, 
  registrations = [], 
  onOpenBudgetModal,
  onOpenEditBudgetModal,
  onDeleteBudgetItems 
}) => {
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

  // Group budgets by Item Name to prevent duplicate separate rows for RAB and Realisasi
  const groupedMap: Record<string, GroupedBudgetItem> = {};

  (event.budgets || []).forEach((b) => {
    const cleanName = b.item_name.trim();
    const key = cleanName.toLowerCase();
    if (!groupedMap[key]) {
      groupedMap[key] = {
        key,
        itemName: cleanName,
        pemasukan: b.budget_type === 'pemasukan' ? b.amount : 0,
        rab: b.budget_type === 'rab' ? b.amount : 0,
        realisasi: b.budget_type === 'realisasi' ? b.amount : 0,
        notes: b.notes || '',
        pemasukanId: b.budget_type === 'pemasukan' ? b.id : undefined,
        rabId: b.budget_type === 'rab' ? b.id : undefined,
        realisasiId: b.budget_type === 'realisasi' ? b.id : undefined,
      };
    } else {
      if (b.budget_type === 'pemasukan') {
        groupedMap[key].pemasukan += b.amount;
        groupedMap[key].pemasukanId = b.id;
      } else if (b.budget_type === 'rab') {
        groupedMap[key].rab += b.amount;
        groupedMap[key].rabId = b.id;
      } else if (b.budget_type === 'realisasi') {
        groupedMap[key].realisasi += b.amount;
        groupedMap[key].realisasiId = b.id;
      }
    }
  });

  const groupedItems = Object.values(groupedMap);

  return (
    <div className="space-y-6 print:hidden">
      <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Wallet size={18} className="text-purple-600" />
              <span>RAB, Realisasi & Keuangan Kegiatan</span>
            </h3>
            <p className="text-xs text-slate-500">Pencatatan Pemasukan Kegiatan, Biaya Pendaftaran Umat, Target Anggaran RAB, dan Realisasi Pengeluaran Kegiatan.</p>
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
              onClick={() => onOpenBudgetModal()}
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
              (Total {registrations.length} Umat: Rp {totalUmatRegistrationFees.toLocaleString('id-ID')} + Pemasukan Lain: Rp {totalPemasukanManual.toLocaleString('id-ID')})
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
              <span className="text-[11px]">Saldo Keuangan Kegiatan:</span>
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

        {/* Financial Table with Grouped Items & Quick Realisasi Input */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                <th className="pb-3 w-10 text-center">No</th>
                <th className="pb-3">Nama Item / Deskripsi</th>
                <th className="pb-3 text-right text-emerald-600 dark:text-emerald-400">Total Pemasukan (Rp)</th>
                <th className="pb-3 text-right text-purple-600 dark:text-purple-400">Target RAB (Rencana)</th>
                <th className="pb-3 text-right text-amber-600 dark:text-amber-400">Realisasi Pengeluaran</th>
                <th className="pb-3 text-center">Status / Selisih</th>
                <th className="pb-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
              {/* Mandatory Row: Biaya Kegiatan dari Umat Terdaftar */}
              <tr className="bg-emerald-50/70 dark:bg-emerald-950/50 font-black">
                <td className="py-3 text-center text-emerald-700 dark:text-emerald-300">1</td>
                <td className="py-3 text-emerald-950 dark:text-emerald-100 font-extrabold flex items-center gap-1.5">
                  <Users size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Biaya Pendaftaran Kegiatan Umat ({registrations.length} Umat)</span>
                </td>
                <td className="py-3 text-right text-emerald-700 dark:text-emerald-300 font-black text-sm">
                  + Rp {totalUmatRegistrationFees.toLocaleString('id-ID')}
                </td>
                <td className="py-3 text-right text-slate-400">-</td>
                <td className="py-3 text-right text-slate-400">-</td>
                <td className="py-3 text-center">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-100">
                    👥 Biaya Umat
                  </span>
                </td>
                <td className="py-3 text-center text-slate-400 text-[10px] italic">Otomatis</td>
              </tr>

              {groupedItems.length > 0 ? (
                groupedItems.map((item, i) => {
                  const diff = item.realisasi - item.rab;
                  const hasRab = item.rab > 0;
                  const hasRealisasi = item.realisasi > 0;
                  const hasPemasukan = item.pemasukan > 0;
                  const allItemIds = [item.rabId, item.realisasiId, item.pemasukanId].filter(Boolean) as string[];

                  return (
                    <tr key={item.key} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                      <td className="py-3 text-center font-bold text-slate-500">{i + 2}</td>
                      <td className="py-3 font-extrabold text-slate-900 dark:text-white">{item.itemName}</td>
                      
                      {/* Pemasukan */}
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {hasPemasukan ? `+ Rp ${item.pemasukan.toLocaleString('id-ID')}` : '-'}
                      </td>

                      {/* Target RAB */}
                      <td className="py-3 text-right font-bold text-purple-700 dark:text-purple-300">
                        {hasRab ? `Rp ${item.rab.toLocaleString('id-ID')}` : '-'}
                      </td>

                      {/* Realisasi Pengeluaran */}
                      <td className="py-3 text-right font-black text-amber-700 dark:text-amber-300">
                        {hasRealisasi ? `Rp ${item.realisasi.toLocaleString('id-ID')}` : '-'}
                      </td>

                      {/* Status / Selisih */}
                      <td className="py-3 text-center">
                        {hasPemasukan ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                            ✨ Pemasukan
                          </span>
                        ) : hasRab && hasRealisasi ? (
                          diff === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                              <CheckCircle2 size={12} /> Sesuai RAB (Rp 0)
                            </span>
                          ) : diff > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 inline-flex items-center gap-1">
                              <AlertTriangle size={12} /> + Rp {diff.toLocaleString('id-ID')}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                              <ArrowDown size={12} /> Hemat Rp {Math.abs(diff).toLocaleString('id-ID')}
                            </span>
                          )
                        ) : hasRab && !hasRealisasi ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                            📊 Target RAB
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                            💸 Realisasi Langsung
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {hasRab && !hasRealisasi && (
                            <button
                              onClick={() => onOpenBudgetModal(item.itemName, 'realisasi')}
                              className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] flex items-center gap-1 shadow cursor-pointer"
                              title="Tambah Realisasi Pengeluaran untuk item ini"
                            >
                              <Plus size={11} />
                              <span>+ Realisasi</span>
                            </button>
                          )}

                          {onOpenEditBudgetModal && (
                            <button
                              onClick={() => onOpenEditBudgetModal(item)}
                              className="p-1 text-slate-400 hover:text-amber-500 transition cursor-pointer"
                              title="Edit item keuangan ini"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}

                          {onDeleteBudgetItems && (
                            <button
                              onClick={() => onDeleteBudgetItems(allItemIds)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                              title="Hapus seluruh item keuangan ini"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
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

