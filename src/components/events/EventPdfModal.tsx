import React from 'react';
import { Printer, X } from 'lucide-react';
import { ViharaEvent, EventRegistration, UmatBagian } from '@/types/database';

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
  onClose}) => {
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
    <div id="printable-pdf-document-wrapper" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Modal Controls (Hidden when printed) */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-purple-800 flex justify-between items-center text-white print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Printer size={16} className="text-purple-400" />
            <span>Dokumen Siap Cetak: <strong className="text-amber-300 uppercase">
              {pdfMode === 'proposal' ? 'Proposal Event' : pdfMode === 'lpj' ? 'LPJ Event' : 'Daftar Peserta (Ketua Acara)'}
            </strong></span>
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
        <div id="printable-pdf-document" className="bg-white text-slate-900 p-8 md:p-12 rounded-2xl shadow-2xl space-y-6 print:p-0 print:shadow-none print:bg-transparent">
          
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
              {pdfMode === 'proposal' 
                ? 'PROPOSAL PELAKSANAAN EVENT' 
                : pdfMode === 'lpj' 
                  ? 'LAPORAN PERTANGGUNGJAWABAN (LPJ) EVENT' 
                  : 'DAFTAR PESERTA & HASIL REGISTRASI UMAT'}
            </h3>
            <p className="text-sm font-extrabold text-slate-800">{event.title}</p>
            <p className="text-xs text-slate-500 font-semibold">
              Tanggal Kegiatan: {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | Lokasi: {event.location}
            </p>
          </div>

          {/* DOKUMEN CONTENT */}
          {pdfMode === 'peserta' ? (
            /* SPECIAL CLEAN PARTICIPANT ROSTER FOR KETUA ACARA (NO FEES) */
            <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
              <div className="flex justify-between items-center bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs">
                <div>
                  <span className="font-extrabold text-purple-950 block">Total Umat Terdaftar: {sortedRegistrations.length} Umat</span>
                  <span className="text-[11px] text-slate-500">Laporan Resmi Khusus Ketua Acara & Seksi Ritual Pelaksana</span>
                </div>
                <div className="text-right text-[11px] font-bold text-slate-600">
                  Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-purple-950 text-white font-bold text-[11px]">
                    <th className="p-2.5 border border-slate-300 text-center w-8">No</th>
                    <th className="p-2.5 border border-slate-300">Nama Lengkap Umat</th>
                    <th className="p-2.5 border border-slate-300 text-center w-12">L/P</th>
                    <th className="p-2.5 border border-slate-300 text-center">Bagian Umat</th>
                    <th className="p-2.5 border border-slate-300">Cetya & HAN Naungan</th>
                    <th className="p-2.5 border border-slate-300 text-center">No. Telepon / HP</th>
                    <th className="p-2.5 border border-slate-300 text-center">Status Presensi</th>
                    <th className="p-2.5 border border-slate-300 text-center w-28">Paraf / TTD</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegistrations.length > 0 ? (
                    sortedRegistrations.map((reg, i) => (
                      <tr key={reg.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <td className="p-2 border border-slate-300 text-center font-bold text-slate-500">{i + 1}</td>
                        <td className="p-2 border border-slate-300 font-extrabold text-slate-900">
                          {reg.profile?.full_name || 'Umat Vihara'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-bold">
                          {reg.profile?.gender || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-extrabold text-purple-900">
                          {reg.profile?.bagian || 'Inspirasi'}
                        </td>
                        <td className="p-2 border border-slate-300 text-slate-600">
                          {reg.profile?.cetya || '-'} / {reg.profile?.han || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono font-semibold text-slate-700">
                          {reg.profile?.phone || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-bold">
                          {reg.is_attended ? (
                            <span className="text-emerald-700 font-extrabold">✓ Hadir</span>
                          ) : (
                            <span className="text-slate-400">Belum Presensi</span>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300 text-center text-slate-300 text-[10px]">
                          {i + 1}. ..................
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400 italic">
                        Belum ada data pendaftar pada event ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* SIGNATURE BLOCK */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs print-avoid-break">
                <div>
                  <p className="text-slate-500">Mengetahui / Penanggung Jawab,</p>
                  <p className="font-extrabold text-slate-900 mt-1">Ketua Acara / Panitia Utama</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-black text-purple-950 underline">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</span>
                  </div>
                </div>

                <div>
                  <p className="text-slate-500">Makassar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-extrabold text-slate-900 mt-1">PJ Seksi Ritual / Acara</p>
                  <div className="h-16 flex items-end justify-center">
                    <span className="font-black text-purple-950 underline">{org?.pj_acara_name || 'Suryani Dewi'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD PROPOSAL & LPJ MODES */
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
              </div>

              {/* SECTION 2: RUNDOWN PROPOSAL */}
              {event.proposal_rundowns && event.proposal_rundowns.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                    II. Rundown & Jadwal Pelaksanaan Acara
                  </h4>
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-purple-950 text-white font-bold">
                        <th className="p-2 border border-slate-300 text-center w-8">No</th>
                        <th className="p-2 border border-slate-300">Hari & Tanggal</th>
                        <th className="p-2 border border-slate-300 text-center">Jam / Waktu</th>
                        <th className="p-2 border border-slate-300">Kegiatan / Agenda</th>
                        <th className="p-2 border border-slate-300">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.proposal_rundowns.map((r, i) => (
                        <tr key={r.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="p-2 border border-slate-300 text-center font-bold">{i + 1}</td>
                          <td className="p-2 border border-slate-300 font-semibold">{r.day_date}</td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-bold text-purple-900">{r.time_slot}</td>
                          <td className="p-2 border border-slate-300 font-bold">{r.activity}</td>
                          <td className="p-2 border border-slate-300 text-slate-500">{r.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SECTION 3 (FOR LPJ): UNIFIED PARTICIPANT TABLE SORTED BY BAGIAN ORDER */}
              {pdfMode === 'lpj' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                    III. Daftar Umat Terdaftar
                  </h4>

                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold text-[11px]">
                        <th className="p-2 border border-slate-300 text-center w-8">No</th>
                        <th className="p-2 border border-slate-300">Nama Lengkap Umat</th>
                        <th className="p-2 border border-slate-300 text-center">Bagian</th>
                        <th className="p-2 border border-slate-300">Cetya & HAN Naungan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lpjSortedRegistrations.length > 0 ? (
                        lpjSortedRegistrations.map((reg, idx) => (
                          <tr key={reg.id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="p-2 border border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                            <td className="p-2 border border-slate-300 font-extrabold text-slate-900">{reg.profile?.full_name || 'Umat Vihara'}</td>
                            <td className="p-2 border border-slate-300 text-center font-bold text-purple-900">
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
                            Belum ada pendaftar pada event ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SECTION 4: KEUANGAN LPJ (RINCIAN BIAYA PER BAGIAN & REALISASI) */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                  {pdfMode === 'proposal' ? 'III. Rencana Anggaran Biaya (RAB)' : 'IV. Laporan Keuangan, Dana Paramita & Realisasi'}
                </h4>

                {pdfMode === 'lpj' && (
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                      A. Rincian Pemasukan Biaya Pendaftaran Umat Per Bagian
                    </h5>
                    <table className="w-full text-left text-xs border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-purple-950 text-white font-bold">
                          <th className="p-2 border border-slate-300 text-center w-8">No</th>
                          <th className="p-2 border border-slate-300">Nama Bagian Umat</th>
                          <th className="p-2 border border-slate-300 text-right">Tarif Pokok (Rp)</th>
                          <th className="p-2 border border-slate-300 text-center">Jumlah Umat Terdaftar</th>
                          <th className="p-2 border border-slate-300 text-right">Subtotal Pemasukan (Rp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bagianBreakdown.length > 0 ? (
                          bagianBreakdown.map((item, idx) => (
                            <tr key={item.bagian} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="p-2 border border-slate-300 text-center font-bold text-slate-500">{idx + 1}</td>
                              <td className="p-2 border border-slate-300 font-extrabold text-slate-900">{item.bagian}</td>
                              <td className="p-2 border border-slate-300 text-right font-semibold">Rp {item.basePrice.toLocaleString('id-ID')}</td>
                              <td className="p-2 border border-slate-300 text-center font-bold text-purple-900">{item.count} Umat</td>
                              <td className="p-2 border border-slate-300 text-right font-bold text-emerald-700">
                                Rp {item.totalPemasukanBagian.toLocaleString('id-ID')}
                                {item.subtotalExtra > 0 && (
                                  <span className="block text-[9px] font-normal text-slate-500">
                                    (termasuk Ekstra: Rp {item.subtotalExtra.toLocaleString('id-ID')})
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
                        <tr className="bg-emerald-100 font-black text-emerald-950">
                          <td colSpan={4} className="p-2 border border-slate-300 text-right uppercase">TOTAL PEMASUKAN PENDAFTARAN UMAT</td>
                          <td className="p-2 border border-slate-300 text-right text-emerald-900 font-black">
                            Rp {totalUmatRegistrationFees.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {/* Table B / Main Financial Table */}
                <div className="space-y-2">
                  {pdfMode === 'lpj' && (
                    <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                      B. Dana Paramita (Pemasukan Manual), Target RAB & Realisasi Pengeluaran
                    </h5>
                  )}
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-purple-900 text-white font-bold">
                        <th className="p-2 border border-slate-300 text-center w-8">No</th>
                        <th className="p-2 border border-slate-300">Nama Item / Keterangan</th>
                        {pdfMode === 'lpj' && <th className="p-2 border border-slate-300 text-right">Dana Paramita (Rp)</th>}
                        <th className="p-2 border border-slate-300 text-right">Anggaran RAB (Rp)</th>
                        {pdfMode === 'lpj' && <th className="p-2 border border-slate-300 text-right">Realisasi (Rp)</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {event.budgets && event.budgets.length > 0 ? (
                        event.budgets.map((b, i) => {
                          const isPemasukan = b.budget_type === 'pemasukan';
                          return (
                            <tr key={b.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                              <td className="p-2 border border-slate-300 text-center font-bold">{i + 1}</td>
                              <td className="p-2 border border-slate-300 font-bold">
                                {b.item_name}{' '}
                                <span className="text-[9px] font-normal text-slate-500">
                                  ({b.budget_type === 'pemasukan' ? 'Pemasukan Manual' : b.budget_type === 'rab' ? 'RAB' : 'Realisasi'})
                                </span>
                              </td>
                              {pdfMode === 'lpj' && (
                                <td className="p-2 border border-slate-300 text-right font-bold text-emerald-700">
                                  {isPemasukan ? `+ Rp ${b.amount.toLocaleString('id-ID')}` : '-'}
                                </td>
                              )}
                              <td className="p-2 border border-slate-300 text-right font-semibold">
                                {b.budget_type === 'rab' ? `Rp ${b.amount.toLocaleString('id-ID')}` : '-'}
                              </td>
                              {pdfMode === 'lpj' && (
                                <td className="p-2 border border-slate-300 text-right font-semibold text-amber-900">
                                  {b.budget_type === 'realisasi' ? `Rp ${b.amount.toLocaleString('id-ID')}` : '-'}
                                </td>
                              )}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={pdfMode === 'lpj' ? 5 : 3} className="p-4 text-center text-slate-400 italic">
                            Belum ada item keuangan manual yang dimasukkan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-purple-100 font-extrabold">
                        <td colSpan={2} className="p-2 border border-slate-300 text-right">TOTAL PEMASUKAN MANUAL & ANGGARAN</td>
                        {pdfMode === 'lpj' && <td className="p-2 border border-slate-300 text-right text-emerald-800">Rp {totalPemasukanManual.toLocaleString('id-ID')}</td>}
                        <td className="p-2 border border-slate-300 text-right text-purple-950">Rp {totalRAB.toLocaleString('id-ID')}</td>
                        {pdfMode === 'lpj' && <td className="p-2 border border-slate-300 text-right text-amber-950">Rp {totalRealisasi.toLocaleString('id-ID')}</td>}
                      </tr>
                      {pdfMode === 'lpj' && (
                        <>
                          <tr className="bg-purple-200 font-black">
                            <td colSpan={4} className="p-2 border border-slate-300 text-right uppercase">TOTAL PEMASUKAN GLOBAL (PARAMITA + PENDAFTARAN UMAT)</td>
                            <td className="p-2 border border-slate-300 text-right text-emerald-950 font-black">
                              Rp {totalPemasukanGlobal.toLocaleString('id-ID')}
                            </td>
                          </tr>
                          <tr className="bg-purple-900 text-white font-black text-xs">
                            <td colSpan={4} className="p-2 border border-slate-300 text-right uppercase">SALDO KEUANGAN EVENT (TOTAL PEMASUKAN GLOBAL - REALISASI)</td>
                            <td className={`p-2 border border-slate-300 text-right ${saldoKasGlobal >= 0 ? 'text-amber-300' : 'text-rose-300'}`}>
                              Rp {saldoKasGlobal.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        </>
                      )}
                    </tfoot>
                  </table>
                </div>
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
          )}

        </div>
      </div>
    </div>
  );
};
