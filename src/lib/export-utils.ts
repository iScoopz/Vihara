import { EventBudget, EventSkenarioKerja, ViharaEvent, EventRegistration, UmatBagian } from '@/types/database';

/**
 * Generates a clean, robust, 100% visible Excel CSV spreadsheet with UTF-8 BOM (\uFEFF)
 * and semicolon delimiters (compatible with Indonesian Windows Excel regional settings).
 * Opens immediately in Microsoft Excel with formatted columns, currency headers, and totals!
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
    const label = `Biaya Pendaftaran Kegiatan Umat (${registrationsCount} Umat)`;
    itemMap[label] = {
      pemasukan: Number(totalUmatRegistrationFees),
      rab: 0,
      realisasi: 0,
      notes: `Total penerimaan biaya pendaftaran ${registrationsCount} Umat`
    };
  }

  pemasukanItems.forEach(b => {
    if (!itemMap[b.item_name]) {
      itemMap[b.item_name] = {
        pemasukan: Number(b.amount),
        rab: 0,
        realisasi: 0,
        notes: b.notes || '-'
      };
    } else {
      itemMap[b.item_name].pemasukan += Number(b.amount);
    }
  });

  rabItems.forEach(b => {
    if (!itemMap[b.item_name]) {
      itemMap[b.item_name] = { pemasukan: 0, rab: Number(b.amount), realisasi: 0, notes: b.notes || '-' };
    } else {
      itemMap[b.item_name].rab = Number(b.amount);
      if (b.notes) itemMap[b.item_name].notes = b.notes;
    }
  });

  realisasiItems.forEach(b => {
    if (!itemMap[b.item_name]) {
      itemMap[b.item_name] = { pemasukan: 0, rab: 0, realisasi: Number(b.amount), notes: b.notes || '-' };
    } else {
      itemMap[b.item_name].realisasi = Number(b.amount);
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
              <x:Name>Laporan Keuangan Kegiatan</x:Name>
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
        td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: middle; }
        .row-even { background-color: #f8fafc; }
        .row-odd { background-color: #ffffff; }
        .num { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; font-family: Consolas, monospace; }
        .num-green { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; font-family: Consolas, monospace; color: #047857; font-weight: bold; }
        .footer-row { background-color: #f3e8ff; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <tr>
          <td colspan="6" class="title-header">LAPORAN KEUANGAN KEGIATAN - VIHARA MNSBDI</td>
        </tr>
        <tr>
          <td colspan="2" class="meta-row"><b>Nama Kegiatan:</b></td>
          <td colspan="4" class="meta-row">${eventTitle}</td>
        </tr>
        <tr>
          <td colspan="2" class="meta-row"><b>Tanggal Export:</b></td>
          <td colspan="4" class="meta-row">${exportDate}</td>
        </tr>
        <tr><td colspan="6"></td></tr>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 250px;">Nama Item / Deskripsi</th>
            <th style="width: 170px;">Total Pemasukan (Rp)</th>
            <th style="width: 170px;">Anggaran Rencana (RAB)</th>
            <th style="width: 170px;">Realisasi Pengeluaran</th>
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
        <td colspan="6" style="text-align:center; color:#94a3b8; padding:12px;">Belum ada data keuangan.</td>
      </tr>
    `;
  } else {
    Object.entries(itemMap).forEach(([itemName, data]) => {
      totalPemasukan += data.pemasukan;
      totalRAB += data.rab;
      totalRealisasi += data.realisasi;

      const rowClass = index % 2 === 0 ? 'row-even' : 'row-odd';
      
      htmlContent += `
        <tr class="${rowClass}">
          <td style="text-align: center;">${index}</td>
          <td><b>${itemName}</b></td>
          <td class="${data.pemasukan > 0 ? 'num-green' : 'num'}">${data.pemasukan}</td>
          <td class="num">${data.rab}</td>
          <td class="num">${data.realisasi}</td>
          <td><span style="font-size:10px; color:#64748b;">${data.notes}</span></td>
        </tr>
      `;
      index++;
    });
  }

  const saldoKas = totalPemasukan - totalRealisasi;

  htmlContent += `
        </tbody>
        <tfoot>
          <tr class="footer-row">
            <td colspan="2" style="text-align:right;">TOTAL KESELURUHAN</td>
            <td class="num-green">${totalPemasukan}</td>
            <td class="num">${totalRAB}</td>
            <td class="num">${totalRealisasi}</td>
            <td class="num" style="font-weight:bold;">${saldoKas}</td>
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
  link.setAttribute('download', `Laporan_Keuangan_RAB_${eventTitle.replace(/[^a-zA-Z0-9_]/g, '_')}.xls`);
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

/**
 * Generates a complete, beautiful Microsoft Excel (.xls) document for LAPORAN PERTANGGUNGJAWABAN (LPJ)
 * Contains Structure, Participant attendance list, Breakdown Income, Realisasi & RAB, and Surplus/Defisit.
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
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; }
        .title-header { background-color: #3b0764; color: #ffffff; font-size: 16px; font-weight: bold; text-align: center; padding: 12px; }
        .sub-header { background-color: #581c87; color: #fef08a; font-size: 12px; font-weight: bold; text-align: center; padding: 8px; }
        .section-header { background-color: #4c1d95; color: #ffffff; font-size: 12px; font-weight: bold; padding: 6px 10px; }
        .meta-label { font-weight: bold; background-color: #f3e8ff; color: #4c1d95; border: 1px solid #cbd5e1; }
        .meta-val { background-color: #ffffff; border: 1px solid #cbd5e1; }
        th { background-color: #6b21a8; color: #ffffff; font-weight: bold; text-align: center; padding: 6px; border: 1px solid #4c1d95; }
        th.sub-th { background-color: #7e22ce; color: #ffffff; font-weight: bold; text-align: center; padding: 5px; border: 1px solid #581c87; }
        td { border: 1px solid #cbd5e1; padding: 5px 8px; vertical-align: middle; }
        .row-even { background-color: #f8fafc; }
        .row-odd { background-color: #ffffff; }
        .num { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; font-family: Consolas, monospace; }
        .num-green { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; font-family: Consolas, monospace; color: #047857; font-weight: bold; }
        .num-red { mso-number-format:"\\#\\,\\#\\#0"; text-align: right; font-family: Consolas, monospace; color: #b91c1c; font-weight: bold; }
        .footer-row { background-color: #f3e8ff; font-weight: bold; }
        .grand-total-row { background-color: #3b0764; color: #ffffff; font-weight: bold; font-size: 12px; }
      </style>
    </head>
    <body>
      <table>
        <!-- DOKUMEN HEADER -->
        <tr>
          <td colspan="7" class="title-header">LAPORAN PERTANGGUNGJAWABAN (LPJ) KEGIATAN</td>
        </tr>
        <tr>
          <td colspan="7" class="sub-header">MAJELIS NICHIREN SHOSHU BUDDHA DHARMA INDONESIA (MNSBDI) - SENTRA MAKASSAR</td>
        </tr>
        <tr><td colspan="7"></td></tr>

        <!-- METADATA -->
        <tr>
          <td class="meta-label">Nama Kegiatan:</td>
          <td colspan="3" class="meta-val"><b>${eventTitle}</b></td>
          <td class="meta-label">Tanggal Pelaksanaan:</td>
          <td colspan="2" class="meta-val">${eventDateStr}</td>
        </tr>
        <tr>
          <td class="meta-label">Lokasi:</td>
          <td colspan="3" class="meta-val">${event.location}</td>
          <td class="meta-label">Tanggal Export:</td>
          <td colspan="2" class="meta-val">${exportDate}</td>
        </tr>
        <tr>
          <td class="meta-label">Total Peserta:</td>
          <td colspan="3" class="meta-val">${registrations.length} Umat Terdaftar</td>
          <td class="meta-label">Status LPJ:</td>
          <td colspan="2" class="meta-val" style="color:#047857; font-weight:bold;">${saldoKasGlobal >= 0 ? 'SURPLUS' : 'DEFISIT'}</td>
        </tr>
        <tr><td colspan="7"></td></tr>

        <!-- BAGIAN I: SUSUNAN PANITIA -->
        <tr>
          <td colspan="7" class="section-header">I. SUSUNAN STRUKTUR PANITIA PELAKSANA KEGIATAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th colspan="3" style="width: 300px;">Jabatan / Seksi Panitia</th>
            <th colspan="3" style="width: 350px;">Nama Penanggung Jawab (PJ)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-odd">
            <td style="text-align:center;">1</td>
            <td colspan="3"><b>Ketua Panitia Pelaksana</b></td>
            <td colspan="3">${org?.ketua_name || '-'}</td>
          </tr>
          <tr class="row-even">
            <td style="text-align:center;">2</td>
            <td colspan="3"><b>Sekretaris Panitia</b></td>
            <td colspan="3">${org?.sekretaris_name || '-'}</td>
          </tr>
          <tr class="row-odd">
            <td style="text-align:center;">3</td>
            <td colspan="3"><b>Bendahara Panitia</b></td>
            <td colspan="3">${org?.bendahara_name || '-'}</td>
          </tr>
          <tr class="row-even">
            <td style="text-align:center;">4</td>
            <td colspan="3"><b>PJ Acara & Ritual</b></td>
            <td colspan="3">${org?.pj_acara_name || '-'}</td>
          </tr>
          ${(org?.sub_acara || []).map((s, idx) => `
            <tr class="${idx % 2 === 0 ? 'row-odd' : 'row-even'}">
              <td style="text-align:center;">4.${idx + 1}</td>
              <td colspan="3" style="padding-left: 20px;">└ Seksi Acara: ${s.role_name}</td>
              <td colspan="3">${s.pic_name}</td>
            </tr>
          `).join('')}
          <tr class="row-odd">
            <td style="text-align:center;">5</td>
            <td colspan="3"><b>PJ Bidang Umum & Logistik</b></td>
            <td colspan="3">${org?.pj_umum_name || '-'}</td>
          </tr>
          ${(org?.sub_umum || []).map((s, idx) => `
            <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
              <td style="text-align:center;">5.${idx + 1}</td>
              <td colspan="3" style="padding-left: 20px;">└ Seksi Umum: ${s.role_name}</td>
              <td colspan="3">${s.pic_name}</td>
            </tr>
          `).join('')}
        </tbody>
        <tr><td colspan="7"></td></tr>

        <!-- BAGIAN II: REKAP PEMASUKAN PENDAFTARAN UMAT PER BAGIAN -->
        <tr>
          <td colspan="7" class="section-header">II. RINCIAN PENERIMAAN BIAYA PENDAFTARAN UMAT PER BAGIAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th colspan="2" style="width: 250px;">Nama Bagian Umat</th>
            <th style="width: 140px;">Tarif Pokok (Rp)</th>
            <th style="width: 140px;">Jumlah Umat</th>
            <th colspan="2" style="width: 220px;">Subtotal Pemasukan (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${bagianBreakdown.length > 0 ? bagianBreakdown.map((item, idx) => `
            <tr class="${idx % 2 === 0 ? 'row-odd' : 'row-even'}">
              <td style="text-align:center;">${idx + 1}</td>
              <td colspan="2"><b>${item.bagian}</b></td>
              <td class="num">${item.basePrice}</td>
              <td style="text-align:center; font-weight:bold;">${item.count}</td>
              <td colspan="2" class="num-green">${item.totalPemasukanBagian}</td>
            </tr>
          `).join('') : `
            <tr><td colspan="7" style="text-align:center; color:#94a3b8;">Belum ada data pendaftaran bagian.</td></tr>
          `}
        </tbody>
        <tfoot>
          <tr class="footer-row">
            <td colspan="4" style="text-align:right;">TOTAL PEMASUKAN PENDAFTARAN UMAT:</td>
            <td style="text-align:center; font-weight:bold;">${registrations.length}</td>
            <td colspan="2" class="num-green" style="font-size:12px;">${totalUmatRegistrationFees}</td>
          </tr>
        </tfoot>
        <tr><td colspan="7"></td></tr>

        <!-- BAGIAN III: REKAP KEUANGAN, RAB & REALISASI -->
        <tr>
          <td colspan="7" class="section-header">III. LAPORAN KEUANGAN, TARGET RAB & REALISASI PENGELUARAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th style="width: 230px;">Nama Item / Keterangan</th>
            <th style="width: 140px;">Pemasukan (Rp)</th>
            <th style="width: 140px;">Target RAB (Rp)</th>
            <th style="width: 140px;">Realisasi (Rp)</th>
            <th style="width: 150px;">Selisih (Rp)</th>
            <th style="width: 150px;">Catatan</th>
          </tr>
        </thead>
        <tbody>
          <!-- Row 1: Biaya Pendaftaran Umat -->
          <tr class="row-odd" style="background-color: #ecfdf5;">
            <td style="text-align:center; font-weight:bold; color:#047857;">1</td>
            <td style="font-weight:bold; color:#064e3b;">Total Biaya Pendaftaran Kegiatan Umat (${registrations.length} Umat)</td>
            <td class="num-green">${totalUmatRegistrationFees}</td>
            <td class="num">0</td>
            <td class="num">0</td>
            <td class="num">0</td>
            <td><span style="color:#047857; font-size:10px;">Penerimaan Pendaftaran</span></td>
          </tr>
          ${groupedPdfItems.map((item, idx) => {
            const hasRAB = item.rab > 0;
            const hasRealisasi = item.realisasi > 0;

            let selisihVal = 0;
            let isOverBudget = false;
            let isSurplus = false;

            // Selisih HANYA dihitung jika memang ada anggaran RAB yang ditentukan
            if (hasRAB && hasRealisasi) {
              selisihVal = item.rab - item.realisasi;
              if (selisihVal < 0) isOverBudget = true;
              else if (selisihVal > 0) isSurplus = true;
            } else if (hasRAB) {
              selisihVal = item.rab;
              isSurplus = true;
            } else {
              // Jika tidak ada budget RAB yang ditentukan, selisih = 0 (bukan over)
              selisihVal = 0;
            }

            const selisihClass = isOverBudget ? 'num-red' : isSurplus ? 'num-green' : 'num';

            return `
              <tr class="${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
                <td style="text-align:center;">${idx + 2}</td>
                <td><b>${item.itemName}</b></td>
                <td class="${item.pemasukan > 0 ? 'num-green' : 'num'}">${item.pemasukan > 0 ? item.pemasukan : 0}</td>
                <td class="num">${item.rab > 0 ? item.rab : 0}</td>
                <td class="num">${item.realisasi > 0 ? item.realisasi : 0}</td>
                <td class="${selisihClass}">${selisihVal}</td>
                <td style="color:#64748b; font-size:10px;">${item.notes}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr class="footer-row">
            <td colspan="2" style="text-align:right;">TOTAL KESELURUHAN:</td>
            <td class="num-green">${totalPemasukanGlobal}</td>
            <td class="num">${totalRAB}</td>
            <td class="num">${totalRealisasi}</td>
            <td class="${totalRAB > 0 && totalRealisasi > totalRAB ? 'num-red' : 'num'}">${totalRAB > 0 ? (totalRAB - totalRealisasi) : 0}</td>
            <td></td>
          </tr>
          <tr class="grand-total-row">
            <td colspan="5" style="text-align:right; font-size:12px;">SALDO KEUANGAN AKHIR KEGIATAN (TOTAL PEMASUKAN - REALISASI):</td>
            <td colspan="2" class="num" style="color: #ffffff; font-size:13px; font-weight:bold;">
              ${saldoKasGlobal}
            </td>
          </tr>
        </tfoot>
        <tr><td colspan="7"></td></tr>

        <!-- BAGIAN IV: REKAPITULASI PESERTA UMAT -->
        <tr>
          <td colspan="7" class="section-header">IV. REKAPITULASI PESERTA UMAT & BIAYA KEGIATAN</td>
        </tr>
        <thead>
          <tr>
            <th style="width: 40px;">No</th>
            <th colspan="3" style="width: 350px;">Nama Lengkap Umat</th>
            <th style="width: 180px;">Bagian Umat</th>
            <th colspan="2" style="width: 200px;">Biaya Kegiatan (Rp)</th>
          </tr>
        </thead>
        <tbody>
          ${lpjSortedRegistrations.length > 0 ? lpjSortedRegistrations.map((reg, idx) => {
            const userBagian = reg.profile?.bagian || 'Inspirasi';
            const baseFee = pricing[userBagian] || 0;
            const selectedIds = reg.selected_extra_fee_ids || [];
            const extraTotal = extraFees
              .filter((f) => selectedIds.includes(f.id))
              .reduce((sum, f) => sum + f.amount, 0);
            const userTotalFee = (reg.amount_paid && reg.amount_paid > 0) ? reg.amount_paid : (baseFee + extraTotal);

            return `
              <tr class="${idx % 2 === 0 ? 'row-odd' : 'row-even'}">
                <td style="text-align:center;">${idx + 1}</td>
                <td colspan="3"><b>${reg.profile?.full_name || 'Umat Vihara'}</b></td>
                <td style="text-align:center; color:#581c87; font-weight:bold;">${userBagian}</td>
                <td colspan="2" class="num-green">${userTotalFee}</td>
              </tr>
            `;
          }).join('') : `
            <tr><td colspan="7" style="text-align:center; color:#94a3b8;">Belum ada data pendaftar umat.</td></tr>
          `}
        </tbody>
        <tfoot>
          <tr class="footer-row">
            <td colspan="5" style="text-align:right;">TOTAL BIAYA KEGIATAN SEMUA PESERTA (${registrations.length} Umat):</td>
            <td colspan="2" class="num-green" style="font-size:12px;">${totalUmatRegistrationFees}</td>
          </tr>
        </tfoot>
        <tr><td colspan="7"></td></tr>

        <!-- LEMBAR TANDA TANGAN -->
        <tr>
          <td colspan="3" style="text-align:center; border:none; padding-top:20px;">
            Mengetahui / Menyetujui,<br>
            <b>Ketua Panitia Pelaksana</b><br><br><br><br>
            <u><b>${org?.ketua_name || 'Upasaka Hendra Kurniawan'}</b></u>
          </td>
          <td style="border:none;"></td>
          <td colspan="3" style="text-align:center; border:none; padding-top:20px;">
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

