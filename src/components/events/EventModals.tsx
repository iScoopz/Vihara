import React from 'react';
import { ViharaEvent, Profile, EventProposalRundown, EventSkenarioKerja } from '@/types/database';
import { SearchableUmatSelect } from '@/components/ui/SearchableUmatSelect';
import { Button, Field, Modal, ModalActions, inputClass, selectClass } from '@/components/ui/kit';

interface EventModalsProps {
  event: ViharaEvent;
  profiles: Profile[];
  registeredProfileIds?: string[];
  
  // Proposal Rundown Modal State
  isProposalRundownModalOpen: boolean;
  editingProposalRundown: EventProposalRundown | null;
  prDate: string;
  setPrDate: (val: string) => void;
  prStartTime: string;
  setPrStartTime: (val: string) => void;
  prEndTime: string;
  setPrEndTime: (val: string) => void;
  prActivity: string;
  setPrActivity: (val: string) => void;
  prNotes: string;
  setPrNotes: (val: string) => void;
  onSaveProposalRundown: (e: React.FormEvent) => void;
  onCloseProposalRundownModal: () => void;

  // Skenario Kerja Modal State
  isSkenarioKerjaModalOpen: boolean;
  editingSkenarioKerja: EventSkenarioKerja | null;
  skPhaseTag: string;
  setSkPhaseTag: (val: string) => void;
  skDate: string;
  setSkDate: (val: string) => void;
  skStartTime: string;
  setSkStartTime: (val: string) => void;
  skEndTime: string;
  setSkEndTime: (val: string) => void;
  skExecutorBidangPj: string;
  setSkExecutorBidangPj: (val: string) => void;
  skActivity: string;
  setSkActivity: (val: string) => void;
  skInterbidBidangPj: string;
  setSkInterbidBidangPj: (val: string) => void;
  skNotes: string;
  setSkNotes: (val: string) => void;
  onSaveSkenarioKerja: (e: React.FormEvent) => void;
  onCloseSkenarioKerjaModal: () => void;

  // Add Sub Section Modal State
  isAddSubModalOpen: boolean;
  subSectionType: 'sub_acara' | 'sub_umum';
  subRoleName: string;
  setSubRoleName: (val: string) => void;
  subPicName: string;
  setSubPicName: (val: string) => void;
  onAddSubSection: (e: React.FormEvent) => void;
  onCloseAddSubModal: () => void;

  // Edit Sub Section Modal State
  isEditSubModalOpen: boolean;
  editSubRoleName: string;
  setEditSubRoleName: (val: string) => void;
  editSubPicName: string;
  setEditSubPicName: (val: string) => void;
  onUpdateSubSection: (e: React.FormEvent) => void;
  onCloseEditSubModal: () => void;

  // Admin Registration Modal State
  isRegModalOpen: boolean;
  selectedUmatId: string;
  setSelectedUmatId: (val: string) => void;
  regMsg: string;
  onAdminRegister: (e: React.FormEvent) => void;
  onCloseRegModal: () => void;

  // Budget Modal State
  isBudgetModalOpen: boolean;
  budgetItem: string;
  setBudgetItem: (val: string) => void;
  budgetType: 'rab' | 'realisasi' | 'pemasukan';
  setBudgetType: (val: 'rab' | 'realisasi' | 'pemasukan') => void;
  budgetAmount: string;
  setBudgetAmount: (val: string) => void;
  onAddBudget: (e: React.FormEvent) => void;
  onCloseBudgetModal: () => void;

  // Edit Budget Modal State
  isEditBudgetModalOpen?: boolean;
  editBudgetName?: string;
  setEditBudgetName?: (val: string) => void;
  editRabAmount?: string;
  setEditRabAmount?: (val: string) => void;
  editRealisasiAmount?: string;
  setEditRealisasiAmount?: (val: string) => void;
  editPemasukanAmount?: string;
  setEditPemasukanAmount?: (val: string) => void;
  onSaveEditBudget?: (e: React.FormEvent) => void;
  onCloseEditBudgetModal?: () => void;
}

export const EventModals: React.FC<EventModalsProps> = ({
  event,
  profiles,
  registeredProfileIds = [],
  isProposalRundownModalOpen,
  editingProposalRundown,
  prDate,
  setPrDate,
  prStartTime,
  setPrStartTime,
  prEndTime,
  setPrEndTime,
  prActivity,
  setPrActivity,
  prNotes,
  setPrNotes,
  onSaveProposalRundown,
  onCloseProposalRundownModal,

  isSkenarioKerjaModalOpen,
  editingSkenarioKerja,
  skPhaseTag,
  setSkPhaseTag,
  skDate,
  setSkDate,
  skStartTime,
  setSkStartTime,
  skEndTime,
  setSkEndTime,
  skExecutorBidangPj,
  setSkExecutorBidangPj,
  skActivity,
  setSkActivity,
  skInterbidBidangPj,
  setSkInterbidBidangPj,
  skNotes,
  setSkNotes,
  onSaveSkenarioKerja,
  onCloseSkenarioKerjaModal,

  isAddSubModalOpen,
  subSectionType,
  subRoleName,
  setSubRoleName,
  subPicName,
  setSubPicName,
  onAddSubSection,
  onCloseAddSubModal,

  isEditSubModalOpen,
  editSubRoleName,
  setEditSubRoleName,
  editSubPicName,
  setEditSubPicName,
  onUpdateSubSection,
  onCloseEditSubModal,

  isRegModalOpen,
  selectedUmatId,
  setSelectedUmatId,
  regMsg,
  onAdminRegister,
  onCloseRegModal,

  isBudgetModalOpen,
  budgetItem,
  setBudgetItem,
  budgetType,
  setBudgetType,
  budgetAmount,
  setBudgetAmount,
  onAddBudget,
  onCloseBudgetModal,

  isEditBudgetModalOpen = false,
  editBudgetName = '',
  setEditBudgetName,
  editRabAmount = '',
  setEditRabAmount,
  editRealisasiAmount = '',
  setEditRealisasiAmount,
  editPemasukanAmount = '',
  setEditPemasukanAmount,
  onSaveEditBudget,
  onCloseEditBudgetModal
}) => {
  const org = event.org_structure;

  const panitiaOptions = (
    <>
      {org?.ketua_name && <option value={`Ketua Panitia - ${org.ketua_name}`}>Ketua Panitia - {org.ketua_name}</option>}
      {org?.sekretaris_name && <option value={`Sekretaris Panitia - ${org.sekretaris_name}`}>Sekretaris Panitia - {org.sekretaris_name}</option>}
      {org?.bendahara_name && <option value={`Bendahara Panitia - ${org.bendahara_name}`}>Bendahara Panitia - {org.bendahara_name}</option>}
      {org?.pj_acara_name && <option value={`PJ Acara Utama - ${org.pj_acara_name}`}>PJ Acara Utama - {org.pj_acara_name}</option>}
      {org?.pj_umum_name && <option value={`PJ Bidang Umum Utama - ${org.pj_umum_name}`}>PJ Bidang Umum Utama - {org.pj_umum_name}</option>}
      {org?.sub_acara?.map(s => (
        <option key={s.id} value={`${s.role_name} - ${s.pic_name}`}>{s.role_name} - {s.pic_name}</option>
      ))}
      {org?.sub_umum?.map(s => (
        <option key={s.id} value={`${s.role_name} - ${s.pic_name}`}>{s.role_name} - {s.pic_name}</option>
      ))}
    </>
  );

  return (
    <>
      <Modal
        open={isProposalRundownModalOpen}
        onClose={onCloseProposalRundownModal}
        title={editingProposalRundown ? 'Ubah susunan acara' : 'Tambah susunan acara'}
      >
        <form onSubmit={onSaveProposalRundown} className="space-y-3">
          <Field label="Tanggal">
            <input type="date" required value={prDate} onChange={(e) => setPrDate(e.target.value)} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Jam mulai">
              <input type="time" required value={prStartTime} onChange={(e) => setPrStartTime(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Jam selesai">
              <input type="time" required value={prEndTime} onChange={(e) => setPrEndTime(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <Field label="Kegiatan">
            <input
              type="text"
              required
              placeholder="Contoh: Pembacaan Paritta Gongyo bersama"
              value={prActivity}
              onChange={(e) => setPrActivity(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Keterangan">
            <input
              type="text"
              placeholder="Contoh: Di Altar Utama"
              value={prNotes}
              onChange={(e) => setPrNotes(e.target.value)}
              className={inputClass}
            />
          </Field>

          <ModalActions>
            <Button onClick={onCloseProposalRundownModal}>Batal</Button>
            <Button type="submit" variant="primary">Simpan acara</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal
        open={isSkenarioKerjaModalOpen}
        onClose={onCloseSkenarioKerjaModal}
        title={editingSkenarioKerja ? 'Ubah jadwal tim' : 'Tambah jadwal tim'}
      >
        <form onSubmit={onSaveSkenarioKerja} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Tahap">
              <select value={skPhaseTag} onChange={(e) => setSkPhaseTag(e.target.value)} className={selectClass}>
                <option value="H-2">H-2 (persiapan awal)</option>
                <option value="H-1">H-1 (persiapan akhir)</option>
                <option value="Hari-H">Hari-H (utama)</option>
                <option value="H+1">H+1 (beres-beres dan evaluasi)</option>
              </select>
            </Field>
            <Field label="Tanggal">
              <input type="date" required value={skDate} onChange={(e) => setSkDate(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Jam mulai">
              <input type="time" required value={skStartTime} onChange={(e) => setSkStartTime(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Jam selesai">
              <input type="time" required value={skEndTime} onChange={(e) => setSkEndTime(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <Field label="Bidang dan PJ pelaksana">
            <select required value={skExecutorBidangPj} onChange={(e) => setSkExecutorBidangPj(e.target.value)} className={selectClass}>
              <option value="">Pilih dari struktur panitia</option>
              {panitiaOptions}
            </select>
          </Field>

          <Field label="Kegiatan">
            <textarea
              rows={2}
              required
              placeholder="Contoh: Pasang dekorasi altar dan cek sound system"
              value={skActivity}
              onChange={(e) => setSkActivity(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Bidang dan PJ tujuan (interbid)">
            <select required value={skInterbidBidangPj} onChange={(e) => setSkInterbidBidangPj(e.target.value)} className={selectClass}>
              <option value="">Pilih dari struktur panitia</option>
              {panitiaOptions}
            </select>
          </Field>

          <Field label="Catatan lapangan">
            <input
              type="text"
              placeholder="Contoh: Pastikan baterai 4 mic wireless terisi"
              value={skNotes}
              onChange={(e) => setSkNotes(e.target.value)}
              className={inputClass}
            />
          </Field>

          <ModalActions>
            <Button onClick={onCloseSkenarioKerjaModal}>Batal</Button>
            <Button type="submit" variant="primary">Simpan jadwal</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal
        open={isAddSubModalOpen}
        onClose={onCloseAddSubModal}
        title={subSectionType === 'sub_acara' ? 'Tambah seksi di bawah PJ Acara' : 'Tambah seksi di bawah PJ Bidang Umum'}
      >
        <form onSubmit={onAddSubSection} className="space-y-3">
          <Field label="Nama seksi">
            <input
              type="text"
              required
              placeholder={subSectionType === 'sub_acara' ? 'Contoh: Seksi Ritual Gongyo dan Altar' : 'Contoh: Seksi Transportasi'}
              value={subRoleName}
              onChange={(e) => setSubRoleName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Penanggung jawab">
            <input
              type="text"
              required
              placeholder="Nama penanggung jawab"
              value={subPicName}
              onChange={(e) => setSubPicName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <ModalActions>
            <Button onClick={onCloseAddSubModal}>Batal</Button>
            <Button type="submit" variant="primary">Simpan seksi</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={isEditSubModalOpen} onClose={onCloseEditSubModal} title="Ubah seksi">
        <form onSubmit={onUpdateSubSection} className="space-y-3">
          <Field label="Nama seksi">
            <input type="text" required value={editSubRoleName} onChange={(e) => setEditSubRoleName(e.target.value)} className={inputClass} />
          </Field>

          <Field label="Penanggung jawab">
            <input type="text" required value={editSubPicName} onChange={(e) => setEditSubPicName(e.target.value)} className={inputClass} />
          </Field>

          <ModalActions>
            <Button onClick={onCloseEditSubModal}>Batal</Button>
            <Button type="submit" variant="primary">Simpan perubahan</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={isRegModalOpen} onClose={onCloseRegModal} title="Daftarkan umat">
        <form onSubmit={onAdminRegister} className="space-y-3">
          <SearchableUmatSelect
            label="Umat"
            required
            profiles={profiles}
            value={selectedUmatId}
            disabledIds={registeredProfileIds}
            onChange={(id) => setSelectedUmatId(id)}
            placeholder="Ketik nama umat"
          />

          {regMsg && (
            <p role="alert" className="text-sm text-danger">{regMsg}</p>
          )}

          <ModalActions>
            <Button onClick={onCloseRegModal}>Batal</Button>
            <Button type="submit" variant="primary">Daftarkan umat</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={isBudgetModalOpen} onClose={onCloseBudgetModal} title="Tambah item keuangan">
        <form onSubmit={onAddBudget} className="space-y-3">
          <Field label="Nama item">
            <input
              type="text"
              required
              placeholder="Contoh: Konsumsi umat, dekorasi altar"
              value={budgetItem}
              onChange={(e) => setBudgetItem(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Jenis">
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value as 'rab' | 'realisasi' | 'pemasukan')}
              className={selectClass}
            >
              <option value="pemasukan">Pemasukan (dana paramita, sponsor)</option>
              <option value="rab">Anggaran (RAB pengeluaran)</option>
              <option value="realisasi">Realisasi pengeluaran</option>
            </select>
          </Field>

          <Field label="Jumlah (Rp)">
            <input
              type="number"
              inputMode="numeric"
              required
              placeholder="Contoh: 100000"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              className={`${inputClass} tabular-nums`}
            />
          </Field>

          <ModalActions>
            <Button onClick={onCloseBudgetModal}>Batal</Button>
            <Button type="submit" variant="primary">Simpan item</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={isEditBudgetModalOpen} onClose={() => onCloseEditBudgetModal?.()} title="Ubah item keuangan">
        <form onSubmit={onSaveEditBudget} className="space-y-3">
          <Field label="Nama item">
            <input
              type="text"
              required
              value={editBudgetName}
              onChange={(e) => setEditBudgetName && setEditBudgetName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Anggaran RAB (Rp)" hint="Kosongkan jika tidak ada RAB.">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={editRabAmount}
              onChange={(e) => setEditRabAmount && setEditRabAmount(e.target.value)}
              className={`${inputClass} tabular-nums`}
            />
          </Field>

          <Field label="Realisasi pengeluaran (Rp)" hint="Kosongkan jika belum ada realisasi.">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={editRealisasiAmount}
              onChange={(e) => setEditRealisasiAmount && setEditRealisasiAmount(e.target.value)}
              className={`${inputClass} tabular-nums`}
            />
          </Field>

          <Field label="Pemasukan (Rp)" hint="Kosongkan jika item ini hanya pengeluaran.">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={editPemasukanAmount}
              onChange={(e) => setEditPemasukanAmount && setEditPemasukanAmount(e.target.value)}
              className={`${inputClass} tabular-nums`}
            />
          </Field>

          <ModalActions>
            <Button onClick={() => onCloseEditBudgetModal?.()}>Batal</Button>
            <Button type="submit" variant="primary">Simpan perubahan</Button>
          </ModalActions>
        </form>
      </Modal>
    </>
  );
};
