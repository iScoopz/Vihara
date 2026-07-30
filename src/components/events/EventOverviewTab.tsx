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
      <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 text-xs text-slate-700 dark:text-slate-300">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
          Informasi Event
        </h3>
        <p className="leading-relaxed">{event.description}</p>
        
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/60 space-y-2 border border-purple-100 dark:border-purple-900/60">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs">Catatan & Ketentuan:</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
            <li>Umat diimbau berbusana rapi dan bersahaja.</li>
            <li>Harap hadir 15 menit sebelum pembacaan Paritta dimulai.</li>
            <li>Pendaftaran dapat dilakukan mandiri via Portal Umat atau di lokasi via Admin.</li>
          </ul>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
          Status Kuota Event
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Kapasitas Maksimal:</span>
            <strong className="text-slate-900 dark:text-white">{quota} Umat</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Terdaftar Saat Ini:</span>
            <strong className="text-purple-700 dark:text-purple-300">{registrations.length} Umat</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Hadir Presensi:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">
              {attendedCount} Umat
            </strong>
          </div>

          <div className="w-full bg-slate-100 dark:bg-purple-950 h-2.5 rounded-full overflow-hidden">
            <div 
              className="gradient-mnsbdi h-full transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
