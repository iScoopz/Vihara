import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ViharaEvent, EventProposalRundown } from '@/types/database';
import { Button, Fab, IconButton, Panel, RowActions, StateMessage } from '@/components/ui/kit';
import ConfirmModal from '@/components/ui/confirm-modal';

interface EventProposalRundownTabProps {
  event: ViharaEvent;
  onOpenProposalRundownModal: (item?: EventProposalRundown) => void;
  onDeleteProposalRundown: (itemId: string) => void;
}

const th = 'sticky top-0 z-10 bg-surface-2 border-b border-line py-2.5 px-4 font-medium first:rounded-tl-xl last:rounded-tr-xl';

export const EventProposalRundownTab: React.FC<EventProposalRundownTabProps> = ({
  event,
  onOpenProposalRundownModal,
  onDeleteProposalRundown
}) => {
  const rows = event.proposal_rundowns || [];
  const [pendingDelete, setPendingDelete] = useState<EventProposalRundown | null>(null);

  return (
    <div className="space-y-4 pb-16 md:pb-0 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Susunan acara proposal</h2>
          <p className="text-sm text-ink-2">Jadwal ini tercetak di dokumen proposal kegiatan.</p>
        </div>
        <Button variant="primary" onClick={() => onOpenProposalRundownModal()} className="max-md:hidden">
          <Plus size={14} aria-hidden />
          Tambah susunan acara
        </Button>
      </div>

      {rows.length === 0 ? (
        <Panel>
          <StateMessage kind="empty" title="Belum ada susunan acara." description="Tambahkan agenda agar muncul di proposal." />
        </Panel>
      ) : (
        <Panel>
          <div className="hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-ink-3">
                  <th scope="col" className={`${th} w-12`}>No</th>
                  <th scope="col" className={th}>Hari/tanggal</th>
                  <th scope="col" className={th}>Waktu</th>
                  <th scope="col" className={th}>Agenda</th>
                  <th scope="col" className={th}>Keterangan</th>
                  <th scope="col" className={th}><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((pr, index) => (
                  <tr key={pr.id} className="hover:bg-surface-2">
                    <td className="py-2 px-4 tabular-nums text-ink-3">{index + 1}</td>
                    <td className="py-2 px-4 text-ink">{pr.day_date}</td>
                    <td className="py-2 px-4 tabular-nums text-ink-2 whitespace-nowrap">{pr.time_slot}</td>
                    <td className="py-2 px-4 font-medium text-ink">{pr.activity}</td>
                    <td className="py-2 px-4 text-ink-2">{pr.notes || '-'}</td>
                    <td className="py-1 px-4">
                      <div className="flex justify-end gap-1">
                        <IconButton label={`Ubah ${pr.activity}`} onClick={() => onOpenProposalRundownModal(pr)}>
                          <Edit2 size={15} aria-hidden />
                        </IconButton>
                        <IconButton label={`Hapus ${pr.activity}`} tone="danger" onClick={() => setPendingDelete(pr)}>
                          <Trash2 size={15} aria-hidden />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="lg:hidden divide-y divide-line">
            {rows.map((pr, index) => (
              <li key={pr.id} className="p-3.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink break-words">
                    <span className="tabular-nums text-ink-3 font-normal mr-1.5">{index + 1}.</span>
                    {pr.activity}
                  </p>
                  <p className="text-xs text-ink-2 mt-0.5">
                    {pr.day_date}, <span className="tabular-nums">{pr.time_slot}</span>
                  </p>
                  {pr.notes && <p className="text-xs text-ink-3 mt-0.5 break-words">{pr.notes}</p>}
                </div>
                <div className="flex shrink-0 -mt-1.5 -mr-1.5">
                  <IconButton label={`Ubah ${pr.activity}`} onClick={() => onOpenProposalRundownModal(pr)}>
                    <Edit2 size={16} aria-hidden />
                  </IconButton>
                  <RowActions
                    title={pr.activity}
                    actions={[{ label: 'Hapus agenda', tone: 'danger', icon: <Trash2 size={16} />, onSelect: () => setPendingDelete(pr) }]}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <ConfirmModal
        isOpen={pendingDelete !== null}
        title="Hapus agenda?"
        message={pendingDelete ? `${pendingDelete.activity} akan dihapus dari susunan acara.` : ''}
        onConfirm={() => {
          if (pendingDelete) onDeleteProposalRundown(pendingDelete.id);
        }}
        onClose={() => setPendingDelete(null)}
      />

      <Fab label="Tambah agenda" icon={<Plus size={18} />} onClick={() => onOpenProposalRundownModal()} />
    </div>
  );
};
