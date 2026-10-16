import React, { useState } from 'react';
import { Plus, FileSpreadsheet, Trash2, Edit2 } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';
import { exportRABToExcel } from '@/lib/export-utils';
import { Badge, Button, Fab, IconButton, Panel, RowActions } from '@/components/ui/kit';
import ConfirmModal from '@/components/ui/confirm-modal';

const rupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

const th = 'sticky top-0 z-10 bg-surface-2 border-b border-line py-2.5 px-4 font-medium first:rounded-tl-xl last:rounded-tr-xl';

export interface GroupedBudgetItem {
  key: string;
  itemName: string;
  pemasukan: number;
  rab: number;
  realisasi: number;
  notes: string;
  pemasukanId?: string;
  rabId?: string;
  realisasiId?: string;
}

interface EventRABTabProps {
  event: ViharaEvent;
  registrations?: EventRegistration[];
  onOpenBudgetModal: (initialName?: string, initialType?: 'rab' | 'realisasi' | 'pemasukan') => void;
  onOpenEditBudgetModal?: (item: GroupedBudgetItem) => void;
  onDeleteBudgetItems?: (ids: string[]) => void;
}

export const EventRABTab: React.FC<EventRABTabProps> = ({ 
  event, 
  registrations = [], 
  onOpenBudgetModal,
  onOpenEditBudgetModal,
  onDeleteBudgetItems 
}) => {
  const [pendingDelete, setPendingDelete] = useState<{ name: string; ids: string[] } | null>(null);
  const pemasukanItems = event.budgets?.filter(b => b.budget_type === 'pemasukan') || [];
  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];

  // Expected fee per registrant = base price for their bagian + selected extra fees.
  const pricing = event.pricing_per_bagian || {};
  const extraFees = event.extra_fees || [];
  let totalUmatRegistrationFees = 0;
  let totalUmatPaidFees = 0;

  registrations.forEach((reg) => {
    const bagian = reg.profile?.bagian || 'Inspirasi';
    const baseFee = pricing[bagian] || 0;
    const selectedFeeIds = reg.selected_extra_fee_ids || [];
    const extraTotal = extraFees
      .filter((f) => selectedFeeIds.includes(f.id))
      .reduce((sum, f) => sum + f.amount, 0);

    const expectedFee = baseFee + extraTotal;
    totalUmatRegistrationFees += expectedFee;

    if (reg.is_paid) {
      totalUmatPaidFees += reg.amount_paid !== undefined ? reg.amount_paid : expectedFee;
    }
  });

  const totalPemasukanManual = pemasukanItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPemasukanGlobal = totalPemasukanManual + totalUmatRegistrationFees;
  const totalRAB = rabItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + curr.amount, 0);
  const saldoKasGlobal = totalPemasukanGlobal - totalRealisasi;

  // One row per item name so RAB and realisasi of the same item sit side by side.
  const groupedMap: Record<string, GroupedBudgetItem> = {};

  (event.budgets || []).forEach((b) => {
    const cleanName = b.item_name.trim();
    const key = cleanName.toLowerCase();
    if (!groupedMap[key]) {
      groupedMap[key] = {
        key,
        itemName: cleanName,
        pemasukan: b.budget_type === 'pemasukan' ? b.amount : 0,
        rab: b.budget_type === 'rab' ? b.amount : 0,
        realisasi: b.budget_type === 'realisasi' ? b.amount : 0,
        notes: b.notes || '',
        pemasukanId: b.budget_type === 'pemasukan' ? b.id : undefined,
        rabId: b.budget_type === 'rab' ? b.id : undefined,
        realisasiId: b.budget_type === 'realisasi' ? b.id : undefined,
      };
    } else {
      if (b.budget_type === 'pemasukan') {
        groupedMap[key].pemasukan += b.amount;
        groupedMap[key].pemasukanId = b.id;
      } else if (b.budget_type === 'rab') {
        groupedMap[key].rab += b.amount;
        groupedMap[key].rabId = b.id;
      } else if (b.budget_type === 'realisasi') {
        groupedMap[key].realisasi += b.amount;
        groupedMap[key].realisasiId = b.id;
      }
    }
  });

  const groupedItems = Object.values(groupedMap);

  const statusBadge = (item: GroupedBudgetItem) => {
    const diff = item.realisasi - item.rab;
    const hasRab = item.rab > 0;
    const hasRealisasi = item.realisasi > 0;
    if (item.pemasukan > 0) return <Badge tone="ok">Pemasukan</Badge>;
    if (hasRab && hasRealisasi) {
      if (diff === 0) return <Badge tone="ok">Sesuai anggaran</Badge>;
      if (diff > 0) return <Badge tone="danger">Lebih {rupiah(diff)}</Badge>;
      return <Badge tone="ok">Hemat {rupiah(Math.abs(diff))}</Badge>;
    }
    if (hasRab && !hasRealisasi) return <Badge tone="gold">Belum terpakai</Badge>;
    return <Badge>Pengeluaran tambahan</Badge>;
  };

  return (
    <div className="space-y-4 pb-16 md:pb-0 print:hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Anggaran dan pengeluaran</h2>
          <p className="text-sm text-ink-2">Penerimaan pendaftaran, rencana anggaran (RAB), dan pengeluaran kegiatan.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => exportRABToExcel(event.title, event.budgets || [], totalUmatRegistrationFees, registrations.length)}>
            <FileSpreadsheet size={14} aria-hidden />
            Unduh Excel
          </Button>
          <Button variant="primary" onClick={() => onOpenBudgetModal()} className="max-md:hidden">
            <Plus size={14} aria-hidden />
            Tambah item anggaran
          </Button>
        </div>
      </div>

      <Panel className="p-5 space-y-4">
        <div>
          <p className="text-sm text-ink-2">Sisa kas kegiatan</p>
          <p className={`font-display text-4xl font-semibold leading-none tabular-nums ${saldoKasGlobal >= 0 ? 'text-brand' : 'text-danger'}`}>
            {rupiah(saldoKasGlobal)}
          </p>
          <p className="text-xs text-ink-3">{saldoKasGlobal >= 0 ? 'Surplus' : 'Defisit'}</p>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-line pt-4">
          <div>
            <dt className="text-xs text-ink-3">Total pemasukan</dt>
            <dd className="text-sm font-semibold tabular-nums text-ink">{rupiah(totalPemasukanGlobal)}</dd>
            <dd className="text-xs text-ink-3">
              {registrations.length} peserta {rupiah(totalUmatRegistrationFees)}, lainnya {rupiah(totalPemasukanManual)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Anggaran (RAB)</dt>
            <dd className="text-sm font-semibold tabular-nums text-ink">{rupiah(totalRAB)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-3">Pengeluaran aktual</dt>
            <dd className="text-sm font-semibold tabular-nums text-ink">{rupiah(totalRealisasi)}</dd>
          </div>
        </dl>
      </Panel>

      <Panel>
        <ul className="xl:hidden divide-y divide-line">
          <li className="p-3.5 rounded-t-xl bg-surface-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-ink">Pendaftaran peserta ({registrations.length} orang)</p>
              <Badge tone="ok">Pemasukan</Badge>
            </div>
            <p className="mt-1 text-xs text-ink-2">
              <span className="font-medium tabular-nums text-ink">{rupiah(totalUmatRegistrationFees)}</span>
              <span className="text-ink-3"> · dihitung otomatis</span>
            </p>
          </li>

          {groupedItems.map((item) => {
            const hasRab = item.rab > 0;
            const hasRealisasi = item.realisasi > 0;
            const hasPemasukan = item.pemasukan > 0;
            const allItemIds = [item.rabId, item.realisasiId, item.pemasukanId].filter(Boolean) as string[];
            const diff = item.realisasi - item.rab;
            const canRecord = hasRab && !hasRealisasi;

            return (
              <li key={item.key} className="p-3.5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-ink break-words">{item.itemName}</p>
                    {statusBadge(item)}
                  </div>
                  {onDeleteBudgetItems && (
                    <div className="-mt-1.5 -mr-1.5">
                      <RowActions
                        title={item.itemName}
                        actions={[
                          {
                            label: 'Hapus item',
                            tone: 'danger',
                            icon: <Trash2 size={16} />,
                            onSelect: () => setPendingDelete({ name: item.itemName, ids: allItemIds })
                          }
                        ]}
                      />
                    </div>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <dt className="text-ink-3">Anggaran (RAB)</dt>
                    <dd className="tabular-nums text-ink">{hasRab ? rupiah(item.rab) : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Pengeluaran</dt>
                    <dd className="tabular-nums text-ink">{hasRealisasi ? rupiah(item.realisasi) : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Pemasukan</dt>
                    <dd className="tabular-nums text-ink">{hasPemasukan ? rupiah(item.pemasukan) : '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Selisih</dt>
                    <dd className={`tabular-nums ${hasRab && hasRealisasi && diff > 0 ? 'text-danger' : 'text-ink'}`}>
                      {hasRab && hasRealisasi ? (diff > 0 ? `+${rupiah(diff)}` : diff < 0 ? `-${rupiah(Math.abs(diff))}` : rupiah(0)) : '-'}
                    </dd>
                  </div>
                </dl>

                {(onOpenEditBudgetModal || canRecord) && (
                  <div className={`grid gap-2 ${onOpenEditBudgetModal && canRecord ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {canRecord && (
                      <Button onClick={() => onOpenBudgetModal(item.itemName, 'realisasi')}>Catat pengeluaran</Button>
                    )}
                    {onOpenEditBudgetModal && (
                      <Button onClick={() => onOpenEditBudgetModal(item)}>
                        <Edit2 size={14} aria-hidden />
                        Ubah
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* The table needs about 900px, which md and lg do not leave beside the sidebar. */}
        <div className="hidden xl:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-ink-3">
                <th scope="col" className={`${th} w-12`}>No</th>
                <th scope="col" className={th}>Uraian</th>
                <th scope="col" className={`${th} text-right`}>Pemasukan</th>
                <th scope="col" className={`${th} text-right`}>Anggaran (RAB)</th>
                <th scope="col" className={`${th} text-right`}>Pengeluaran</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr className="bg-surface-2">
                <td className="py-2.5 px-4 tabular-nums text-ink-3">1</td>
                <td className="py-2.5 px-4 font-medium text-ink">Pendaftaran peserta ({registrations.length} orang)</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-ink whitespace-nowrap">{rupiah(totalUmatRegistrationFees)}</td>
                <td className="py-2.5 px-4 text-right text-ink-3">-</td>
                <td className="py-2.5 px-4 text-right text-ink-3">-</td>
                <td className="py-2.5 px-4"><Badge tone="ok">Pemasukan</Badge></td>
                <td className="py-2.5 px-4 text-right text-xs text-ink-3">Otomatis</td>
              </tr>

              {groupedItems.map((item, i) => {
                const hasRab = item.rab > 0;
                const hasRealisasi = item.realisasi > 0;
                const hasPemasukan = item.pemasukan > 0;
                const allItemIds = [item.rabId, item.realisasiId, item.pemasukanId].filter(Boolean) as string[];

                return (
                  <tr key={item.key} className="hover:bg-surface-2">
                    <td className="py-2 px-4 tabular-nums text-ink-3">{i + 2}</td>
                    <td className="py-2 px-4 font-medium text-ink">{item.itemName}</td>
                    <td className="py-2 px-4 text-right tabular-nums text-ink whitespace-nowrap">{hasPemasukan ? rupiah(item.pemasukan) : '-'}</td>
                    <td className="py-2 px-4 text-right tabular-nums text-ink whitespace-nowrap">{hasRab ? rupiah(item.rab) : '-'}</td>
                    <td className="py-2 px-4 text-right tabular-nums text-ink whitespace-nowrap">{hasRealisasi ? rupiah(item.realisasi) : '-'}</td>
                    <td className="py-2 px-4">{statusBadge(item)}</td>
                    <td className="py-1 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {hasRab && !hasRealisasi && (
                          <Button size="sm" onClick={() => onOpenBudgetModal(item.itemName, 'realisasi')}>
                            Catat pengeluaran
                          </Button>
                        )}
                        {onOpenEditBudgetModal && (
                          <IconButton label={`Ubah ${item.itemName}`} onClick={() => onOpenEditBudgetModal(item)}>
                            <Edit2 size={15} aria-hidden />
                          </IconButton>
                        )}
                        {onDeleteBudgetItems && (
                          <IconButton
                            label={`Hapus ${item.itemName}`}
                            tone="danger"
                            onClick={() => setPendingDelete({ name: item.itemName, ids: allItemIds })}
                          >
                            <Trash2 size={15} aria-hidden />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {groupedItems.length === 0 && (
          <p className="px-4 py-3 border-t border-line text-sm text-ink-3">Belum ada item anggaran selain pendaftaran.</p>
        )}
      </Panel>

      {onDeleteBudgetItems && (
        <ConfirmModal
          isOpen={pendingDelete !== null}
          title="Hapus item anggaran?"
          message={pendingDelete ? `${pendingDelete.name} beserta angka RAB, pengeluaran, dan pemasukannya akan dihapus.` : ''}
          onConfirm={() => {
            if (pendingDelete) onDeleteBudgetItems(pendingDelete.ids);
          }}
          onClose={() => setPendingDelete(null)}
        />
      )}

      <Fab label="Tambah item" icon={<Plus size={18} />} onClick={() => onOpenBudgetModal()} />
    </div>
  );
};
