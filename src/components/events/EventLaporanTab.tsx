import React from 'react';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';
import { exportSkenarioKerjaToExcel, exportLPJToExcel } from '@/lib/export-utils';
import { Button, Panel } from '@/components/ui/kit';

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
  const documents: { title: string; description: string; kind: 'pdf' | 'excel'; onClick: () => void }[] = [
    {
      title: 'Daftar hadir dan tanda tangan',
      description: 'Nama peserta terdaftar, status pembayaran, dan kolom tanda tangan.',
      kind: 'pdf',
      onClick: () => onOpenPdfModal('peserta')
    },
    {
      title: 'Proposal kegiatan',
      description: 'Susunan panitia, susunan acara, dan rencana anggaran.',
      kind: 'pdf',
      onClick: () => onOpenPdfModal('proposal')
    },
    {
      title: 'Jadwal kerja tim',
      description: 'Alur kerja lapangan dan penanggung jawab tiap bidang.',
      kind: 'excel',
      onClick: () => exportSkenarioKerjaToExcel(event.title, event.skenario_kerja || [])
    },
    {
      title: 'Laporan pertanggungjawaban (LPJ)',
      description: 'Susunan panitia, daftar peserta, dan pengeluaran aktual.',
      kind: 'pdf',
      onClick: () => onOpenPdfModal('lpj')
    },
    {
      title: 'Laporan pertanggungjawaban (LPJ)',
      description: 'Rincian LPJ dengan tabel evaluasi anggaran.',
      kind: 'excel',
      onClick: () => exportLPJToExcel(event, registrations)
    }
  ];

  return (
    <div className="space-y-4 print:hidden">
      <div>
        <h2 className="text-base font-semibold text-ink">Dokumen dan laporan</h2>
        <p className="text-sm text-ink-2">Cetak sebagai PDF atau unduh sebagai file Excel.</p>
      </div>

      <Panel>
        <ul className="divide-y divide-line">
          {documents.map(doc => (
            <li key={`${doc.title}-${doc.kind}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink">
                  {doc.title} <span className="font-normal text-ink-3">{doc.kind === 'pdf' ? 'PDF' : 'Excel'}</span>
                </h3>
                <p className="text-sm text-ink-2">{doc.description}</p>
              </div>
              <Button onClick={doc.onClick} className="shrink-0 self-start sm:self-auto">
                {doc.kind === 'pdf' ? <Printer size={14} aria-hidden /> : <FileSpreadsheet size={14} aria-hidden />}
                {doc.kind === 'pdf' ? 'Buka dokumen' : 'Unduh Excel'}
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
};
