import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ViharaEvent } from '@/types/database';
import { Button, IconButton, Panel, RowActions } from '@/components/ui/kit';
import ConfirmModal from '@/components/ui/confirm-modal';

interface EventPanitiaTabProps {
  event: ViharaEvent;
  onOpenAddSubModal: (type: 'sub_acara' | 'sub_umum') => void;
  onOpenEditSubModal: (type: 'sub_acara' | 'sub_umum', sub: { id: string; role_name: string; pic_name: string }) => void;
  onDeleteSubSection: (type: 'sub_acara' | 'sub_umum', subId: string) => void;
}

type SubSection = { id: string; role_name: string; pic_name: string };

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
  const [pendingDelete, setPendingDelete] = useState<{ type: 'sub_acara' | 'sub_umum'; sub: SubSection } | null>(null);

  const renderSubList = (type: 'sub_acara' | 'sub_umum', subs: SubSection[] | undefined, emptyText: string) =>
    subs && subs.length > 0 ? (
      <ul className="divide-y divide-line border-t border-line">
        {subs.map(sub => (
          <li key={sub.id} className="flex items-center justify-between gap-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink break-words">{sub.role_name}</p>
              <p className="text-xs text-ink-2 break-words">PJ: {sub.pic_name || <span className="text-ink-3">Belum diisi</span>}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 -mr-1.5 md:mr-0">
              <IconButton label={`Ubah ${sub.role_name}`} onClick={() => onOpenEditSubModal(type, sub)}>
                <Edit2 size={15} aria-hidden />
              </IconButton>
              <IconButton
                label={`Hapus ${sub.role_name}`}
                tone="danger"
                className="max-md:hidden"
                onClick={() => setPendingDelete({ type, sub })}
              >
                <Trash2 size={15} aria-hidden />
              </IconButton>
              <div className="md:hidden">
                <RowActions
                  title={sub.role_name}
                  actions={[{ label: 'Hapus sub-bagian', tone: 'danger', icon: <Trash2 size={16} />, onSelect: () => setPendingDelete({ type, sub }) }]}
                />
              </div>
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
          <Button onClick={() => onOpenAddSubModal('sub_acara')} className="w-full sm:w-auto">
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
          <Button onClick={() => onOpenAddSubModal('sub_umum')} className="w-full sm:w-auto">
            <Plus size={14} aria-hidden />
            Tambah sub-bagian umum
          </Button>
        </div>
        {renderSubList('sub_umum', org?.sub_umum, 'Belum ada sub-bagian umum.')}
      </Panel>

      <ConfirmModal
        isOpen={pendingDelete !== null}
        title="Hapus sub-bagian?"
        message={pendingDelete ? `${pendingDelete.sub.role_name} akan dihapus dari susunan panitia.` : ''}
        onConfirm={() => {
          if (pendingDelete) onDeleteSubSection(pendingDelete.type, pendingDelete.sub.id);
        }}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};
