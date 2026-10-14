import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ViharaEvent, EventProposalRundown } from '@/types/database';
import { Button, Panel, StateMessage } from '@/components/ui/kit';

interface EventProposalRundownTabProps {
  event: ViharaEvent;
  onOpenProposalRundownModal: (item?: EventProposalRundown) => void;
  onDeleteProposalRundown: (itemId: string) => void;
}

const iconButton =
  'inline-flex items-center justify-center w-11 h-11 sm:w-8 sm:h-8 rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer';

export const EventProposalRundownTab: React.FC<EventProposalRundownTabProps> = ({
  event,
  onOpenProposalRundownModal,
  onDeleteProposalRundown
}) => {
  const rows = event.proposal_rundowns || [];

  const actions = (pr: EventProposalRundown) => (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onOpenProposalRundownModal(pr)}
        className={iconButton}
        aria-label={`Ubah ${pr.activity}`}
      >
        <Edit2 size={15} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onDeleteProposalRundown(pr.id)}
        className={`${iconButton} hover:text-danger hover:bg-danger-soft`}
        aria-label={`Hapus ${pr.activity}`}
      >
        <Trash2 size={15} aria-hidden />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Susunan acara proposal</h2>
          <p className="text-sm text-ink-2">Jadwal ini tercetak di dokumen proposal kegiatan.</p>
        </div>
        <Button variant="primary" onClick={() => onOpenProposalRundownModal()}>
          <Plus size={14} aria-hidden />
          Tambah susunan acara
        </Button>
      </div>

      {rows.length === 0 ? (
        <Panel>
          <StateMessage kind="empty" title="Belum ada susunan acara." description="Tambahkan agenda agar muncul di proposal." />
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <div className="hidden md:block relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs text-ink-3">
                  <th scope="col" className="py-2.5 px-4 font-medium w-12">No</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Hari/tanggal</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Waktu</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Agenda</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Keterangan</th>
                  <th scope="col" className="py-2.5 px-4"><span className="sr-only">Aksi</span></th>
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
                    <td className="py-1 px-4 text-right">{actions(pr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden divide-y divide-line">
            {rows.map((pr, index) => (
              <li key={pr.id} className="p-3.5 flex items-start justify-between gap-3">
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
                {actions(pr)}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
};
