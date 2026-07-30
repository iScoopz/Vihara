import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ViharaEvent, EventProposalRundown } from '@/types/database';

interface EventProposalRundownTabProps {
  event: ViharaEvent;
  onOpenProposalRundownModal: (item?: EventProposalRundown) => void;
  onDeleteProposalRundown: (itemId: string) => void;
}

export const EventProposalRundownTab: React.FC<EventProposalRundownTabProps> = ({
  event,
  onOpenProposalRundownModal,
  onDeleteProposalRundown
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
      <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Rundown Acara (Khusus Proposal Event)
          </h3>
          <p className="text-xs text-slate-500">Jadwal acara resmi yang otomatis dicetak masuk ke dalam Dokumen Proposal Event.</p>
        </div>

        <button
          onClick={() => onOpenProposalRundownModal()}
          className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Plus size={14} />
          <span>Tambah Rundown Proposal</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
              <th className="pb-3 w-10 text-center">No</th>
              <th className="pb-3">Hari / Tanggal</th>
              <th className="pb-3 text-center">Waktu / Jam</th>
              <th className="pb-3">Nama Agenda / Kegiatan</th>
              <th className="pb-3">Keterangan</th>
              <th className="pb-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
            {event.proposal_rundowns && event.proposal_rundowns.length > 0 ? (
              event.proposal_rundowns.map((pr, index) => (
                <tr key={pr.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                  <td className="py-3 text-center font-bold text-slate-500">{index + 1}</td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{pr.day_date}</td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-extrabold text-[11px]">
                      {pr.time_slot}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-purple-950 dark:text-purple-100">{pr.activity}</td>
                  <td className="py-3 text-slate-600 dark:text-slate-400">{pr.notes || '-'}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onOpenProposalRundownModal(pr)}
                        className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 rounded cursor-pointer"
                        title="Edit Rundown Ini"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteProposalRundown(pr.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                        title="Hapus Rundown Ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-400 text-xs italic">
                  Belum ada rundown acara proposal. Klik tombol "Tambah Rundown Proposal" di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
