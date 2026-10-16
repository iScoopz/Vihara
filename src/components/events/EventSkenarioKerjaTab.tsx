import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import { ViharaEvent, EventSkenarioKerja } from '@/types/database';
import { exportSkenarioKerjaToExcel } from '@/lib/export-utils';
import { Button, Fab, IconButton, Panel, RowActions, StateMessage } from '@/components/ui/kit';
import ConfirmModal from '@/components/ui/confirm-modal';

interface EventSkenarioKerjaTabProps {
  event: ViharaEvent;
  onOpenSkenarioKerjaModal: (item?: EventSkenarioKerja) => void;
  onDeleteSkenarioKerja: (itemId: string) => void;
}

const th = 'sticky top-0 z-10 bg-surface-2 border-b border-line py-2.5 px-4 font-medium first:rounded-tl-xl last:rounded-tr-xl';

export const EventSkenarioKerjaTab: React.FC<EventSkenarioKerjaTabProps> = ({
  event,
  onOpenSkenarioKerjaModal,
  onDeleteSkenarioKerja
}) => {
  const rows = event.skenario_kerja || [];
  const [pendingDelete, setPendingDelete] = useState<EventSkenarioKerja | null>(null);

  return (
    <div className="space-y-4 pb-16 md:pb-0 print:hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Jadwal kerja tim</h2>
          <p className="text-sm text-ink-2">Alur persiapan lapangan, penanggung jawab, dan koordinasi antarbidang.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => exportSkenarioKerjaToExcel(event.title, event.skenario_kerja || [])}>
            <FileSpreadsheet size={14} aria-hidden />
            Unduh Excel
          </Button>
          <Button variant="primary" onClick={() => onOpenSkenarioKerjaModal()} className="max-md:hidden">
            <Plus size={14} aria-hidden />
            Tambah jadwal kerja
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <Panel>
          <StateMessage kind="empty" title="Belum ada jadwal kerja tim." />
        </Panel>
      ) : (
        <Panel>
          {/* Seven text columns need the width left beside the sidebar at xl. */}
          <div className="hidden xl:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-ink-3">
                  <th scope="col" className={`${th} w-12`}>No</th>
                  <th scope="col" className={th}>Hari/tahap</th>
                  <th scope="col" className={th}>Waktu</th>
                  <th scope="col" className={th}>Bidang dan PJ</th>
                  <th scope="col" className={th}>Kegiatan</th>
                  <th scope="col" className={th}>Koordinasi</th>
                  <th scope="col" className={th}>Catatan</th>
                  <th scope="col" className={th}><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((sk, index) => (
                  <tr key={sk.id} className="hover:bg-surface-2 align-top">
                    <td className="py-2 px-4 tabular-nums text-ink-3">{index + 1}</td>
                    <td className="py-2 px-4 text-ink">{sk.day_phase}</td>
                    <td className="py-2 px-4 tabular-nums text-ink-2 whitespace-nowrap">{sk.time_slot}</td>
                    <td className="py-2 px-4 text-ink-2">{sk.executor_bidang_pj}</td>
                    <td className="py-2 px-4 font-medium text-ink">{sk.activity}</td>
                    <td className="py-2 px-4 text-ink-2">{sk.interbid_bidang_pj || '-'}</td>
                    <td className="py-2 px-4 text-ink-2">{sk.notes || '-'}</td>
                    <td className="py-1 px-4">
                      <div className="flex justify-end gap-1">
                        <IconButton label={`Ubah ${sk.activity}`} onClick={() => onOpenSkenarioKerjaModal(sk)}>
                          <Edit2 size={15} aria-hidden />
                        </IconButton>
                        <IconButton label={`Hapus ${sk.activity}`} tone="danger" onClick={() => setPendingDelete(sk)}>
                          <Trash2 size={15} aria-hidden />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="xl:hidden divide-y divide-line">
            {rows.map((sk, index) => (
              <li key={sk.id} className="p-3.5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink break-words">
                    <span className="tabular-nums text-ink-3 font-normal mr-1.5">{index + 1}.</span>
                    {sk.activity}
                  </p>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs text-ink-2">
                    <dt className="text-ink-3">Tahap</dt><dd className="break-words">{sk.day_phase}</dd>
                    <dt className="text-ink-3">Waktu</dt><dd className="tabular-nums">{sk.time_slot}</dd>
                    <dt className="text-ink-3">PJ</dt><dd className="break-words">{sk.executor_bidang_pj || '-'}</dd>
                    <dt className="text-ink-3">Koordinasi</dt><dd className="break-words">{sk.interbid_bidang_pj || '-'}</dd>
                    {sk.notes && (<><dt className="text-ink-3">Catatan</dt><dd className="break-words">{sk.notes}</dd></>)}
                  </dl>
                </div>
                <div className="flex shrink-0 -mt-1.5 -mr-1.5">
                  <IconButton label={`Ubah ${sk.activity}`} onClick={() => onOpenSkenarioKerjaModal(sk)}>
                    <Edit2 size={16} aria-hidden />
                  </IconButton>
                  <RowActions
                    title={sk.activity}
                    actions={[{ label: 'Hapus jadwal', tone: 'danger', icon: <Trash2 size={16} />, onSelect: () => setPendingDelete(sk) }]}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <ConfirmModal
        isOpen={pendingDelete !== null}
        title="Hapus jadwal kerja?"
        message={pendingDelete ? `${pendingDelete.activity} akan dihapus dari jadwal kerja tim.` : ''}
        onConfirm={() => {
          if (pendingDelete) onDeleteSkenarioKerja(pendingDelete.id);
        }}
        onClose={() => setPendingDelete(null)}
      />

      <Fab label="Tambah jadwal" icon={<Plus size={18} />} onClick={() => onOpenSkenarioKerjaModal()} />
    </div>
  );
};
