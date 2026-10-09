import React from 'react';
import { Printer, X, FileSpreadsheet } from 'lucide-react';
import { ViharaEvent, EventRegistration, UmatBagian } from '@/types/database';
import { exportLPJToExcel } from '@/lib/export-utils';

interface EventPdfModalProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
  pdfMode: 'proposal' | 'lpj' | 'peserta';
  onClose: () => void;
}

const BAGIAN_LPJ_ORDER: UmatBagian[] = ['Inspirasi', 'Pria', 'Wanita', 'Pro-M 40s', 'Pro-M Progresif', 'GM', 'Bintang'];

export const EventPdfModal: React.FC<EventPdfModalProps> = ({
  event,
  registrations,
  pdfMode,
  onClose
}) => {
  const org = event.org_structure;
  const pemasukanItems = event.budgets?.filter(b => b.budget_type === 'pemasukan') || [];
  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];

  // Detailed financial breakdown per Bagian for LPJ
  const pricing = event.pricing_per_bagian || {};
  const extraFees = event.extra_fees || [];

  const bagianBreakdown = BAGIAN_LPJ_ORDER.map((bagian) => {
    const regsInBagian = registrations.filter(
      (r) => (r.profile?.bagian || 'Inspirasi') === bagian
    );
    const count = regsInBagian.length;
    const basePrice = pricing[bagian] || 0;
    const subtotalBase = count * basePrice;

    let subtotalExtra = 0;
    regsInBagian.forEach((r) => {
      const selectedIds = r.selected_extra_fee_ids || [];
      const extraTotal = extraFees
        .filter((f) => selectedIds.includes(f.id))
        .reduce((sum, f) => sum + f.amount, 0);
      subtotalExtra += extraTotal;
    });

    const totalPemasukanBagian = subtotalBase + subtotalExtra;

    return {
      bagian,
      count,
      basePrice,
      subtotalBase,
      subtotalExtra,
      totalPemasukanBagian
    };
  }).filter((b) => b.count > 0 || b.basePrice > 0);

  const totalUmatRegistrationFees = bagianBreakdown.reduce(
    (sum, b) => sum + b.totalPemasukanBagian,
    0
  );
  const totalPemasukanManual = pemasukanItems.reduce(
    (acc, curr) => acc + curr.amount,
    0
  );
  const totalPemasukanGlobal = totalPemasukanManual + totalUmatRegistrationFees;
  const totalRAB = rabItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + curr.amount, 0);
  const saldoKasGlobal = totalPemasukanGlobal - totalRealisasi;

  // Stable sort by Umat's Name for Participant List
  const sortedRegistrations = [...registrations].sort((a, b) => {
    const nameA = a.profile?.full_name || '';
    const nameB = b.profile?.full_name || '';
    return nameA.localeCompare(nameB);
  });

  // Sort registrations for LPJ starting with Inspirasi, Pria, Wanita, Pro-M 40s, Pro-M Progresif, GM, Bintang
  const lpjSortedRegistrations = [...registrations].sort((a, b) => {
    const bgA = a.profile?.bagian || 'Inspirasi';
    const bgB = b.profile?.bagian || 'Inspirasi';
    const idxA = BAGIAN_LPJ_ORDER.indexOf(bgA as UmatBagian);
    const idxB = BAGIAN_LPJ_ORDER.indexOf(bgB as UmatBagian);
    if (idxA !== idxB) {
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    }
    const nameA = a.profile?.full_name || '';
    const nameB = b.profile?.full_name || '';
    return nameA.localeCompare(nameB);
  });

  return (
    <div id="printable-pdf-document-wrapper" className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Apple-style Minimal Floating Action Bar (Hidden when printed) */}
        <div className="bg-[#1c1c1e] text-white px-5 py-3 rounded-full border border-white/10 shadow-xl flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[#a1a1a6]">
              Dokumen: <strong className="text-white font-semibold">{pdfMode === 'proposal' ? 'Proposal Event' : pdfMode === 'lpj' ? 'LPJ Event' : 'Daftar Peserta'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {pdfMode === 'lpj' && (
              <button
                onClick={() => exportLPJToExcel(event, registrations)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet size={13} />
                <span className="hidden sm:inline">Download Excel</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="bg-white hover:bg-neutral-200 text-black px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer size={13} />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#86868b] hover:text-white rounded-full transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINT PAPER CONTAINER (Clean, Legible, Professional A4 Document) */}
        <div id="printable-pdf-document" className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl space-y-6 print:p-0 print:shadow-none print:rounded-none">
          
          {/* KOP SURAT OFFISIAL (Clean, Professional, Institutional Header) */}
          <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
            <h2 className="text-base font-bold text-slate-950 tracking-wider uppercase">
              MAJELIS NICHIREN SHOSHU BUDDHA DHARMA INDONESIA (MNSBDI)
            </h2>
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              SENTRA MAKASSAR &bull; PANITIA PELAKSANA KEGIATAN
            </h3>
            <p className="text-[10px] text-slate-500">
              Sekretariat: Jl. Sungai Cenrana No. 39, Makassar &bull; Email: info@mnsbdi-makassar.or.id
            </p>
          </div>

          {/* DOKUMEN TITLE */}
          <div className="text-center space-y-1 pt-1">
            <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {pdfMode === 'proposal' 
                ? 'PROPOSAL PELAKSANAAN KEGIATAN' 
                : pdfMode === 'lpj' 
                  ? 'LAPORAN PERTANGGUNGJAWABAN (LPJ) KEGIATAN' 
                  : 'DAFTAR PESERTA & HASIL REGISTRASI UMAT'}
            </h1>
            <p className="text-base font-bold text-slate-900">{event.title}</p>
            <p className="text-xs text-slate-600">
              Hari & Tanggal: {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} &bull; Lokasi: {event.location}
            </p>
          </div>

          {/* DOKUMEN CONTENT */}
          {pdfMode === 'peserta' ? (
            /* SPECIAL CLEAN PARTICIPANT ROSTER FOR KETUA ACARA */
            <div className="space-y-5 text-xs text-slate-800 leading-relaxed">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="font-semibold text-slate-900">Total Umat Terdaftar: {sortedRegistrations.length} Umat</span>
                  <span className="text-[11px] text-slate-500 block">Daftar presensi kehadiran dan paraf kegiatan</span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-semibold text-[11px]">
                    <th className="p-2 border border-slate-300 text-center w-8">No</th>
                    <th className="p-2 border border-slate-300">Nama Lengkap Umat</th>
                    <th className="p-2 border border-slate-300 text-center w-12">L/P</th>
                    <th className="p-2 border border-slate-300 text-center">Bagian</th>
                    <th className="p-2 border border-slate-300">Cetya & HAN</th>
                    <th className="p-2 border border-slate-300 text-center">Status Bayar</th>
                    <th className="p-2 border border-slate-300 text-center w-28">Paraf Presensi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegistrations.length > 0 ? (
                    sortedRegistrations.map((reg, i) => (
                      <tr key={reg.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                        <td className="p-2 border border-slate-300 text-center text-slate-500">{i + 1}</td>
                        <td className="p-2 border border-slate-300 font-semibold text-slate-900">
                          {reg.profile?.full_name || 'Umat Vihara'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center text-slate-600">
                          {reg.profile?.gender || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-medium text-slate-800">
                          {reg.profile?.bagian || 'Inspirasi'}
                        </td>
                        <td className="p-2 border border-slate-300 text-slate-600">
                          {reg.profile?.cetya || '-'} / {reg.profile?.han || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-medium">
                          {reg.is_paid ? (
                            <span className="text-emerald-700 font-semibold">Lunas</span>
                          ) : (
                            <span className="text-slate-400">Belum</span>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300 text-center text-slate-300 text-[10px]">
                          {i + 1}. ..................
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                        Belum ada data pendaftar pada kegiatan ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* SIGNATURE BLOCK */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs print-avoid-break">
                <div>
                  <p className="text-slate-500">Mengetahui,</p>
                  <p className="font-semibold text-slate-900 mt-0.5">Ketua Panitia Pelaksana</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-bold text-slate-950 underline">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500">Makassar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold text-slate-900 mt-0.5">PJ Seksi Ritual / Acara</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-bold text-slate-950 underline">{org?.pj_acara_name || 'Suryani Dewi'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD PROPOSAL & LPJ MODES */
            <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
              
              {/* SECTION 1: STRUKTUR KEPANITIAAN */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  I. Susunan Panitia Pelaksana Kegiatan
                </h4>
                
                <div className="grid grid-cols-3 gap-3 text-center pt-1">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Ketua Panitia</span>
                    <strong className="text-slate-900 font-bold text-xs">{org?.ketua_name || '-'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Sekretaris</span>
                    <strong className="text-slate-900 font-bold text-xs">{org?.sekretaris_name || '-'}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Bendahara</span>
                    <strong className="text-slate-900 font-bold text-xs">{org?.bendahara_name || '-'}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 2: RUNDOWN PROPOSAL */}
              {event.proposal_rundowns && event.proposal_rundowns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                    II. Rundown & Jadwal Pelaksanaan Acara
                  </h4>
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        <th className="p-2 border border-slate-300 text-center w-8">No</th>
                        <th className="p-2 border border-slate-300">Hari & Tanggal</th>
                        <th className="p-2 border border-slate-300 text-center">Waktu</th>
                        <th className="p-2 border border-slate-300">Kegiatan / Agenda</th>
                        <th className="p-2 border border-slate-300">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.proposal_rundowns.map((r, i) => (
                        <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="p-2 border border-slate-300 text-center text-slate-500">{i + 1}</td>
                          <td className="p-2 border border-slate-300 font-medium text-slate-800">{r.day_date}</td>
                          <td className="p-2 border border-slate-300 text-center font-mono text-slate-800">{r.time_slot}</td>
                          <td className="p-2 border border-slate-300 font-medium text-slate-900">{r.activity}</td>
                          <td className="p-2 border border-slate-300 text-slate-500">{r.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SECTION 3 (FOR LPJ): UNIFIED PARTICIPANT TABLE */}
              {pdfMode === 'lpj' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline border-b border-slate-300 pb-1">
                    <h4 className="text-xs font-bold uppercase text-slate-900">
                      III. Rekapitulasi Umat Terdaftar
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">Total: {lpjSortedRegistrations.length} Umat</span>
                  </div>

                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        <th className="p-2 border border-slate-300 text-center w-8">No</th>
                        <th className="p-2 border border-slate-300">Nama Lengkap Umat</th>
                        <th className="p-2 border border-slate-300 text-center">Bagian</th>
                        <th className="p-2 border border-slate-300">Cetya & HAN Naungan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lpjSortedRegistrations.length > 0 ? (
                        lpjSortedRegistrations.map((reg, idx) => (
                          <tr key={reg.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                            <td className="p-2 border border-slate-300 text-center text-slate-500">{idx + 1}</td>
                            <td className="p-2 border border-slate-300 font-semibold text-slate-900">{reg.profile?.full_name || 'Umat Vihara'}</td>
                            <td className="p-2 border border-slate-300 text-center font-medium text-slate-800">
                              {reg.profile?.bagian || 'Inspirasi'}
                            </td>
                            <td className="p-2 border border-slate-300 text-slate-600">
                              {reg.profile?.cetya || '-'} / {reg.profile?.han || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                            Belum ada pendaftar pada kegiatan ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SECTION 4: KEUANGAN LPJ & PROPOSAL */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  {pdfMode === 'proposal' ? 'III. Rencana Anggaran Biaya (RAB) & Proyeksi Pemasukan' : 'IV. Laporan Keuangan, Pemasukan & Realisasi Pengeluaran'}
                </h4>

                {pdfMode === 'lpj' && (
                  <div className="space-y-1.5">
                    <h5 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wide">
                      A. Rincian Pemasukan Pendaftaran per Bagian Umat
                    </h5>
                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 font-semibold text-[11px]">
                          <th className="p-2 border border-slate-300 text-center w-8">No</th>
                          <th className="p-2 border border-slate-300">Bagian Umat</th>
                          <th className="p-2 border border-slate-300 text-right">Tarif (Rp)</th>
                          <th className="p-2 border border-slate-300 text-center">Jumlah Umat</th>
                          <th className="p-2 border border-slate-300 text-right">Subtotal Pemasukan (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bagianBreakdown.length > 0 ? (
                          bagianBreakdown.map((item, idx) => (
                            <tr key={item.bagian} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                              <td className="p-2 border border-slate-300 text-center text-slate-500">{idx + 1}</td>
                              <td className="p-2 border border-slate-300 font-semibold text-slate-900">{item.bagian}</td>
                              <td className="p-2 border border-slate-300 text-right font-mono">Rp {item.basePrice.toLocaleString('id-ID')}</td>
                              <td className="p-2 border border-slate-300 text-center font-medium">{item.count} Umat</td>
                              <td className="p-2 border border-slate-300 text-right font-mono font-medium text-slate-900">
                                Rp {item.totalPemasukanBagian.toLocaleString('id-ID')}
                                {item.subtotalExtra > 0 && (
                                  <span className="block text-[9px] text-slate-500 font-normal">
                                    (termasuk ekstra: Rp {item.subtotalExtra.toLocaleString('id-ID')})
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-3 text-center text-slate-400 italic">
                              Belum ada pendaftaran Umat pada bagian manapun.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-100/80 font-bold text-slate-900">
                          <td colSpan={4} className="p-2 border border-slate-300 text-right uppercase">TOTAL PEMASUKAN PENDAFTARAN</td>
                          <td className="p-2 border border-slate-300 text-right font-mono font-bold text-slate-900">
                            Rp {totalUmatRegistrationFees.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Table B / Main Financial Table */}
                <div className="space-y-1.5">
                  {pdfMode === 'lpj' && (
                    <h5 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wide">
                      B. Rekapitulasi Pemasukan, Anggaran RAB & Realisasi Pengeluaran
                    </h5>
                  )}
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        <th className="p-2 border border-slate-300 text-center w-8">No</th>
                        <th className="p-2 border border-slate-300">Uraian / Keterangan</th>
                        <th className="p-2 border border-slate-300 text-right">Pemasukan (Rp)</th>
                        <th className="p-2 border border-slate-300 text-right">Target RAB (Rp)</th>
                        {pdfMode === 'lpj' && <th className="p-2 border border-slate-300 text-right">Realisasi (Rp)</th>}
                        <th className="p-2 border border-slate-300 text-right">Selisih (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Baris Utama: Total Biaya Pendaftaran Kegiatan Umat */}
                      <tr className="bg-white font-medium">
                        <td className="p-2 border border-slate-300 text-center text-slate-500">1</td>
                        <td className="p-2 border border-slate-300 font-semibold text-slate-900">
                          Total Biaya Pendaftaran Umat ({registrations.length} Peserta)
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono text-slate-900">
                          + Rp {totalUmatRegistrationFees.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 border border-slate-300 text-right text-slate-400">-</td>
                        {pdfMode === 'lpj' && <td className="p-2 border border-slate-300 text-right text-slate-400">-</td>}
                        <td className="p-2 border border-slate-300 text-right font-mono text-slate-900">
                          + Rp {totalUmatRegistrationFees.toLocaleString('id-ID')}
                        </td>
                      </tr>

                      {(() => {
                        const pdfGroupedMap: Record<string, { key: string; itemName: string; pemasukan: number; rab: number; realisasi: number }> = {};
                        (event.budgets || []).forEach((b) => {
                          const cleanName = b.item_name.trim();
                          const key = cleanName.toLowerCase();
                          if (!pdfGroupedMap[key]) {
                            pdfGroupedMap[key] = {
                              key,
                              itemName: cleanName,
                              pemasukan: b.budget_type === 'pemasukan' ? b.amount : 0,
                              rab: b.budget_type === 'rab' ? b.amount : 0,
                              realisasi: b.budget_type === 'realisasi' ? b.amount : 0,
                            };
                          } else {
                            if (b.budget_type === 'pemasukan') pdfGroupedMap[key].pemasukan += b.amount;
                            else if (b.budget_type === 'rab') pdfGroupedMap[key].rab += b.amount;
                            else if (b.budget_type === 'realisasi') pdfGroupedMap[key].realisasi += b.amount;
                          }
                        });

                        const groupedPdfItems = Object.values(pdfGroupedMap);

                        return groupedPdfItems.map((item, i) => {
                          const hasRAB = item.rab > 0;
                          const hasRealisasi = item.realisasi > 0;

                          let displayedSelisih: number | null = null;
                          let isOverBudget = false;

                          if (pdfMode === 'lpj') {
                            if (hasRAB && hasRealisasi) {
                              displayedSelisih = item.rab - item.realisasi;
                              if (displayedSelisih < 0) isOverBudget = true;
                            } else if (hasRAB) {
                              displayedSelisih = item.rab;
                            } else {
                              displayedSelisih = null;
                            }
                          } else {
                            displayedSelisih = item.pemasukan - item.rab;
                          }

                          return (
                            <tr key={item.key} className={i % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}>
                              <td className="p-2 border border-slate-300 text-center text-slate-500">{i + 2}</td>
                              <td className="p-2 border border-slate-300 font-medium text-slate-900">{item.itemName}</td>
                              <td className="p-2 border border-slate-300 text-right font-mono">
                                {item.pemasukan > 0 ? `+ Rp ${item.pemasukan.toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="p-2 border border-slate-300 text-right font-mono">
                                {item.rab > 0 ? `Rp ${item.rab.toLocaleString('id-ID')}` : '-'}
                              </td>
                              {pdfMode === 'lpj' && (
                                <td className="p-2 border border-slate-300 text-right font-mono">
                                  {item.realisasi > 0 ? `Rp ${item.realisasi.toLocaleString('id-ID')}` : '-'}
                                </td>
                              )}
                              <td className={`p-2 border border-slate-300 text-right font-mono ${
                                isOverBudget ? 'text-rose-700 font-semibold' : 'text-slate-800'
                              }`}>
                                {displayedSelisih !== null
                                  ? displayedSelisih > 0 
                                    ? `+ Rp ${displayedSelisih.toLocaleString('id-ID')}`
                                    : displayedSelisih < 0
                                      ? `- Rp ${Math.abs(displayedSelisih).toLocaleString('id-ID')}`
                                      : 'Rp 0'
                                  : '-'}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                    <tfoot>
                      {(() => {
                        const selisihTotalProposal = totalPemasukanGlobal - totalRAB;
                        const selisihTotalLpj = totalRAB - totalRealisasi;
                        const displayedTotalSelisih = pdfMode === 'lpj' ? selisihTotalLpj : selisihTotalProposal;
                        const isTotalOver = pdfMode === 'lpj' ? (totalRAB > 0 && totalRealisasi > totalRAB) : false;

                        return (
                          <>
                            <tr className="bg-slate-100 font-bold text-slate-900">
                              <td colSpan={2} className="p-2 border border-slate-300 text-right uppercase">TOTAL</td>
                              <td className="p-2 border border-slate-300 text-right font-mono">Rp {totalPemasukanGlobal.toLocaleString('id-ID')}</td>
                              <td className="p-2 border border-slate-300 text-right font-mono">Rp {totalRAB.toLocaleString('id-ID')}</td>
                              {pdfMode === 'lpj' && <td className="p-2 border border-slate-300 text-right font-mono">Rp {totalRealisasi.toLocaleString('id-ID')}</td>}
                              <td className={`p-2 border border-slate-300 text-right font-mono ${
                                isTotalOver ? 'text-rose-700 font-bold' : 'text-slate-900 font-bold'
                              }`}>
                                {displayedTotalSelisih >= 0 
                                  ? `+ Rp ${displayedTotalSelisih.toLocaleString('id-ID')}` 
                                  : `- Rp ${Math.abs(displayedTotalSelisih).toLocaleString('id-ID')}`}
                              </td>
                            </tr>
                            {pdfMode === 'lpj' && (
                              <tr className="bg-slate-200/80 font-bold text-slate-900 text-xs">
                                <td colSpan={5} className="p-2.5 border border-slate-300 text-right uppercase tracking-wide">
                                  SALDO KEUANGAN AKHIR (PEMASUKAN - REALISASI)
                                </td>
                                <td className={`p-2.5 border border-slate-300 text-right font-mono font-bold ${
                                  saldoKasGlobal >= 0 ? 'text-emerald-800' : 'text-rose-800'
                                }`}>
                                  Rp {saldoKasGlobal.toLocaleString('id-ID')} {saldoKasGlobal >= 0 ? '(SURPLUS)' : '(DEFISIT)'}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })()}
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* SIGNATURE BLOCK */}
              <div className="pt-6 grid grid-cols-2 text-center text-xs print-avoid-break">
                <div>
                  <p className="text-slate-500">Mengetahui,</p>
                  <p className="font-semibold text-slate-900 mt-0.5">Ketua Panitia Pelaksana</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-bold text-slate-950 underline">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500">Makassar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-semibold text-slate-900 mt-0.5">Sekretaris Panitia</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-bold text-slate-950 underline">{org?.sekretaris_name || 'Suryani Dewi'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
