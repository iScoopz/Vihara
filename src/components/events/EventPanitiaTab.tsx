import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ViharaEvent } from '@/types/database';
import { Button, Panel } from '@/components/ui/kit';

interface EventPanitiaTabProps {
  event: ViharaEvent;
  onOpenAddSubModal: (type: 'sub_acara' | 'sub_umum') => void;
  onOpenEditSubModal: (type: 'sub_acara' | 'sub_umum', sub: { id: string; role_name: string; pic_name: string }) => void;
  onDeleteSubSection: (type: 'sub_acara' | 'sub_umum', subId: string) => void;
}

type SubSection = { id: string; role_name: string; pic_name: string };

const iconButton =
  'inline-flex items-center justify-center w-11 h-11 sm:w-8 sm:h-8 rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink cursor-pointer';

function NameOrEmpty({ name }: { name?: string }) {
  return name ? <>{name}</> : <span className="font-normal text-ink-3">Belum diisi</span>;
}

export const EventPanitiaTab: React.FC<EventPanitiaTabProps> = ({
  event,
  onOpenAddSubModal,
  onOpenEditSubModal,
  onDeleteSubSection
}) => {
  const org = event.org_structure;

  const renderSubList = (type: 'sub_acara' | 'sub_umum', subs: SubSection[] | undefined, emptyText: string) =>
    subs && subs.length > 0 ? (
      <ul className="divide-y divide-line border-t border-line">
        {subs.map(sub => (
          <li key={sub.id} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink break-words">{sub.role_name}</p>
              <p className="text-xs text-ink-2 break-words">PJ: {sub.pic_name || <span className="text-ink-3">Belum diisi</span>}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onOpenEditSubModal(type, sub)}
                className={iconButton}
                aria-label={`Ubah ${sub.role_name}`}
              >
                <Edit2 size={15} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => onDeleteSubSection(type, sub.id)}
                className={`${iconButton} hover:text-danger hover:bg-danger-soft`}
                aria-label={`Hapus ${sub.role_name}`}
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-ink-3 border-t border-line pt-3">{emptyText}</p>
    );

  return (
    <div className="space-y-4 print:hidden">
      <Panel className="p-5 space-y-4">
        <h2 className="text-base font-semibold text-ink">Panitia inti</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs text-ink-3">Ketua panitia</dt>
            <dd className="text-sm font-medium text-ink"><NameOrEmpty name={org?.ketua_name || event.pic_name} /></dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Sekretaris</dt>
            <dd className="text-sm font-medium text-ink"><NameOrEmpty name={org?.sekretaris_name} /></dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Bendahara</dt>
            <dd className="text-sm font-medium text-ink"><NameOrEmpty name={org?.bendahara_name} /></dd>
          </div>
        </dl>
      </Panel>

      <Panel className="p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Bidang acara dan ritual</h2>
            <p className="text-sm text-ink-2">PJ acara: <span className="font-medium text-ink"><NameOrEmpty name={org?.pj_acara_name} /></span></p>
          </div>
          <Button size="sm" onClick={() => onOpenAddSubModal('sub_acara')}>
            <Plus size={14} aria-hidden />
            Tambah sub-bagian acara
          </Button>
        </div>
        {renderSubList('sub_acara', org?.sub_acara, 'Belum ada sub-bagian acara.')}
      </Panel>

      <Panel className="p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Bidang umum dan logistik</h2>
            <p className="text-sm text-ink-2">PJ umum: <span className="font-medium text-ink"><NameOrEmpty name={org?.pj_umum_name} /></span></p>
          </div>
          <Button size="sm" onClick={() => onOpenAddSubModal('sub_umum')}>
            <Plus size={14} aria-hidden />
            Tambah sub-bagian umum
          </Button>
        </div>
        {renderSubList('sub_umum', org?.sub_umum, 'Belum ada sub-bagian umum.')}
      </Panel>
    </div>
  );
};
