import { EventBudget } from '@/types/database';

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
