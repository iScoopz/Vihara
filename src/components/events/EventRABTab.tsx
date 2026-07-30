import React from 'react';
import { Plus, FileSpreadsheet } from 'lucide-react';
import { ViharaEvent } from '@/types/database';
import { exportRABToExcel } from '@/lib/export-utils';

interface EventRABTabProps {
  event: ViharaEvent;
  onOpenBudgetModal: () => void;
}

export const EventRABTab: React.FC<EventRABTabProps> = ({ event, onOpenBudgetModal }) => {
  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];
  const totalRAB = rabItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 print:hidden">
      <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Rencana Anggaran Biaya (RAB) vs Realisasi
            </h3>
            <p className="text-xs text-slate-500">Kelola item pengeluaran RAB dan pencatatan realisasi dana event.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportRABToExcel(event.title, event.budgets || [])}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900">
            <span className="text-slate-500 font-bold block mb-1">Total Target RAB (Rencana):</span>
            <strong className="text-lg font-black text-purple-950 dark:text-purple-200">
              Rp {totalRAB.toLocaleString('id-ID')}
            </strong>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900">
            <span className="text-slate-500 font-bold block mb-1">Total Realisasi (Aktual):</span>
            <strong className="text-lg font-black text-amber-950 dark:text-amber-200">
              Rp {totalRealisasi.toLocaleString('id-ID')}
            </strong>
          </div>

          <div className={`p-4 rounded-xl border ${
            totalRAB - totalRealisasi >= 0 
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-900 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 text-rose-900 dark:text-rose-300'
          }`}>
            <span className="font-bold block mb-1">Selisih Anggaran:</span>
            <strong className="text-lg font-black">
              Rp {(totalRAB - totalRealisasi).toLocaleString('id-ID')}
            </strong>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                <th className="pb-3 w-10 text-center">No</th>
                <th className="pb-3">Nama Item Pengeluaran</th>
                <th className="pb-3 text-center">Jenis Record</th>
                <th className="pb-3 text-right">Jumlah (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
              {event.budgets && event.budgets.length > 0 ? (
                event.budgets.map((b, i) => (
                  <tr key={b.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                    <td className="py-3 text-center font-bold text-slate-500">{i + 1}</td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{b.item_name}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        b.budget_type === 'rab'
                          ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {b.budget_type === 'rab' ? 'Anggaran RAB' : 'Realisasi'}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900 dark:text-white">
                      Rp {b.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 text-xs italic">
                    Belum ada item anggaran keuangan yang dimasukkan.
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
