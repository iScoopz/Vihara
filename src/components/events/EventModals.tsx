import React from 'react';
import { Clock, ListTodo, Edit2 } from 'lucide-react';
import { ViharaEvent, Profile, EventProposalRundown, EventSkenarioKerja } from '@/types/database';
import { SearchableUmatSelect } from '@/components/ui/SearchableUmatSelect';

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
  onCloseBudgetModal
}) => {
  const org = event.org_structure;

  return (
    <>
      {/* Modal Add/Edit Proposal Rundown */}
      {isProposalRundownModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" />
              <span>{editingProposalRundown ? 'Edit Rundown Proposal' : 'Tambah Rundown Proposal'}</span>
            </h3>

            <form onSubmit={onSaveProposalRundown} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Tanggal Agenda</label>
                <input
                  type="date"
                  required
                  value={prDate}
                  onChange={(e) => setPrDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={prStartTime}
                    onChange={(e) => setPrStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={prEndTime}
                    onChange={(e) => setPrEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Agenda / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Pembacaan Paritta Gongyo bersama"
                  value={prActivity}
                  onChange={(e) => setPrActivity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Notes</label>
                <input
                  type="text"
                  placeholder="misal: Dilaksanakan di Altar Utama"
                  value={prNotes}
                  onChange={(e) => setPrNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={onCloseProposalRundownModal} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Rundown</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Skenario Kerja (SK) */}
      {isSkenarioKerjaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <ListTodo size={18} className="text-amber-500" />
              <span>{editingSkenarioKerja ? 'Edit Agenda Skenario Kerja' : 'Tambah Agenda Skenario Kerja (SK)'}</span>
            </h3>

            <form onSubmit={onSaveSkenarioKerja} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Tahap Persiapan</label>
                  <select
                    value={skPhaseTag}
                    onChange={(e) => setSkPhaseTag(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-300 font-extrabold focus:outline-none focus:border-purple-600 cursor-pointer"
                  >
                    <option value="H-2">H-2 (Persiapan Awal)</option>
                    <option value="H-1">H-1 (Persiapan Akhir)</option>
                    <option value="Hari-H">Hari-H (Utama)</option>
                    <option value="H+1">H+1 (Clean Up & Evaluasi)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={skDate}
                    onChange={(e) => setSkDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={skStartTime}
                    onChange={(e) => setSkStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={skEndTime}
                    onChange={(e) => setSkEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Bidang & PJ Pelaksana</label>
                <select
                  required
                  value={skExecutorBidangPj}
                  onChange={(e) => setSkExecutorBidangPj(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold cursor-pointer"
                >
                  <option value="">-- Pilih dari Struktur Panitia Event --</option>
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
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detail Persiapan / Kegiatan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="misal: Pemasangan Dekorasi Altar, Sound Check & Pembagian Konsumsi"
                  value={skActivity}
                  onChange={(e) => setSkActivity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Interbid (Bidang & PJ Tujuan)</label>
                <select
                  required
                  value={skInterbidBidangPj}
                  onChange={(e) => setSkInterbidBidangPj(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-sky-900 dark:text-sky-300 focus:outline-none focus:border-purple-600 font-bold cursor-pointer"
                >
                  <option value="">-- Pilih dari Struktur Panitia Event --</option>
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
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan / Notes Lapangan</label>
                <input
                  type="text"
                  placeholder="misal: Pastikan 4 mic wireless terisi baterai & disinfeksi"
                  value={skNotes}
                  onChange={(e) => setSkNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={onCloseSkenarioKerjaModal} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Skenario Kerja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Sub-Section */}
      {isAddSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              {subSectionType === 'sub_acara' ? 'Tambah Sub-Bagian di bawah PJ Acara' : 'Tambah Sub-Bagian di bawah PJ Bidang Umum'}
            </h3>
            
            <form onSubmit={onAddSubSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Seksi / Sub-Bagian</label>
                <input
                  type="text"
                  required
                  placeholder={subSectionType === 'sub_acara' ? 'misal: Seksi Ritual Gongyo & Altar' : 'misal: Seksi Transportasi & Akomodasi'}
                  value={subRoleName}
                  onChange={(e) => setSubRoleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PJ Sub-Bagian)</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Penanggung Jawab"
                  value={subPicName}
                  onChange={(e) => setSubPicName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={onCloseAddSubModal} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Sub-Bagian</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Sub-Section */}
      {isEditSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <Edit2 size={18} className="text-amber-500" />
              <span>Edit Sub-Bagian & Penanggung Jawab</span>
            </h3>
            
            <form onSubmit={onUpdateSubSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Seksi / Sub-Bagian</label>
                <input
                  type="text"
                  required
                  value={editSubRoleName}
                  onChange={(e) => setEditSubRoleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PJ Sub-Bagian)</label>
                <input
                  type="text"
                  required
                  value={editSubPicName}
                  onChange={(e) => setEditSubPicName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-extrabold text-purple-950 dark:text-purple-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={onCloseEditSubModal} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin Hybrid Registration */}
      {isRegModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              Pendaftaran Umat oleh Admin
            </h3>
            
            <form onSubmit={onAdminRegister} className="space-y-3 text-xs">
              <div>
                <SearchableUmatSelect
                  label="Pilih Umat dari Master Data"
                  required
                  profiles={profiles}
                  value={selectedUmatId}
                  disabledIds={registeredProfileIds}
                  onChange={(id) => setSelectedUmatId(id)}
                  placeholder="-- Ketik / Cari Nama Umat --"
                />
              </div>

              {regMsg && (
                <p className="text-xs font-bold text-rose-500">{regMsg}</p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={onCloseRegModal} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Daftarkan Umat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Budget */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              Tambah / Input Item Keuangan Kegiatan
            </h3>
            
            <form onSubmit={onAddBudget} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Item Keuangan</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Sampah, Konsumsi Umat, Dekorasi Altar, Sound System"
                  value={budgetItem}
                  onChange={(e) => setBudgetItem(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Record Keuangan</label>
                <select
                  value={budgetType}
                  onChange={(e: any) => setBudgetType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="pemasukan">✨ Pemasukan / Sumbangan (Dana Paramita, Sponsorship)</option>
                  <option value="rab">📊 Target Anggaran (RAB Pengeluaran)</option>
                  <option value="realisasi">💸 Realisasi Pengeluaran (Pengeluaran Langsung / Realisasi RAB)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="misal: 100000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={onCloseBudgetModal} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
