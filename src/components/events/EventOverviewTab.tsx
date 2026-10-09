import React from 'react';
import { ViharaEvent, EventRegistration } from '@/types/database';

interface EventOverviewTabProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
}

export const EventOverviewTab: React.FC<EventOverviewTabProps> = ({ event, registrations }) => {
  const quota = event.quota || 100;
  const attendedCount = registrations.filter(r => r.is_attended).length;
  const percentage = Math.min(100, (registrations.length / quota) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
      <div className="md:col-span-2 p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4 text-xs text-neutral-700 dark:text-neutral-300">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
          Informasi Kegiatan
        </h2>
        <p className="leading-relaxed text-[#86868b] dark:text-[#a1a1a6]">{event.description}</p>
        
        <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] space-y-2 border border-black/[0.06] dark:border-white/[0.08]">
          <h3 className="font-semibold text-neutral-900 dark:text-white text-xs">Catatan & Ketentuan:</h3>
          <ul className="list-disc list-inside space-y-1 text-[#86868b] dark:text-[#a1a1a6]">
            <li>Umat diimbau berbusana rapi dan bersahaja.</li>
            <li>Harap hadir 15 menit sebelum pembacaan Paritta dimulai.</li>
            <li>Pendaftaran dapat dilakukan mandiri via Portal Umat atau di lokasi via Admin.</li>
          </ul>
        </div>
      </div>

      <div className="p-7 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white border-b border-black/[0.04] dark:border-white/[0.06] pb-3">
          Kuota Peserta
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#86868b]">Kapasitas Maksimal:</span>
            <strong className="text-neutral-900 dark:text-white">{quota} Orang</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#86868b]">Terdaftar Saat Ini:</span>
            <strong className="text-neutral-900 dark:text-white">{registrations.length} Orang</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#86868b]">Peserta Hadir:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {attendedCount} Orang
            </strong>
          </div>

          <div className="w-full bg-black/[0.04] dark:bg-white/[0.08] h-2 rounded-full overflow-hidden mt-2">
            <div 
              className="bg-[#5e35b1] dark:bg-purple-400 h-full rounded-full transition-all duration-300" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
