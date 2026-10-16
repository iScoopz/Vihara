import React from 'react';
import { Plus, Edit2, Trash2, FileSpreadsheet } from 'lucide-react';
import { ViharaEvent, EventSkenarioKerja } from '@/types/database';
import { exportSkenarioKerjaToExcel } from '@/lib/export-utils';
import { Button, Panel, StateMessage } from '@/components/ui/kit';

interface EventSkenarioKerjaTabProps {
  event: ViharaEvent;
  onOpenSkenarioKerjaModal: (item?: EventSkenarioKerja) => void;
  onDeleteSkenarioKerja: (itemId: string) => void;
}

const iconButton =
  'inline-flex items-center justify-center w-11 h-11 sm:w-8 sm:h-8 rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer';

export const EventSkenarioKerjaTab: React.FC<EventSkenarioKerjaTabProps> = ({
  event,
  onOpenSkenarioKerjaModal,
  onDeleteSkenarioKerja
}) => {
  const rows = event.skenario_kerja || [];

  const actions = (sk: EventSkenarioKerja) => (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() => onOpenSkenarioKerjaModal(sk)}
        className={iconButton}
        aria-label={`Ubah ${sk.activity}`}
      >
        <Edit2 size={15} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onDeleteSkenarioKerja(sk.id)}
        className={`${iconButton} hover:text-danger hover:bg-danger-soft`}
        aria-label={`Hapus ${sk.activity}`}
      >
        <Trash2 size={15} aria-hidden />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 print:hidden">
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
          <Button variant="primary" onClick={() => onOpenSkenarioKerjaModal()}>
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
        <Panel className="overflow-hidden">
          <div className="hidden md:block relative overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-xs text-ink-3">
                  <th scope="col" className="py-2.5 px-4 font-medium w-12">No</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Hari/tahap</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Waktu</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Bidang dan PJ</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Kegiatan</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Koordinasi</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Catatan</th>
                  <th scope="col" className="py-2.5 px-4"><span className="sr-only">Aksi</span></th>
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
                    <td className="py-1 px-4 text-right">{actions(sk)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden divide-y divide-line">
            {rows.map((sk, index) => (
              <li key={sk.id} className="p-3.5 flex items-start justify-between gap-3">
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
                {actions(sk)}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
};
