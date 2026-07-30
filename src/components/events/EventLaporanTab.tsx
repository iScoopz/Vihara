import React from 'react';
import { Printer, FileSpreadsheet, FileText } from 'lucide-react';
import { ViharaEvent } from '@/types/database';
import { exportSkenarioKerjaToExcel } from '@/lib/export-utils';

interface EventLaporanTabProps {
  event: ViharaEvent;
  onOpenPdfModal: (mode: 'proposal' | 'lpj') => void;
}

export const EventLaporanTab: React.FC<EventLaporanTabProps> = ({ event, onOpenPdfModal }) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
      <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
        Pusat Cetak & Export Laporan Event
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        Gunakan tombol di bawah untuk mencetak Proposal Event, Laporan Pertanggungjawaban (LPJ), atau mengunduh data dalam format Excel.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <button
          onClick={() => onOpenPdfModal('proposal')}
          className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-left space-y-2 hover:border-purple-500 cursor-pointer transition"
        >
          <Printer className="text-purple-600" size={24} />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Cetak Proposal Event (PDF)</h4>
          <p className="text-[11px] text-slate-500">Mencetak dokumen proposal lengkap beserta Struktur Panitia, Rundown Proposal, dan RAB.</p>
        </button>

        <button
          onClick={() => exportSkenarioKerjaToExcel(event.title, event.skenario_kerja || [])}
          className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-left space-y-2 hover:border-emerald-500 cursor-pointer transition"
        >
          <FileSpreadsheet className="text-emerald-600" size={24} />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Export Skenario Kerja (Excel)</h4>
          <p className="text-[11px] text-slate-500">Mengunduh file Excel (.xls) berdesain rapi khas MNSBDI untuk alur operasional tim lapangan.</p>
        </button>

        <button
          onClick={() => onOpenPdfModal('lpj')}
          className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-left space-y-2 hover:border-amber-500 cursor-pointer transition"
        >
          <FileText className="text-amber-600" size={24} />
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Cetak LPJ Event (PDF)</h4>
          <p className="text-[11px] text-slate-500">Mencetak Laporan Pertanggungjawaban LENGKAP dengan Rekap Presensi Umat & Perbandingan Realisasi Biaya.</p>
        </button>
      </div>
    </div>
  );
};
