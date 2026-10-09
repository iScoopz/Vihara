import React from 'react';
import { Plus, Edit2, Trash2, ListTodo, FileSpreadsheet } from 'lucide-react';
import { ViharaEvent, EventSkenarioKerja } from '@/types/database';
import { exportSkenarioKerjaToExcel } from '@/lib/export-utils';

interface EventSkenarioKerjaTabProps {
  event: ViharaEvent;
  onOpenSkenarioKerjaModal: (item?: EventSkenarioKerja) => void;
  onDeleteSkenarioKerja: (itemId: string) => void;
}

export const EventSkenarioKerjaTab: React.FC<EventSkenarioKerjaTabProps> = ({
  event,
  onOpenSkenarioKerjaModal,
  onDeleteSkenarioKerja
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ListTodo className="text-amber-500" size={18} />
            <span>Jadwal Kerja Tim & Alur Lapangan</span>
          </h3>
          <p className="text-xs text-slate-500">Alur kerja persiapan tim lapangan beserta penanggung jawab dan koordinasi tugas.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSkenarioKerjaToExcel(event.title, event.skenario_kerja || [])}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
          >
            <FileSpreadsheet size={14} />
            <span>Export Excel (.xls)</span>
          </button>

          <button
            onClick={() => onOpenSkenarioKerjaModal()}
            className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Jadwal Kerja</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
              <th className="pb-3 w-10 text-center">No</th>
              <th className="pb-3">Hari / Tanggal / Tahap</th>
              <th className="pb-3 text-center">Waktu / Jam</th>
              <th className="pb-3">Bidang & Penanggung Jawab</th>
              <th className="pb-3">Detail Kegiatan</th>
              <th className="pb-3">Koordinasi Tugas</th>
              <th className="pb-3">Catatan</th>
              <th className="pb-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
            {event.skenario_kerja && event.skenario_kerja.length > 0 ? (
              event.skenario_kerja.map((sk, index) => (
                <tr key={sk.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                  <td className="py-3 text-center font-bold text-slate-500">{index + 1}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-black text-[11px]">
                      {sk.day_phase}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-extrabold text-[11px]">
                      {sk.time_slot}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{sk.executor_bidang_pj}</td>
                  <td className="py-3 font-extrabold text-purple-950 dark:text-purple-100">{sk.activity}</td>
                  <td className="py-3 font-bold text-sky-700 dark:text-sky-400">{sk.interbid_bidang_pj}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{sk.notes || '-'}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onOpenSkenarioKerjaModal(sk)}
                        className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 rounded cursor-pointer"
                        title="Edit Jadwal Kerja"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteSkenarioKerja(sk.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                        title="Hapus Jadwal Kerja"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-400 text-xs italic">
                  Belum ada jadwal kerja tim. Klik tombol &quot;Tambah Jadwal Kerja&quot; di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
