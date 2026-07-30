import React from 'react';
import { Printer, X } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';

interface EventPdfModalProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
  pdfMode: 'proposal' | 'lpj';
  onClose: () => void;
}

export const EventPdfModal: React.FC<EventPdfModalProps> = ({
  event,
  registrations,
  pdfMode,
  onClose
}) => {
  const org = event.org_structure;
  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];
  const totalRAB = rabItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Modal Controls (Hidden when printed) */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-purple-800 flex justify-between items-center text-white print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Printer size={16} className="text-purple-400" />
            <span>Dokumen Siap Cetak: <strong className="text-amber-300 uppercase">{pdfMode === 'proposal' ? 'Proposal Event' : 'LPJ Event'}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="gradient-mnsbdi px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer size={14} />
              <span>Cetak / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINT PAPER CONTAINER (A4 FORMATTED FOR PRINT) */}
        <div className="bg-white text-slate-900 p-8 md:p-12 rounded-2xl shadow-2xl space-y-6 print:p-0 print:shadow-none print:bg-transparent">
          
          {/* KOP SURAT OFFISIAL MNSBDI */}
          <div className="text-center border-b-4 border-double border-purple-950 pb-4 space-y-1">
            <h2 className="text-lg font-black text-purple-950 tracking-wider uppercase">
              MAJELIS NICHREN SHOSHU BUDDHA DHARMA INDONESIA (MNSBDI)
            </h2>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              SENTRA MAKASSAR — PANITIA PELAKSANA EVENT
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold">
              Alamat Sekretariat: Jl. Sulawesi No. 88, Makassar — Email: info@mnsbdi-makassar.or.id
            </p>
          </div>

          {/* DOKUMEN TITLE */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-black uppercase tracking-wide text-purple-950 border-b-2 border-purple-900 inline-block pb-0.5">
              {pdfMode === 'proposal' ? 'PROPOSAL PELAKSANAAN EVENT' : 'LAPORAN PERTANGGUNGJAWABAN (LPJ) EVENT'}
            </h3>
            <p className="text-sm font-extrabold text-slate-800">{event.title}</p>
            <p className="text-xs text-slate-500 font-semibold">
              Tanggal Kegiatan: {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | Lokasi: {event.location}
            </p>
          </div>

          {/* DOKUMEN CONTENT */}
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            
            {/* SECTION 1: STRUKTUR KEPANITIAAN */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                I. Susunan Panitia Pelaksana Event
              </h4>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Ketua Panitia</span>
                  <strong className="text-slate-900 font-extrabold">{org?.ketua_name}</strong>
                </div>
                <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Sekretaris</span>
                  <strong className="text-slate-900 font-extrabold">{org?.sekretaris_name}</strong>
                </div>
                <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Bendahara</span>
                  <strong className="text-slate-900 font-extrabold">{org?.bendahara_name}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-xl border-2 border-purple-300 bg-purple-50/80 space-y-2">
                  <div className="border-b border-purple-300 pb-1.5 flex justify-between items-center">
                    <span className="font-black text-purple-950 uppercase text-xs">PJ Acara Utama</span>
                    <strong className="text-purple-950 font-black text-sm">{org?.pj_acara_name}</strong>
                  </div>
                  <p className="text-[10px] font-black text-purple-900 uppercase tracking-wider">Sub-Bagian Acara:</p>
                  <div className="space-y-1.5">
                    {org?.sub_acara && org.sub_acara.length > 0 ? (
                      org.sub_acara.map(s => (
                        <div key={s.id} className="bg-white p-2 rounded-lg border border-purple-200 shadow-sm flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900">• {s.role_name}</span>
                          <span className="font-extrabold text-purple-950 bg-purple-100 px-2 py-0.5 rounded text-[11px]">PJ: {s.pic_name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">- Belum ada sub-bagian -</p>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/80 space-y-2">
                  <div className="border-b border-amber-300 pb-1.5 flex justify-between items-center">
                    <span className="font-black text-amber-950 uppercase text-xs">PJ Bidang Umum Utama</span>
                    <strong className="text-amber-950 font-black text-sm">{org?.pj_umum_name}</strong>
                  </div>
                  <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Sub-Bagian Umum & Logistik:</p>
                  <div className="space-y-1.5">
                    {org?.sub_umum && org.sub_umum.length > 0 ? (
                      org.sub_umum.map(s => (
                        <div key={s.id} className="bg-white p-2 rounded-lg border border-amber-200 shadow-sm flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900">• {s.role_name}</span>
                          <span className="font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded text-[11px]">PJ: {s.pic_name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic">- Belum ada sub-bagian -</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: RUNDOWN ACARA PROPOSAL */}
            <div className="space-y-3 print-avoid-break">
              <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                II. Susunan Rundown Acara
              </h4>
              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-purple-900 text-white font-bold">
                    <th className="p-2 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2 border border-slate-300">Hari / Tanggal</th>
                    <th className="p-2 border border-slate-300 text-center">Waktu / Jam</th>
                    <th className="p-2 border border-slate-300">Nama Agenda / Kegiatan</th>
                    <th className="p-2 border border-slate-300">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {event.proposal_rundowns && event.proposal_rundowns.length > 0 ? (
                    event.proposal_rundowns.map((pr, i) => (
                      <tr key={pr.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-2 border border-slate-300 text-center">{i + 1}</td>
                        <td className="p-2 border border-slate-300 font-bold">{pr.day_date}</td>
                        <td className="p-2 border border-slate-300 text-center font-semibold text-purple-900">{pr.time_slot}</td>
                        <td className="p-2 border border-slate-300 font-bold text-slate-900">{pr.activity}</td>
                        <td className="p-2 border border-slate-300 text-slate-600">{pr.notes || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-3 text-center text-slate-400 italic">Belum ada rundown acara yang ditambahkan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* SECTION 3: REKAPITULASI PRESENSI (HANYA PADA LPJ) */}
            {pdfMode === 'lpj' && (
              <div className="space-y-2 print-avoid-break">
                <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                  III. Rekapitulasi Presensi Kehadiran Umat
                </h4>
                <div className="grid grid-cols-3 gap-3 text-xs text-center">
                  <div className="p-3 rounded-xl border bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Target Kuota</p>
                    <p className="font-bold text-slate-900 text-sm">{event.quota || 100} Umat</p>
                  </div>
                  <div className="p-3 rounded-xl border bg-slate-50">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Terdaftar</p>
                    <p className="font-bold text-slate-900 text-sm">{registrations.length} Umat</p>
                  </div>
                  <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200">
                    <p className="text-[10px] text-emerald-800 font-bold uppercase">Total Hadir Presensi</p>
                    <p className="font-extrabold text-emerald-900 text-sm">{registrations.filter(r => r.is_attended).length} Umat</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: KEUANGAN (RAB VS REALISASI) */}
            <div className="space-y-3 print-avoid-break">
              <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                {pdfMode === 'proposal' ? 'III. Rencana Anggaran Biaya (RAB)' : 'IV. Perbandingan Realisasi Keuangan vs RAB'}
              </h4>

              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-purple-900 text-white font-bold">
                    <th className="p-2.5 border border-slate-300 text-center w-10">No</th>
                    <th className="p-2.5 border border-slate-300">Nama Item Pengeluaran</th>
                    <th className="p-2.5 border border-slate-300 text-right">Rencana RAB (Rp)</th>
                    {pdfMode === 'lpj' && <th className="p-2.5 border border-slate-300 text-right">Realisasi (Rp)</th>}
                    {pdfMode === 'lpj' && <th className="p-2.5 border border-slate-300 text-right">Selisih (Rp)</th>}
                  </tr>
                </thead>
                <tbody>
                  {rabItems.map((b, i) => {
                    const realisasi = realisasiItems.find(r => r.item_name === b.item_name)?.amount || 0;
                    const variance = b.amount - realisasi;
                    return (
                      <tr key={b.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-2 border border-slate-300 text-center">{i + 1}</td>
                        <td className="p-2 border border-slate-300 font-bold">{b.item_name}</td>
                        <td className="p-2 border border-slate-300 text-right font-semibold">Rp {b.amount.toLocaleString('id-ID')}</td>
                        {pdfMode === 'lpj' && <td className="p-2 border border-slate-300 text-right font-semibold text-amber-900">Rp {realisasi.toLocaleString('id-ID')}</td>}
                        {pdfMode === 'lpj' && (
                          <td className={`p-2 border border-slate-300 text-right font-bold ${variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            Rp {variance.toLocaleString('id-ID')}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-purple-100 font-extrabold">
                    <td colSpan={2} className="p-2.5 border border-slate-300 text-right">TOTAL KESELURUHAN</td>
                    <td className="p-2.5 border border-slate-300 text-right text-purple-950">Rp {totalRAB.toLocaleString('id-ID')}</td>
                    {pdfMode === 'lpj' && <td className="p-2.5 border border-slate-300 text-right text-amber-950">Rp {totalRealisasi.toLocaleString('id-ID')}</td>}
                    {pdfMode === 'lpj' && (
                      <td className={`p-2.5 border border-slate-300 text-right ${totalRAB - totalRealisasi >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                        Rp {(totalRAB - totalRealisasi).toLocaleString('id-ID')}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* SIGNATURE BLOCK */}
            <div className="pt-8 grid grid-cols-2 text-center text-xs print-avoid-break">
              <div>
                <p className="text-slate-500">Mengetahui / Menyetujui,</p>
                <p className="font-extrabold text-slate-900 mt-1">Ketua Panitia Pelaksana</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="font-black text-purple-950 underline">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</span>
                </div>
              </div>

              <div>
                <p className="text-slate-500">Makassar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-extrabold text-slate-900 mt-1">Sekretaris Panitia</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="font-black text-purple-950 underline">{org?.sekretaris_name || 'Suryani Dewi'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
