import React, { useState } from 'react';
import { Plus, Check, Search, Copy, Receipt } from 'lucide-react';
import { ViharaEvent, EventRegistration } from '@/types/database';
import { Badge, Button, Panel, StateMessage, inputClass, selectClass } from '@/components/ui/kit';

interface EventPresensiTabProps {
  event: ViharaEvent;
  registrations: EventRegistration[];
  onOpenRegModal: () => void;
  onToggleAttendance: (regId: string) => void;
  onTogglePayment: (regId: string, amount?: number) => void;
  onToggleExtraFeeForReg?: (regId: string, feeId: string, newSelectedIds: string[], newTotalAmount: number) => void;
  onOpenPricingModal?: () => void;
  onCancelRegistration?: (regId: string) => void;
}

const rupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export const EventPresensiTab: React.FC<EventPresensiTabProps> = ({
  event,
  registrations,
  onOpenRegModal,
  onToggleAttendance,
  onTogglePayment,
  onToggleExtraFeeForReg,
  onOpenPricingModal,
  onCancelRegistration
}) => {
  const isComplex = event.is_complex ?? true;
  const pricing = event.pricing_per_bagian || {};
  const extraFees = event.extra_fees || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attended' | 'absent'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [copiedWa, setCopiedWa] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Registration order: No. 1 is the earliest sign-up.
  const sortedRegistrations = [...registrations].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeA - timeB;
  });

  const handleCopyWaList = () => {
    const dateStr = new Date(event.event_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let waText = `*Daftar peserta ${event.title}*\n`;
    waText += `Tanggal: ${dateStr}\n`;
    waText += `Lokasi: ${event.location}\n`;
    waText += `Total: ${registrations.length} umat\n\n`;

    sortedRegistrations.forEach((r, idx) => {
      waText += `${idx + 1}. ${r.profile?.full_name || '-'}\n`;
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(waText.trim());
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 3000);
    }
  };

  let totalTargetAmount = 0;
  let totalPaidAmount = 0;
  let countLunas = 0;
  let countHadir = 0;

  registrations.forEach((reg) => {
    if (reg.is_attended) countHadir += 1;

    if (isComplex) {
      const bagian = reg.profile?.bagian || 'Inspirasi';
      const baseFee = pricing[bagian] || 0;
      const selectedFeeIds = reg.selected_extra_fee_ids || [];
      const umatExtraTotal = extraFees
        .filter((f) => selectedFeeIds.includes(f.id))
        .reduce((sum, f) => sum + f.amount, 0);

      const totalFee = baseFee + umatExtraTotal;
      totalTargetAmount += totalFee;

      if (reg.is_paid) {
        countLunas += 1;
        totalPaidAmount += reg.amount_paid !== undefined ? reg.amount_paid : totalFee;
      }
    }
  });

  const totalRemainingAmount = Math.max(0, totalTargetAmount - totalPaidAmount);
  const countBelumLunas = registrations.length - countLunas;

  const filteredRegistrations = sortedRegistrations.filter((reg) => {
    const name = reg.profile?.full_name || '';
    const han = reg.profile?.han || '';
    const cetya = reg.profile?.cetya || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      han.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cetya.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAttendance =
      attendanceFilter === 'all' ||
      (attendanceFilter === 'attended' && reg.is_attended) ||
      (attendanceFilter === 'absent' && !reg.is_attended);

    const matchesPayment =
      !isComplex ||
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && reg.is_paid) ||
      (paymentFilter === 'unpaid' && !reg.is_paid);

    return matchesSearch && matchesAttendance && matchesPayment;
  });

  const hasFilter = searchTerm !== '' || attendanceFilter !== 'all' || paymentFilter !== 'all';

  return (
    <div className="space-y-4 print:hidden">
      {isComplex ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="text-sm text-ink-2">
            <span className="font-display text-4xl font-semibold leading-none tabular-nums text-brand">{rupiah(totalPaidAmount)}</span>{' '}
            terkumpul dari <span className="tabular-nums text-ink">{rupiah(totalTargetAmount)}</span>
          </p>
          <p className="text-sm text-ink-2">
            Belum lunas <span className="tabular-nums text-ink">{rupiah(totalRemainingAmount)}</span> ({countBelumLunas} umat)
            <span className="text-ink-3"> · </span>
            Hadir <span className="tabular-nums text-ink">{countHadir}</span> dari {registrations.length}
          </p>
        </div>
      ) : (
        <p className="text-sm text-ink-2">
          <span className="font-display text-4xl font-semibold leading-none tabular-nums text-brand">{countHadir}</span> dari{' '}
          <span className="tabular-nums text-ink">{registrations.length}</span> peserta sudah hadir
          {registrations.length > 0 && (
            <span className="text-ink-3"> ({Math.round((countHadir / registrations.length) * 100)}%)</span>
          )}
        </p>
      )}

      {isComplex && extraFees.length > 0 && (
        <p className="text-sm text-ink-2">
          Biaya tambahan pilihan:{' '}
          {extraFees.map((fee, i) => (
            <span key={fee.id}>
              {i > 0 && ', '}
              {fee.fee_name} <span className="tabular-nums text-ink">+{rupiah(fee.amount)}</span>
            </span>
          ))}
        </p>
      )}

      <Panel>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-line">
          <h2 className="text-base font-semibold text-ink">{isComplex ? 'Peserta dan kehadiran' : 'Daftar kehadiran'}</h2>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleCopyWaList} disabled={registrations.length === 0}>
              {copiedWa ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
              {copiedWa ? 'Tersalin' : 'Salin daftar untuk WA'}
            </Button>

            {isComplex && onOpenPricingModal && (
              <Button onClick={onOpenPricingModal}>
                <Receipt size={14} aria-hidden />
                Atur biaya
              </Button>
            )}

            <Button variant="primary" onClick={onOpenRegModal}>
              <Plus size={14} aria-hidden />
              Tambah peserta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 p-4">
          <label className="relative">
            <span className="sr-only">Cari peserta</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
            <input
              type="search"
              placeholder="Cari nama, HAN, atau Cetya"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-9`}
            />
          </label>

          <select
            aria-label="Filter kehadiran"
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value as 'all' | 'attended' | 'absent')}
            className={selectClass}
          >
            <option value="all">Semua kehadiran</option>
            <option value="attended">Sudah hadir</option>
            <option value="absent">Belum hadir</option>
          </select>

          {isComplex && (
            <select
              aria-label="Filter pembayaran"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
              className={selectClass}
            >
              <option value="all">Semua pembayaran</option>
              <option value="paid">Lunas</option>
              <option value="unpaid">Belum lunas</option>
            </select>
          )}
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="border-t border-line">
            <StateMessage
              kind="empty"
              title={hasFilter ? 'Tidak ada peserta yang cocok dengan filter ini.' : 'Belum ada umat yang mendaftar.'}
              action={
                hasFilter ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setAttendanceFilter('all');
                      setPaymentFilter('all');
                    }}
                  >
                    Reset filter
                  </Button>
                ) : (
                  <Button size="sm" variant="primary" onClick={onOpenRegModal}>
                    Tambah peserta
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="relative overflow-x-auto border-t border-line">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-xs text-ink-3">
                  <th scope="col" className="py-2.5 px-4 font-medium w-12">No</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Nama</th>
                  <th scope="col" className="py-2.5 px-4 font-medium">Bagian dan HAN</th>
                  {isComplex && <th scope="col" className="py-2.5 px-4 font-medium">Biaya tambahan</th>}
                  {isComplex && <th scope="col" className="py-2.5 px-4 font-medium text-right">Total biaya</th>}
                  {isComplex && <th scope="col" className="py-2.5 px-4 font-medium">Pembayaran</th>}
                  <th scope="col" className="py-2.5 px-4 font-medium">Kehadiran</th>
                  <th scope="col" className="py-2.5 px-4"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRegistrations.map((reg, index) => {
                  const bagian = reg.profile?.bagian || 'Inspirasi';
                  const baseFee = pricing[bagian] || 0;
                  const selectedFeeIds = reg.selected_extra_fee_ids || [];
                  const umatExtraTotal = extraFees
                    .filter((f) => selectedFeeIds.includes(f.id))
                    .reduce((sum, f) => sum + f.amount, 0);

                  const totalFee = baseFee + umatExtraTotal;
                  const isPaid = Boolean(reg.is_paid);
                  const name = reg.profile?.full_name || '-';

                  const handleFeeToggle = (feeId: string) => {
                    if (!onToggleExtraFeeForReg) return;
                    const newSelected = selectedFeeIds.includes(feeId)
                      ? selectedFeeIds.filter((id) => id !== feeId)
                      : [...selectedFeeIds, feeId];

                    const newExtraTotal = extraFees
                      .filter((f) => newSelected.includes(f.id))
                      .reduce((sum, f) => sum + f.amount, 0);

                    onToggleExtraFeeForReg(reg.id, feeId, newSelected, baseFee + newExtraTotal);
                  };

                  return (
                    <tr key={reg.id} className="hover:bg-surface-2 align-top">
                      <td className="py-2.5 px-4 tabular-nums text-ink-3">{index + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-ink whitespace-nowrap">{name}</td>
                      <td className="py-2.5 px-4 text-ink-2 whitespace-nowrap">
                        {bagian}
                        <span className="text-ink-3"> · </span>
                        {reg.profile?.han || '-'}
                      </td>

                      {isComplex && (
                        <td className="py-2 px-4">
                          {extraFees.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {extraFees.map((fee) => {
                                const isChecked = selectedFeeIds.includes(fee.id);
                                return (
                                  <button
                                    type="button"
                                    key={fee.id}
                                    onClick={() => handleFeeToggle(fee.id)}
                                    aria-pressed={isChecked}
                                    className={`inline-flex items-center gap-1 min-h-[32px] px-2 rounded-md border text-xs whitespace-nowrap cursor-pointer ${
                                      isChecked
                                        ? 'bg-brand-soft text-brand-ink border-brand'
                                        : 'bg-surface text-ink-2 border-line-strong hover:bg-surface-2'
                                    }`}
                                  >
                                    {isChecked && <Check size={12} aria-hidden />}
                                    {fee.fee_name} +{rupiah(fee.amount)}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-ink-3">-</span>
                          )}
                        </td>
                      )}

                      {isComplex && (
                        <td className="py-2.5 px-4 text-right whitespace-nowrap">
                          <div className="font-medium tabular-nums text-ink">{totalFee > 0 ? rupiah(totalFee) : 'Gratis'}</div>
                          <div className="text-xs tabular-nums text-ink-3">
                            Pokok {rupiah(baseFee)}
                            {umatExtraTotal > 0 && ` + tambahan ${rupiah(umatExtraTotal)}`}
                          </div>
                        </td>
                      )}

                      {isComplex && (
                        <td className="py-2.5 px-4">
                          <Badge tone={isPaid ? 'ok' : 'gold'}>{isPaid ? 'Lunas' : 'Belum lunas'}</Badge>
                        </td>
                      )}

                      <td className="py-2.5 px-4">
                        <Badge tone={reg.is_attended ? 'ok' : 'neutral'}>{reg.is_attended ? 'Hadir' : 'Belum hadir'}</Badge>
                      </td>

                      <td className="py-2 px-4">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          {isComplex && (
                            <Button size="sm" onClick={() => onTogglePayment(reg.id, totalFee)}>
                              {isPaid ? 'Batalkan lunas' : 'Tandai lunas'}
                            </Button>
                          )}

                          <Button size="sm" onClick={() => onToggleAttendance(reg.id)}>
                            {reg.is_attended ? 'Batalkan hadir' : 'Tandai hadir'}
                          </Button>

                          {onCancelRegistration &&
                            (confirmDeleteId === reg.id ? (
                              <span role="group" aria-label={`Konfirmasi batal daftar ${name}`} className="inline-flex items-center gap-1.5 pl-1.5 border-l border-line">
                                <span className="text-xs text-ink-2">Batalkan pendaftaran?</span>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => {
                                    onCancelRegistration(reg.id);
                                    setConfirmDeleteId(null);
                                  }}
                                >
                                  Ya, batalkan
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                                  Tidak
                                </Button>
                              </span>
                            ) : (
                              <Button size="sm" variant="danger" onClick={() => setConfirmDeleteId(reg.id)} aria-label={`Batalkan pendaftaran ${name}`}>
                                Batal daftar
                              </Button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
};
