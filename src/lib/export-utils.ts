import { EventBudget, EventSkenarioKerja } from '@/types/database';

/**
 * Generates a clean, robust, 100% visible Excel CSV spreadsheet with UTF-8 BOM (\uFEFF)
 * and semicolon delimiters (compatible with Indonesian Windows Excel regional settings).
 * Opens immediately in Microsoft Excel with formatted columns, currency headers, and totals!
 */
export function exportRABToExcel(eventTitle: string, budgets: EventBudget[]) {
  const rabItems = budgets.filter(b => b.budget_type === 'rab');
  const realisasiItems = budgets.filter(b => b.budget_type === 'realisasi');

  const itemMap: Record<string, { rab: number; realisasi: number; notes: string }> = {};

  rabItems.forEach(b => {
    itemMap[b.item_name] = {
      rab: Number(b.amount),
      realisasi: 0,
      notes: b.notes || '-'
    };
  });

  realisasiItems.forEach(b => {
    if (!itemMap[b.item_name]) {
      itemMap[b.item_name] = { rab: 0, realisasi: Number(b.amount), notes: b.notes || '-' };
    } else {
      itemMap[b.item_name].realisasi = Number(b.amount);
      if (b.notes) itemMap[b.item_name].notes = b.notes;
    }
  });

  // UTF-8 BOM for Microsoft Excel auto-detect
  let csvContent = '\uFEFF';
  const sep = ';'; // Semicolon delimiter for Windows Excel regional compatibility

  // Header Title Block
  csvContent += `"LAPORAN ANGGARAN & REALISASI KEUANGAN EVENT - VIHARA MNSBDI"${sep}${sep}${sep}${sep}${sep}\n`;
  csvContent += `"Nama Event:"${sep}"${eventTitle.replace(/"/g, '""')}"${sep}${sep}${sep}${sep}\n`;
  csvContent += `"Tanggal Export:"${sep}"${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}"${sep}${sep}${sep}${sep}\n\n`;

  // Table Column Headers
  csvContent += `"No"${sep}"Nama Item Pengeluaran"${sep}"Anggaran Rencana (RAB)"${sep}"Realisasi Aktual"${sep}"Selisih (Hemat / Over)"${sep}"Status / Catatan"\n`;

  let totalRAB = 0;
  let totalRealisasi = 0;
  let index = 1;

  Object.entries(itemMap).forEach(([itemName, data]) => {
    const variance = data.rab - data.realisasi;
    const status = variance >= 0 ? 'Hemat / Sesuai Target' : 'Over Budget';

    totalRAB += data.rab;
    totalRealisasi += data.realisasi;

    const formattedRAB = `Rp ${data.rab.toLocaleString('id-ID')}`;
    const formattedRealisasi = `Rp ${data.realisasi.toLocaleString('id-ID')}`;
    const formattedVariance = `Rp ${variance.toLocaleString('id-ID')}`;

    csvContent += `"${index}"${sep}"${itemName.replace(/"/g, '""')}"${sep}"${formattedRAB}"${sep}"${formattedRealisasi}"${sep}"${formattedVariance}"${sep}"${status} (${data.notes.replace(/"/g, '""')})"\n`;
    index++;
  });

  const totalVariance = totalRAB - totalRealisasi;
  const formattedTotalRAB = `Rp ${totalRAB.toLocaleString('id-ID')}`;
  const formattedTotalRealisasi = `Rp ${totalRealisasi.toLocaleString('id-ID')}`;
  const formattedTotalVariance = `Rp ${totalVariance.toLocaleString('id-ID')}`;

  // Total Summary Row
  csvContent += `\n"TOTAL KESELURUHAN"${sep}""${sep}"${formattedTotalRAB}"${sep}"${formattedTotalRealisasi}"${sep}"${formattedTotalVariance}"${sep}"${totalVariance >= 0 ? 'SURPLUS ANGGARAN' : 'DEFISIT ANGGARAN'}"\n`;

  // Download Trigger as .csv (100% visible & compatible with Excel)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Laporan_Keuangan_RAB_${eventTitle.replace(/[^a-zA-Z0-9_]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a beautiful, highly styled Excel (.xls) document for Skenario Kerja (SK Operasional)
 * with MNSBDI brand styling (Purple/Gold headers, borders, cell padding, auto widths).
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
              <x:Name>Skenario Kerja (SK)</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; }
        .title-header { background-color: #3b0764; color: #ffffff; font-size: 16px; font-weight: bold; text-align: center; padding: 12px; }
        .sub-header { background-color: #581c87; color: #fef08a; font-size: 13px; font-weight: bold; text-align: center; padding: 8px; }
        .meta-row { font-size: 11px; color: #475569; padding: 4px; }
        th { background-color: #6b21a8; color: #ffffff; font-weight: bold; text-align: center; padding: 8px; border: 1px solid #4c1d95; }
        td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
        .row-even { background-color: #f8fafc; }
        .row-odd { background-color: #ffffff; }
        .badge-phase { background-color: #fef3c7; color: #78350f; font-weight: bold; text-align: center; }
        .badge-time { background-color: #ede9fe; color: #5b21b6; font-weight: bold; text-align: center; }
        .badge-exec { color: #1e1b4b; font-weight: bold; }
        .badge-inter { color: #0369a1; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="7" class="title-header">MATRIKS SKENARIO KERJA (SK OPERASIONAL LAPANGAN) EVENT</td>
        </tr>
        <tr>
          <td colspan="7" class="sub-header">SISTEM INFORMASI VIHARA MNSBDI</td>
        </tr>
        <tr>
          <td colspan="2" class="meta-row"><b>Nama Event:</b></td>
          <td colspan="5" class="meta-row">${eventTitle}</td>
        </tr>
        <tr>
          <td colspan="2" class="meta-row"><b>Tanggal Export:</b></td>
          <td colspan="5" class="meta-row">${exportDate}</td>
        </tr>
        <tr><td colspan="7"></td></tr>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 160px;">Hari / Tanggal / Tahap</th>
            <th style="width: 110px;">Waktu / Jam</th>
            <th style="width: 200px;">Bidang & PJ Pelaksana</th>
            <th style="width: 280px;">Detail Persiapan / Kegiatan</th>
            <th style="width: 220px;">Interbid (Bidang & PJ Tujuan)</th>
            <th style="width: 250px;">Catatan / Notes Lapangan</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (skenarioList.length === 0) {
    htmlContent += `
      <tr>
        <td colspan="7" style="text-align:center; color:#94a3b8; padding:12px;">Belum ada data Skenario Kerja.</td>
      </tr>
    `;
  } else {
    skenarioList.forEach((item, index) => {
      const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
      htmlContent += `
        <tr class="${rowClass}">
          <td style="text-align: center;">${index + 1}</td>
          <td class="badge-phase">${item.day_phase || '-'}</td>
          <td class="badge-time">${item.time_slot || '-'}</td>
          <td class="badge-exec">${item.executor_bidang_pj || '-'}</td>
          <td><b>${item.activity || '-'}</b></td>
          <td class="badge-inter">${item.interbid_bidang_pj || '-'}</td>
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
  link.setAttribute('download', `Skenario_Kerja_${eventTitle.replace(/[^a-zA-Z0-9_]/g, '_')}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
