import React, { useId, useState } from 'react';
import { Plus, Edit2, Trash2, UserCog } from 'lucide-react';
import { ViharaEvent, Profile, CoreCommittee } from '@/types/database';
import { Button, Field, IconButton, Modal, ModalActions, Panel, RowActions, inputClass } from '@/components/ui/kit';
import ConfirmModal from '@/components/ui/confirm-modal';

interface EventPanitiaTabProps {
  event: ViharaEvent;
  onOpenAddSubModal: (type: 'sub_acara' | 'sub_umum') => void;
  onOpenEditSubModal: (type: 'sub_acara' | 'sub_umum', sub: { id: string; role_name: string; pic_name: string }) => void;
  onDeleteSubSection: (type: 'sub_acara' | 'sub_umum', subId: string) => void;
  profiles?: Profile[];
  onSaveCore: (core: CoreCommittee) => Promise<boolean>;
}

const CORE_FIELDS: { key: Exclude<keyof CoreCommittee, 'vip_list'>; label: string }[] = [
  { key: 'ketua_name', label: 'Ketua panitia' },
  { key: 'sekretaris_name', label: 'Sekretaris' },
  { key: 'bendahara_name', label: 'Bendahara' },
  { key: 'pj_acara_name', label: 'PJ bidang acara dan ritual' },
  { key: 'pj_umum_name', label: 'PJ bidang umum dan logistik' }
];

type SubSection = { id: string; role_name: string; pic_name: string };

function NameOrEmpty({ name }: { name?: string }) {
  return name ? <>{name}</> : <span className="font-normal text-ink-3">Belum diisi</span>;
}

export const EventPanitiaTab: React.FC<EventPanitiaTabProps> = ({
  event,
  onOpenAddSubModal,
  onOpenEditSubModal,
  onDeleteSubSection,
  profiles = [],
  onSaveCore
}) => {
  const org = event.org_structure;
  const [pendingDelete, setPendingDelete] = useState<{ type: 'sub_acara' | 'sub_umum'; sub: SubSection } | null>(null);
  const [coreOpen, setCoreOpen] = useState(false);
  const [coreDraft, setCoreDraft] = useState<Record<string, string>>({});
  const [vipDraft, setVipDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const namesListId = useId();

  const openCoreEditor = () => {
    setCoreDraft({
      ketua_name: org?.ketua_name || event.pic_name || '',
      sekretaris_name: org?.sekretaris_name || '',
      bendahara_name: org?.bendahara_name || '',
      pj_acara_name: org?.pj_acara_name || '',
      pj_umum_name: org?.pj_umum_name || ''
    });
    setVipDraft((org?.vip_list || []).join('\n'));
    setCoreOpen(true);
  };

  const saveCore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSaveCore({
      ketua_name: coreDraft.ketua_name || '',
      sekretaris_name: coreDraft.sekretaris_name || '',
      bendahara_name: coreDraft.bendahara_name || '',
      pj_acara_name: coreDraft.pj_acara_name || '',
      pj_umum_name: coreDraft.pj_umum_name || '',
      vip_list: vipDraft.split('\n')
    });
    setSaving(false);
    if (ok) setCoreOpen(false);
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">Panitia inti</h2>
          <Button onClick={openCoreEditor} className="w-full sm:w-auto">
            <UserCog size={15} aria-hidden />
            Ubah panitia inti
          </Button>
        </div>
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
        {org?.vip_list && org.vip_list.length > 0 && (
          <div className="border-t border-line pt-3">
            <p className="text-xs text-ink-3 mb-1">Tamu kehormatan</p>
            <ul className="flex flex-wrap gap-1.5">
              {org.vip_list.map(vip => (
                <li key={vip} className="text-sm text-ink bg-surface-2 ring-1 ring-inset ring-line rounded-md px-2 py-0.5">{vip}</li>
              ))}
            </ul>
          </div>
        )}
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

      <Modal open={coreOpen} onClose={() => setCoreOpen(false)} title="Ubah panitia inti" size="lg">
        <form onSubmit={saveCore} className="space-y-4">
          <p className="text-sm text-ink-2">Ketik nama atau pilih dari daftar umat. Kosongkan jabatan yang belum ditentukan.</p>
          <datalist id={namesListId}>
            {profiles.map(p => <option key={p.id} value={p.full_name} />)}
          </datalist>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CORE_FIELDS.map(field => (
              <Field key={field.key} label={field.label}>
                <input
                  type="text"
                  list={namesListId}
                  autoComplete="off"
                  value={coreDraft[field.key] || ''}
                  onChange={e => setCoreDraft(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
          <Field label="Tamu kehormatan (VIP)" hint="Satu nama atau instansi per baris">
            <textarea rows={3} value={vipDraft} onChange={e => setVipDraft(e.target.value)} className={`${inputClass} min-h-[88px]`} />
          </Field>
          <ModalActions>
            <Button variant="neutral" onClick={() => setCoreOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan panitia'}</Button>
          </ModalActions>
        </form>
      </Modal>

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
