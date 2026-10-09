import { EventBudget, EventSkenarioKerja, ViharaEvent, EventRegistration, UmatBagian } from '@/types/database';

/**
 * Generates an executive, professionally styled Microsoft Excel (.xls) spreadsheet for RAB & Realisasi.
 * All numeric/amount columns contain strictly pure numeric values with mso-number-format for native Excel calculations.
 */
export function exportRABToExcel(
  eventTitle: string, 
  budgets: EventBudget[], 
  totalUmatRegistrationFees: number = 0, 
  registrationsCount: number = 0
) {
  const pemasukanItems = budgets.filter(b => b.budget_type === 'pemasukan');
  const rabItems = budgets.filter(b => b.budget_type === 'rab');
  const realisasiItems = budgets.filter(b => b.budget_type === 'realisasi');

  const itemMap: Record<string, { pemasukan: number; rab: number; realisasi: number; notes: string }> = {};

  // Insert Umat Registration Fee Income if present
  if (totalUmatRegistrationFees > 0 || registrationsCount > 0) {
    const label = `Penerimaan Pendaftaran Peserta (${registrationsCount} Orang)`;
    itemMap[label] = {
      pemasukan: Number(totalUmatRegistrationFees) || 0,
      rab: 0,
      realisasi: 0,
      notes: `Total penerimaan biaya pendaftaran ${registrationsCount} peserta terdaftar`
    };
  }

  pemasukanItems.forEach(b => {
    if (!itemMap[b.item_name]) {
      itemMap[b.item_name] = {
        pemasukan: Number(b.amount) || 0,
        rab: 0,
        realisasi: 0,
        notes: b.notes || '-'
      };
    } else {
      itemMap[b.item_name].pemasukan += Number(b.amount) || 0;
    }
  });

  rabItems.forEach(b => {
    if (!itemMap[b.item_name]) {
      itemMap[b.item_name] = { pemasukan: 0, rab: Number(b.amount) || 0, realisasi: 0, notes: b.notes || '-' };
    } else {
      itemMap[b.item_name].rab = Number(b.amount) || 0;
      if (b.notes) itemMap[b.item_name].notes = b.notes;
    }
  });

  realisasiItems.forEach(b => {
    if (!itemMap[b.item_name]) {
      itemMap[b.item_name] = { pemasukan: 0, rab: 0, realisasi: Number(b.amount) || 0, notes: b.notes || '-' };
    } else {
      itemMap[b.item_name].realisasi = Number(b.amount) || 0;
      if (b.notes) itemMap[b.item_name].notes = b.notes;
    }
  });

  const exportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Anggaran & Realisasi</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; }
        .doc-title { font-size: 14pt; font-weight: bold; text-align: center; background-color: #0f172a; color: #ffffff; padding: 12px; }
        .doc-sub { font-size: 10.5pt; text-align: center; background-color: #1e293b; color: #fbbf24; font-weight: bold; padding: 6px; }
        .meta-label { font-weight: bold; background-color: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 6px 10px; }
        .meta-val { background-color: #ffffff; border: 1px solid #cbd5e1; padding: 6px 10px; }
        th { background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: center; padding: 9px 10px; border: 1px solid #0f172a; font-size: 10.5pt; }
        td { border: 1px solid #cbd5e1; padding: 6px 9px; vertical-align: middle; }
        .row-even { background-color: #f8fafc; }
        .row-odd { background-color: #ffffff; }
        .row-highlight { background-color: #f0fdf4; font-weight: bold; }
        .num { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; }
        .num-bold { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; font-weight: bold; }
        .num-green { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; color: #166534; font-weight: bold; }
        .num-red { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; color: #b91c1c; font-weight: bold; }
        .num-int { mso-number-format:"0"; text-align: center; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .badge-status { text-align: center; font-weight: bold; font-size: 10pt; }
        .footer-total { background-color: #e2e8f0; font-weight: bold; border-top: 2px solid #0f172a; }
        .footer-saldo { background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 11pt; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="8" class="doc-title">LAPORAN RENCANA ANGGARAN BIAYA (RAB) & PENGELUARAN KEGIATAN</td>
        </tr>
        <tr>
          <td colspan="8" class="doc-sub">MAJELIS NICHIREN SHOSHU BUDDHA DHARMA INDONESIA (MNSBDI) - SENTRA MAKASSAR</td>
        </tr>
        <tr><td colspan="8"></td></tr>
        <tr>
          <td class="meta-label">Nama Kegiatan:</td>
          <td colspan="4" class="meta-val"><b>${eventTitle}</b></td>
          <td class="meta-label">Tanggal Laporan:</td>
          <td colspan="2" class="meta-val">${exportDate}</td>
        </tr>
        <tr><td colspan="8"></td></tr>
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th style="width: 270px;">Uraian Kegiatan / Item</th>
            <th style="width: 150px;">Pemasukan (Rp)</th>
            <th style="width: 150px;">Anggaran (RAB) (Rp)</th>
            <th style="width: 150px;">Pengeluaran (Rp)</th>
            <th style="width: 140px;">Selisih (Rp)</th>
            <th style="width: 130px;">Status</th>
            <th style="width: 200px;">Catatan</th>
          </tr>
        </thead>
        <tbody>
  `;

  let totalPemasukan = 0;
  let totalRAB = 0;
  let totalRealisasi = 0;
  let index = 1;

  if (Object.keys(itemMap).length === 0) {
    htmlContent += `
      <tr>
        <td colspan="8" class="text-center" style="color:#94a3b8; padding:14px;">Belum ada data anggaran kegiatan.</td>
      </tr>
    `;
  } else {
    Object.entries(itemMap).forEach(([itemName, data]) => {
      totalPemasukan += data.pemasukan;
      totalRAB += data.rab;
      totalRealisasi += data.realisasi;

      const hasRAB = data.rab > 0;
      const hasRealisasi = data.realisasi > 0;
      let selisih = 0;
      let statusStr = '-';

      if (data.pemasukan > 0 && !hasRAB && !hasRealisasi) {
        statusStr = 'Pemasukan';
      } else if (hasRAB && hasRealisasi) {
        selisih = data.rab - data.realisasi;
        if (selisih > 0) statusStr = 'Hemat';
        else if (selisih < 0) statusStr = 'Lebih Anggaran';
        else statusStr = 'Sesuai Anggaran';
      } else if (hasRAB) {
        selisih = data.rab;
        statusStr = 'Belum Terpakai';
      } else if (hasRealisasi) {
        selisih = -data.realisasi;
        statusStr = 'Pengeluaran Tambahan';
      }

      const isFirstIncomeRow = index === 1 && data.pemasukan > 0;
      const rowClass = isFirstIncomeRow ? 'row-highlight' : (index % 2 === 0 ? 'row-even' : 'row-odd');
      const selisihClass = selisih < 0 ? 'num-red' : selisih > 0 ? 'num-green' : 'num';

      htmlContent += `
        <tr class="${rowClass}">
          <td class="num-int">${index}</td>
          <td><b>${itemName}</b></td>
          <td class="num">${data.pemasukan}</td>
          <td class="num">${data.rab}</td>
          <td class="num">${data.realisasi}</td>
          <td class="${selisihClass}">${selisih}</td>
          <td class="badge-status">${statusStr}</td>
          <td>${data.notes}</td>
        </tr>
      `;
      index++;
    });
  }

  const saldoKas = totalPemasukan - totalRealisasi;
  const totalSelisih = totalRAB > 0 ? (totalRAB - totalRealisasi) : 0;

  htmlContent += `
        </tbody>
        <tfoot>
          <tr class="footer-total">
            <td colspan="2" class="text-left">TOTAL KESELURUHAN</td>
            <td class="num-bold">${totalPemasukan}</td>
            <td class="num-bold">${totalRAB}</td>
            <td class="num-bold">${totalRealisasi}</td>
            <td class="num-bold">${totalSelisih}</td>
            <td class="text-center">-</td>
            <td></td>
          </tr>
          <tr class="footer-saldo">
            <td colspan="2" class="text-left" style="color:#ffffff;">SISA KAS (PEMASUKAN - PENGELUARAN)</td>
            <td colspan="4" class="num-bold" style="color:#ffffff; font-size:11.5pt;">${saldoKas}</td>
            <td class="text-center" style="color:${saldoKas >= 0 ? '#4ade80' : '#f87171'}; font-weight:bold;">
              ${saldoKas >= 0 ? 'Surplus' : 'Defisit'}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_RAB_${eventTitle.replace(/[^a-zA-Z0-9_]/g, '_')}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


/**
 * Generates an executive, clean Microsoft Excel (.xls) document for Jadwal Kerja Tim Lapangan.
 */
export function exportSkenarioKerjaToExcel(eventTitle: string, skenarioList: EventSkenarioKerja[]) {
  const exportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Jadwal Kerja Tim Lapangan</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; }
        .doc-title { font-size: 14pt; font-weight: bold; text-align: center; background-color: #0f172a; color: #ffffff; padding: 12px; }
        .doc-sub { font-size: 10.5pt; text-align: center; background-color: #1e293b; color: #fbbf24; font-weight: bold; padding: 6px; }
        .meta-label { font-weight: bold; background-color: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 6px 10px; }
        .meta-val { background-color: #ffffff; border: 1px solid #cbd5e1; padding: 6px 10px; }
        th { background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: center; padding: 9px 10px; border: 1px solid #0f172a; font-size: 10.5pt; }
        td { border: 1px solid #cbd5e1; padding: 6px 9px; vertical-align: top; }
        .row-even { background-color: #f8fafc; }
        .row-odd { background-color: #ffffff; }
        .num-int { mso-number-format:"0"; text-align: center; font-weight: bold; }
        .text-center { text-align: center; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="7" class="doc-title">JADWAL KERJA TIM & ALUR LAPANGAN KEGIATAN</td>
        </tr>
        <tr>
          <td colspan="7" class="doc-sub">MAJELIS NICHIREN SHOSHU BUDDHA DHARMA INDONESIA (MNSBDI) - SENTRA MAKASSAR</td>
        </tr>
        <tr><td colspan="7"></td></tr>
        <tr>
          <td class="meta-label">Nama Kegiatan:</td>
          <td colspan="4" class="meta-val"><b>${eventTitle}</b></td>
          <td class="meta-label">Tanggal Laporan:</td>
          <td class="meta-val">${exportDate}</td>
        </tr>
        <tr><td colspan="7"></td></tr>
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th style="width: 170px;">Tahap / Hari</th>
            <th style="width: 110px;">Waktu</th>
            <th style="width: 210px;">Seksi & Penanggung Jawab</th>
            <th style="width: 290px;">Uraian Tugas / Kegiatan</th>
            <th style="width: 210px;">Koordinasi Terkait</th>
            <th style="width: 230px;">Catatan Lapangan</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (skenarioList.length === 0) {
    htmlContent += `
      <tr>
        <td colspan="7" class="text-center" style="color:#94a3b8; padding:14px;">Belum ada data jadwal alur kerja tim.</td>
      </tr>
    `;
  } else {
    skenarioList.forEach((item, index) => {
      const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
      htmlContent += `
        <tr class="${rowClass}">
          <td class="num-int">${index + 1}</td>
          <td class="text-center"><b>${item.day_phase || '-'}</b></td>
          <td class="text-center">${item.time_slot || '-'}</td>
          <td><b>${item.executor_bidang_pj || '-'}</b></td>
          <td>${item.activity || '-'}</td>
          <td>${item.interbid_bidang_pj || '-'}</td>
          <td style="color:#475569;">${item.notes || '-'}</td>
        </tr>
      `;
    });
  }

  htmlContent += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Jadwal_Kerja_Tim_${eventTitle.replace(/[^a-zA-Z0-9_]/g, '_')}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an executive, institutional Microsoft Excel (.xls) document for LAPORAN PERTANGGUNGJAWABAN (LPJ).
 * All numeric/amount columns contain strictly pure numeric values without concatenated text for seamless calculation.
 */
export function exportLPJToExcel(event: ViharaEvent, registrations: EventRegistration[]) {
  const eventTitle = event.title;
  const org = event.org_structure;
  const pemasukanItems = event.budgets?.filter(b => b.budget_type === 'pemasukan') || [];
  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];

  const pricing = event.pricing_per_bagian || {};
  const extraFees = event.extra_fees || [];
  const BAGIAN_LPJ_ORDER: UmatBagian[] = ['Inspirasi', 'Pria', 'Wanita', 'Pro-M 40s', 'Pro-M Progresif', 'GM', 'Bintang'];

  // 1. Breakdown Pemasukan Pendaftaran per Bagian
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

  const totalUmatRegistrationFees = bagianBreakdown.reduce((sum, b) => sum + b.totalPemasukanBagian, 0);
  const totalPemasukanManual = pemasukanItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPemasukanGlobal = totalPemasukanManual + totalUmatRegistrationFees;
  const totalRAB = rabItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + curr.amount, 0);
  const saldoKasGlobal = totalPemasukanGlobal - totalRealisasi;

  // 2. Grouped Financial Items Map
  const pdfGroupedMap: Record<string, { key: string; itemName: string; pemasukan: number; rab: number; realisasi: number; notes: string }> = {};
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
        notes: b.notes || '-'
      };
    } else {
      if (b.budget_type === 'pemasukan') pdfGroupedMap[key].pemasukan += b.amount;
      else if (b.budget_type === 'rab') pdfGroupedMap[key].rab += b.amount;
      else if (b.budget_type === 'realisasi') pdfGroupedMap[key].realisasi += b.amount;
      if (b.notes) pdfGroupedMap[key].notes = b.notes;
    }
  });

  const groupedPdfItems = Object.values(pdfGroupedMap);

  // 3. Sort Registrations for LPJ
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

  const exportDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const eventDateStr = new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>LPJ Kegiatan</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #0f172a; }
        .doc-title { font-size: 14pt; font-weight: bold; text-align: center; background-color: #0f172a; color: #ffffff; padding: 12px; }
        .doc-sub { font-size: 10.5pt; text-align: center; background-color: #1e293b; color: #fbbf24; font-weight: bold; padding: 6px; }
        .section-header { background-color: #1e293b; color: #ffffff; font-size: 11pt; font-weight: bold; padding: 8px 10px; border: 1px solid #0f172a; }
        .meta-label { font-weight: bold; background-color: #f1f5f9; color: #1e293b; border: 1px solid #cbd5e1; padding: 6px 10px; }
        .meta-val { background-color: #ffffff; border: 1px solid #cbd5e1; padding: 6px 10px; }
        th { background-color: #334155; color: #ffffff; font-weight: bold; text-align: center; padding: 8px 10px; border: 1px solid #1e293b; font-size: 10.5pt; }
        td { border: 1px solid #cbd5e1; padding: 6px 9px; vertical-align: middle; }
        .row-even { background-color: #f8fafc; }
        .row-odd { background-color: #ffffff; }
        .row-highlight { background-color: #f0fdf4; font-weight: bold; }
        .num { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; }
        .num-bold { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; font-weight: bold; }
        .num-green { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; color: #166534; font-weight: bold; }
        .num-red { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; color: #b91c1c; font-weight: bold; }
        .num-int { mso-number-format:"0"; text-align: center; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .badge-status { text-align: center; font-weight: bold; }
        .footer-total { background-color: #e2e8f0; font-weight: bold; border-top: 2px solid #0f172a; }
        .footer-saldo { background-color: #0f172a; color: #ffffff; font-weight: bold; font-size: 11pt; }
      </style>
    </head>
    <body>
      <table>
        <!-- DOKUMEN HEADER -->
        <tr>
          <td colspan="8" class="doc-title">LAPORAN PERTANGGUNGJAWABAN (LPJ) KEGIATAN</td>
        </tr>
        <tr>
          <td colspan="8" class="doc-sub">MAJELIS NICHIREN SHOSHU BUDDHA DHARMA INDONESIA (MNSBDI) - SENTRA MAKASSAR</td>
        </tr>
        <tr><td colspan="8"></td></tr>

        <!-- METADATA -->
        <tr>
          <td class="meta-label">Nama Kegiatan:</td>
          <td colspan="4" class="meta-val"><b>${eventTitle}</b></td>
          <td class="meta-label">Tanggal Pelaksanaan:</td>
          <td colspan="2" class="meta-val">${eventDateStr}</td>
        </tr>
        <tr>
          <td class="meta-label">Lokasi:</td>
          <td colspan="4" class="meta-val">${event.location || '-'}</td>
          <td class="meta-label">Tanggal Dokumen:</td>
          <td colspan="2" class="meta-val">${exportDate}</td>
        </tr>
        <tr>
          <td class="meta-label">Total Peserta:</td>
          <td colspan="4" class="meta-val">${registrations.length} Peserta Terdaftar</td>
          <td class="meta-label">Status Kas:</td>
          <td colspan="2" class="meta-val" style="font-weight:bold; color:${saldoKasGlobal >= 0 ? '#166534' : '#b91c1c'};">
            ${saldoKasGlobal >= 0 ? 'Surplus' : 'Defisit'}
          </td>
        </tr>
        <tr><td colspan="8"></td></tr>

        <!-- BAGIAN I: SUSUNAN PANITIA -->
        <tr>
          <td colspan="8" class="section-header">I. SUSUNAN PANITIA PELAKSANA KEGIATAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th colspan="3" style="width: 300px;">Jabatan / Seksi Panitia</th>
            <th colspan="4" style="width: 360px;">Nama Penanggung Jawab</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-odd">
            <td class="num-int">1</td>
            <td colspan="3"><b>Ketua Panitia Pelaksana</b></td>
            <td colspan="4">${org?.ketua_name || '-'}</td>
          </tr>
          <tr class="row-even">
            <td class="num-int">2</td>
            <td colspan="3"><b>Sekretaris Panitia</b></td>
            <td colspan="4">${org?.sekretaris_name || '-'}</td>
          </tr>
          <tr class="row-odd">
            <td class="num-int">3</td>
            <td colspan="3"><b>Bendahara Panitia</b></td>
            <td colspan="4">${org?.bendahara_name || '-'}</td>
          </tr>
          <tr class="row-even">
            <td class="num-int">4</td>
            <td colspan="3"><b>Seksi Acara & Ritual</b></td>
            <td colspan="4">${org?.pj_acara_name || '-'}</td>
          </tr>
          ${(org?.sub_acara || []).map((s, idx) => `
            <tr class="${idx % 2 === 0 ? 'row-odd' : 'row-even'}">
              <td class="num-int">4.${idx + 1}</td>
              <td colspan="3" style="padding-left: 20px;">└ Sub-seksi Acara: ${s.role_name}</td>
              <td colspan="4">${s.pic_name}</td>
            </tr>
          `).join('')}
          <tr class="row-odd">
            <td class="num-int">5</td>
            <td colspan="3"><b>Seksi Logistik & Perlengkapan</b></td>
            <td colspan="4">${org?.pj_umum_name || '-'}</td>
          </tr>
          ${(org?.sub_umum || []).map((s, idx) => `
            <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
              <td class="num-int">5.${idx + 1}</td>
              <td colspan="3" style="padding-left: 20px;">└ Sub-seksi Perlengkapan: ${s.role_name}</td>
              <td colspan="4">${s.pic_name}</td>
            </tr>
          `).join('')}
        </tbody>
        <tr><td colspan="8"></td></tr>

        <!-- BAGIAN II: REKAP PEMASUKAN PENDAFTARAN PESERTA PER BAGIAN -->
        <tr>
          <td colspan="8" class="section-header">II. RINCIAN BIAYA PENDAFTARAN PESERTA PER BAGIAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th colspan="3" style="width: 250px;">Bagian Umat</th>
            <th style="width: 140px;">Tarif Pokok (Rp)</th>
            <th style="width: 120px;">Jumlah Peserta</th>
            <th colspan="2" style="width: 200px;">Total Pemasukan (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${bagianBreakdown.length > 0 ? bagianBreakdown.map((item, idx) => `
            <tr class="${idx % 2 === 0 ? 'row-odd' : 'row-even'}">
              <td class="num-int">${idx + 1}</td>
              <td colspan="3"><b>${item.bagian}</b></td>
              <td class="num">${item.basePrice}</td>
              <td class="num-int">${item.count}</td>
              <td colspan="2" class="num">${item.totalPemasukanBagian}</td>
            </tr>
          `).join('') : `
            <tr><td colspan="8" class="text-center" style="color:#94a3b8; padding:12px;">Belum ada data pendaftaran bagian.</td></tr>
          `}
        </tbody>
        <tfoot>
          <tr class="footer-total">
            <td colspan="4" class="text-left">TOTAL BIAYA PENDAFTARAN PESERTA:</td>
            <td class="num-bold">-</td>
            <td class="num-int" style="font-weight:bold;">${registrations.length}</td>
            <td colspan="2" class="num-bold">${totalUmatRegistrationFees}</td>
          </tr>
        </tfoot>
        <tr><td colspan="8"></td></tr>

        <!-- BAGIAN III: REKAP KEUANGAN, RAB & REALISASI -->
        <tr>
          <td colspan="8" class="section-header">III. EVALUASI ANGGARAN & PENGELUARAN KEGIATAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th style="width: 260px;">Uraian Kebutuhan / Item</th>
            <th style="width: 140px;">Pemasukan (Rp)</th>
            <th style="width: 140px;">Anggaran (RAB) (Rp)</th>
            <th style="width: 140px;">Pengeluaran (Rp)</th>
            <th style="width: 140px;">Selisih (Rp)</th>
            <th style="width: 130px;">Status</th>
            <th style="width: 180px;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          <!-- Row 1: Biaya Pendaftaran Umat -->
          <tr class="row-highlight">
            <td class="num-int">1</td>
            <td><b>Penerimaan Pendaftaran Peserta (${registrations.length} Orang)</b></td>
            <td class="num">${totalUmatRegistrationFees}</td>
            <td class="num">0</td>
            <td class="num">0</td>
            <td class="num">0</td>
            <td class="badge-status">Pemasukan</td>
            <td>Penerimaan biaya pendaftaran peserta</td>
          </tr>
          ${groupedPdfItems.map((item, idx) => {
            const hasRAB = item.rab > 0;
            const hasRealisasi = item.realisasi > 0;
            let selisihVal = 0;
            let statusText = '-';

            if (item.pemasukan > 0 && !hasRAB && !hasRealisasi) {
              statusText = 'Pemasukan';
            } else if (hasRAB && hasRealisasi) {
              selisihVal = item.rab - item.realisasi;
              if (selisihVal > 0) statusText = 'Hemat';
              else if (selisihVal < 0) statusText = 'Lebih Anggaran';
              else statusText = 'Sesuai Anggaran';
            } else if (hasRAB) {
              selisihVal = item.rab;
              statusText = 'Belum Terpakai';
            } else if (hasRealisasi) {
              selisihVal = -item.realisasi;
              statusText = 'Pengeluaran Tambahan';
            }

            const selisihClass = selisihVal < 0 ? 'num-red' : selisihVal > 0 ? 'num-green' : 'num';

            return `
              <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
                <td class="num-int">${idx + 2}</td>
                <td><b>${item.itemName}</b></td>
                <td class="num">${item.pemasukan || 0}</td>
                <td class="num">${item.rab || 0}</td>
                <td class="num">${item.realisasi || 0}</td>
                <td class="${selisihClass}">${selisihVal}</td>
                <td class="badge-status">${statusText}</td>
                <td>${item.notes || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr class="footer-total">
            <td colspan="2" class="text-left">TOTAL KESELURUHAN:</td>
            <td class="num-bold">${totalPemasukanGlobal}</td>
            <td class="num-bold">${totalRAB}</td>
            <td class="num-bold">${totalRealisasi}</td>
            <td class="num-bold">${totalRAB > 0 ? (totalRAB - totalRealisasi) : 0}</td>
            <td class="text-center">-</td>
            <td></td>
          </tr>
          <tr class="footer-saldo">
            <td colspan="2" class="text-left" style="color:#ffffff;">SISA KAS (PEMASUKAN - PENGELUARAN):</td>
            <td colspan="4" class="num-bold" style="color:#ffffff; font-size:11.5pt;">${saldoKasGlobal}</td>
            <td class="text-center" style="color:${saldoKasGlobal >= 0 ? '#4ade80' : '#f87171'}; font-weight:bold;">
              ${saldoKasGlobal >= 0 ? 'Surplus' : 'Defisit'}
            </td>
            <td></td>
          </tr>
        </tfoot>
        <tr><td colspan="8"></td></tr>

        <!-- BAGIAN IV: REKAPITULASI PESERTA UMAT -->
        <tr>
          <td colspan="8" class="section-header">IV. DAFTAR PESERTA & STATUS KEHADIRAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 45px;">No</th>
            <th style="width: 220px;">Nama Lengkap Peserta</th>
            <th style="width: 120px;">Bagian</th>
            <th style="width: 160px;">Cetya & HAN</th>
            <th style="width: 110px;">Status Pembayaran</th>
            <th style="width: 110px;">Kehadiran</th>
            <th style="width: 140px;">Biaya Pendaftaran (Rp)</th>
            <th style="width: 160px;">Biaya Tambahan</th>
          </tr>
        </thead>
        <tbody>
          ${lpjSortedRegistrations.length > 0 ? lpjSortedRegistrations.map((reg, idx) => {
            const userBagian = reg.profile?.bagian || 'Inspirasi';
            const baseFee = pricing[userBagian] || 0;
            const selectedIds = reg.selected_extra_fee_ids || [];
            const selectedExtras = extraFees.filter((f) => selectedIds.includes(f.id));
            const extraTotal = selectedExtras.reduce((sum, f) => sum + f.amount, 0);
            const userTotalFee = (reg.amount_paid !== undefined && reg.amount_paid !== null && reg.amount_paid > 0) 
              ? reg.amount_paid 
              : (baseFee + extraTotal);
            const extraNote = selectedExtras.map(e => e.fee_name).join(', ') || '-';

            return `
              <tr class="${idx % 2 === 0 ? 'row-odd' : 'row-even'}">
                <td class="num-int">${idx + 1}</td>
                <td><b>${reg.profile?.full_name || 'Peserta'}</b></td>
                <td class="text-center">${userBagian}</td>
                <td>${reg.profile?.cetya || '-'} / ${reg.profile?.han || '-'}</td>
                <td class="text-center" style="font-weight:bold; color:${reg.is_paid ? '#166534' : '#64748b'};">
                  ${reg.is_paid ? 'Lunas' : 'Belum Lunas'}
                </td>
                <td class="text-center" style="font-weight:bold; color:${reg.is_attended ? '#166534' : '#64748b'};">
                  ${reg.is_attended ? 'Hadir' : 'Belum Hadir'}
                </td>
                <td class="num">${userTotalFee}</td>
                <td>${extraNote}</td>
              </tr>
            `;
          }).join('') : `
            <tr><td colspan="8" class="text-center" style="color:#94a3b8; padding:12px;">Belum ada data peserta terdaftar.</td></tr>
          `}
        </tbody>
        <tfoot>
          <tr class="footer-total">
            <td colspan="6" class="text-left">TOTAL BIAYA PENDAFTARAN PESERTA (${registrations.length} ORANG):</td>
            <td class="num-bold">${totalUmatRegistrationFees}</td>
            <td></td>
          </tr>
        </tfoot>
        <tr><td colspan="8"></td></tr>

        <!-- LEMBAR TANDA TANGAN -->
        <tr>
          <td colspan="3" class="text-center" style="border:none; padding-top:24px;">
            Mengetahui,<br>
            <b>Ketua Panitia Pelaksana</b><br><br><br><br>
            <u><b>${org?.ketua_name || 'Hendra Kurniawan'}</b></u>
          </td>
          <td colspan="2" style="border:none;"></td>
          <td colspan="3" class="text-center" style="border:none; padding-top:24px;">
            Makassar, ${exportDate}<br>
            <b>Sekretaris Panitia</b><br><br><br><br>
            <u><b>${org?.sekretaris_name || 'Suryani Dewi'}</b></u>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `LPJ_${eventTitle.replace(/[^a-zA-Z0-9_]/g, '_')}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

