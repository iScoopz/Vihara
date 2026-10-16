import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ViharaEvent, EventExtraFee, UmatBagian } from '@/types/database';
import { updateEventPricing } from '@/lib/actions/vihara-actions';
import { useToast } from '@/components/ui/ToastNotification';
import { Button, Field, Modal, ModalActions, inputClass } from '@/components/ui/kit';

interface EventPricingModalProps {
  isOpen: boolean;
  event: ViharaEvent;
  onClose: () => void;
  onSaved: (pricing?: Record<string, number>, extraFees?: EventExtraFee[]) => void;
}

const BAGIAN_LIST: UmatBagian[] = ['Bintang', 'GM', 'Pro-M 40s', 'Pro-M Progresif', 'Pria', 'Wanita', 'Inspirasi'];

export const EventPricingModal: React.FC<EventPricingModalProps> = ({
  isOpen,
  event,
  onClose,
  onSaved
}) => {
  const { showToast } = useToast();
  const [pricingMap, setPricingMap] = useState<Record<string, string>>({});
  const [extraFees, setExtraFees] = useState<EventExtraFee[]>([]);

  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState('');

  useEffect(() => {
    if (event) {
      const existingPricing = event.pricing_per_bagian || {};
      const initialMap: Record<string, string> = {};
      BAGIAN_LIST.forEach((bg) => {
        initialMap[bg] = existingPricing[bg] !== undefined ? String(existingPricing[bg]) : '0';
      });
      setPricingMap(initialMap);
      setExtraFees(event.extra_fees || []);
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const handleAddExtraFee = () => {
    if (!newFeeName.trim()) return;
    const amountNum = parseFloat(newFeeAmount) || 0;
    const newFee: EventExtraFee = {
      id: `fee_${Date.now()}`,
      fee_name: newFeeName.trim(),
      amount: amountNum
    };
    setExtraFees([...extraFees, newFee]);
    setNewFeeName('');
    setNewFeeAmount('');
  };

  const handleRemoveExtraFee = (feeId: string) => {
    setExtraFees(extraFees.filter((f) => f.id !== feeId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPricing: Record<string, number> = {};
    Object.entries(pricingMap).forEach(([bgKey, valStr]) => {
      formattedPricing[bgKey] = parseFloat(valStr) || 0;
    });

    const previousPricing = event.pricing_per_bagian;
    const previousFees = event.extra_fees;
    onSaved(formattedPricing, extraFees);
    onClose();
    const res = await updateEventPricing(event.id, formattedPricing, extraFees);
    if (res.error) {
      onSaved(previousPricing, previousFees);
      showToast(res.error, 'error', 'Tarif tidak tersimpan');
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Tarif dan biaya tambahan" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-ink mb-2">Tarif pokok per bagian</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {BAGIAN_LIST.map((bg) => (
              <Field key={bg} label={bg}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-3" aria-hidden>Rp</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="5000"
                    value={pricingMap[bg] || '0'}
                    onChange={(e) => setPricingMap({ ...pricingMap, [bg]: e.target.value })}
                    className={`${inputClass} pl-9 tabular-nums`}
                  />
                </div>
              </Field>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3 border-t border-line pt-4">
          <legend className="sr-only">Biaya tambahan pilihan</legend>
          <div>
            <h3 className="text-sm font-semibold text-ink">Biaya tambahan pilihan</h3>
            <p className="text-xs text-ink-3">Misalnya transportasi atau buku. Peserta bisa memilih ikut atau tidak.</p>
          </div>

          {extraFees.length > 0 ? (
            <ul className="divide-y divide-line border border-line rounded-lg">
              {extraFees.map((fee) => (
                <li key={fee.id} className="flex items-center justify-between gap-3 pl-3 pr-1 py-1">
                  <span className="text-sm text-ink min-w-0 break-words">{fee.fee_name}</span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="text-sm tabular-nums text-ink-2">+Rp {fee.amount.toLocaleString('id-ID')}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraFee(fee.id)}
                      aria-label={`Hapus ${fee.fee_name}`}
                      className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-danger hover:bg-danger-soft cursor-pointer"
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-3">Belum ada biaya tambahan.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_9rem_auto] gap-2 items-end">
            <Field label="Nama biaya">
              <input
                type="text"
                placeholder="Contoh: Bus, buku Kensyu"
                value={newFeeName}
                onChange={(e) => setNewFeeName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Nominal">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-3" aria-hidden>Rp</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="5000"
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(e.target.value)}
                  className={`${inputClass} pl-9 tabular-nums`}
                />
              </div>
            </Field>
            <Button onClick={handleAddExtraFee} disabled={!newFeeName.trim()}>
              <Plus size={14} aria-hidden />
              Tambah biaya
            </Button>
          </div>
        </fieldset>

        <ModalActions>
          <Button variant="neutral" onClick={onClose}>Batal</Button>
          <Button type="submit" variant="primary">Simpan tarif</Button>
        </ModalActions>
      </form>
    </Modal>
  );
};
