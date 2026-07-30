import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ViharaEvent } from '@/types/database';

interface EventPanitiaTabProps {
  event: ViharaEvent;
  onOpenAddSubModal: (type: 'sub_acara' | 'sub_umum') => void;
  onOpenEditSubModal: (type: 'sub_acara' | 'sub_umum', sub: { id: string; role_name: string; pic_name: string }) => void;
  onDeleteSubSection: (type: 'sub_acara' | 'sub_umum', subId: string) => void;
}

export const EventPanitiaTab: React.FC<EventPanitiaTabProps> = ({
  event,
  onOpenAddSubModal,
  onOpenEditSubModal,
  onDeleteSubSection
}) => {
  const org = event.org_structure;

  return (
    <div className="space-y-6 print:hidden">
      <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-6">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
          Struktur Kepanitiaan Event
        </h3>

        {/* LEVEL 1, 2, 3: INTI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Ketua Panitia Pelaksana
            </span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{org?.ketua_name || event.pic_name || 'Upasaka Hendra Kurniawan'}</h4>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Sekretaris Panitia
            </span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{org?.sekretaris_name || 'Suryani Dewi'}</h4>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              Bendahara Panitia
            </span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white">{org?.bendahara_name || 'Budi Santoso'}</h4>
          </div>
        </div>

        {/* LEVEL 4: PJ ACARA & SUB-BAGIAN ACARA */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                Penanggung Jawab Utama Acara & Ritual
              </span>
              <h4 className="text-lg font-black text-purple-950 dark:text-white mt-1">
                PJ Acara: {org?.pj_acara_name || 'Suryani Dewi'}
              </h4>
            </div>
            
            <button
              onClick={() => onOpenAddSubModal('sub_acara')}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1 shadow cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Sub-Bagian Acara</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {org?.sub_acara && org.sub_acara.length > 0 ? (
              org.sub_acara.map(sub => (
                <div key={sub.id} className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 space-y-1 relative group">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-purple-950 dark:text-purple-100 block pr-4">{sub.role_name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditSubModal('sub_acara', sub)}
                        className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 p-1 rounded transition cursor-pointer"
                        title="Edit PJ & Sub-Bagian Ini"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteSubSection('sub_acara', sub.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                        title="Hapus Sub-Bagian Ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-bold">PJ: <strong className="text-slate-900 dark:text-white">{sub.pic_name}</strong></p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-3">Belum ada sub-bagian acara tambahan.</p>
            )}
          </div>
        </div>

        {/* LEVEL 4: PJ BIDANG UMUM & SUB-BAGIAN UMUM */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                Penanggung Jawab Utama Logistik & Umum
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                PJ Bidang Umum: {org?.pj_umum_name || 'Budi Santoso'}
              </h4>
            </div>

            <button
              onClick={() => onOpenAddSubModal('sub_umum')}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Sub-Bagian Umum</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {org?.sub_umum && org.sub_umum.length > 0 ? (
              org.sub_umum.map(sub => (
                <div key={sub.id} className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1 relative group">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-900 dark:text-white block pr-4">{sub.role_name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditSubModal('sub_umum', sub)}
                        className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 p-1 rounded transition cursor-pointer"
                        title="Edit PJ & Sub-Bagian Ini"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteSubSection('sub_umum', sub.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                        title="Hapus Sub-Bagian Ini"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">PJ: <strong className="text-slate-900 dark:text-white">{sub.pic_name}</strong></p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 col-span-3">Belum ada sub-bagian umum tambahan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
