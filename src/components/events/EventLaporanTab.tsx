import React from 'react';
import { Printer, FileSpreadsheet, FileText, Users, ArrowUpRight } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';
import { exportSkenarioKerjaToExcel, exportLPJToExcel } from '@/lib/export-utils';

interface EventLaporanTabProps {
  event: ViharaEvent;
  registrations?: EventRegistration[];
  onOpenPdfModal: (mode: 'proposal' | 'lpj' | 'peserta') => void;
}

export const EventLaporanTab: React.FC<EventLaporanTabProps> = ({ 
  event, 
  registrations = [], 
  onOpenPdfModal 
}) => {
  return (
    <div className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#161618] border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-6 print:hidden">
      <div className="border-b border-black/[0.04] dark:border-white/[0.06] pb-4 space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block">
          Pusat Dokumen & Pelaporan
        </span>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Cetak & Export Laporan Event
        </h2>
        <p className="text-xs text-[#86868b] dark:text-[#a1a1a6]">
          Pilih dokumen yang ingin dicetak dalam format PDF resmi atau diunduh sebagai lembar kerja Excel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Card 1: List Peserta */}
        <button
          onClick={() => onOpenPdfModal('peserta')}
          className="p-6 rounded-3xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-left space-y-4 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-neutral-800 dark:text-neutral-200">
              <Users size={18} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">List Peserta (Ketua Acara)</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                Daftar nama peserta terdaftar, status pelunasan, dan lembar paraf presensi fisik.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-neutral-900 dark:text-white group-hover:gap-1.5 transition-all">
            <span>Buka Dokumen</span>
            <ArrowUpRight size={14} className="text-[#86868b]" />
          </div>
        </button>

        {/* Card 2: Proposal Event */}
        <button
          onClick={() => onOpenPdfModal('proposal')}
          className="p-6 rounded-3xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-left space-y-4 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-[#5e35b1] dark:text-purple-300 flex items-center justify-center">
              <Printer size={18} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Proposal Event (PDF)</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                Dokumen proposal lengkap dengan Struktur Panitia, Rundown Acara, dan Rencana Anggaran (RAB).
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#5e35b1] dark:text-purple-300 group-hover:gap-1.5 transition-all">
            <span>Buka Dokumen</span>
            <ArrowUpRight size={14} className="text-[#86868b]" />
          </div>
        </button>

        {/* Card 3: Skenario Kerja Excel */}
        <button
          onClick={() => exportSkenarioKerjaToExcel(event.title, event.skenario_kerja || [])}
          className="p-6 rounded-3xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-left space-y-4 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Skenario Kerja (Excel)</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                Unduh file Excel (.xls) berdesain rapi untuk alur operasional tim lapangan dan panitia.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-1.5 transition-all">
            <span>Download .XLS</span>
            <ArrowUpRight size={14} className="text-[#86868b]" />
          </div>
        </button>

        {/* Card 4: Cetak LPJ Event (PDF) */}
        <button
          onClick={() => onOpenPdfModal('lpj')}
          className="p-6 rounded-3xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-left space-y-4 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Cetak LPJ Event (PDF)</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                Laporan Pertanggungjawaban resmi dengan Rekap Presensi Umat dan Realisasi Biaya siap cetak A4.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:gap-1.5 transition-all">
            <span>Buka Dokumen</span>
            <ArrowUpRight size={14} className="text-[#86868b]" />
          </div>
        </button>

        {/* Card 5: Download LPJ Event (Excel) */}
        <button
          onClick={() => exportLPJToExcel(event, registrations)}
          className="p-6 rounded-3xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-left space-y-4 hover:border-black/20 dark:hover:border-white/20 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Download LPJ Event (Excel)</h3>
              <p className="text-xs text-[#86868b] dark:text-[#a1a1a6] mt-1 leading-relaxed">
                Unduh Laporan Pertanggungjawaban lengkap berformat Excel (.xls) beserta Rekapitulasi Keuangan.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 group-hover:gap-1.5 transition-all">
            <span>Download .XLS</span>
            <ArrowUpRight size={14} className="text-[#86868b]" />
          </div>
        </button>
      </div>
    </div>
  );
};
