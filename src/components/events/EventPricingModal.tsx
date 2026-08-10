import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, X, DollarSign } from 'lucide-react';
import { ViharaEvent, EventExtraFee, UmatBagian } from '@/types/database';
import { updateEventPricing } from '@/lib/actions/vihara-actions';

interface EventPricingModalProps {
  isOpen: boolean;
  event: ViharaEvent;
  onClose: () => void;
  onSaved: () => void;
}

const BAGIAN_LIST: UmatBagian[] = ['Bintang', 'GM', 'Pro-M 40s', 'Pro-M Progresif', 'Pria', 'Wanita', 'Inspirasi'];

export const EventPricingModal: React.FC<EventPricingModalProps> = ({
  isOpen,
  event,
  onClose,
  onSaved
}) => {
  const [pricingMap, setPricingMap] = useState<Record<string, string>>({});
  const [extraFees, setExtraFees] = useState<EventExtraFee[]>([]);

  // New Extra Fee Input State
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

    await updateEventPricing(event.id, formattedPricing, extraFees);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6 text-xs my-8">
        <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Kelola Tarif & Biaya Tambahan Event
              </h3>
              <p className="text-[11px] text-slate-500">
                Atur tarif pendaftaran per Bagian Umat dan sesuaikan komponen biaya tambahan sewaktu-waktu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-purple-900/50 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: TARIF BIASA PER BAGIAN UMAT */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-purple-950 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Tarif Biaya Pendaftaran Pokok (per Bagian Umat)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {BAGIAN_LIST.map((bg) => (
                <div key={bg} className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 space-y-1">
                  <label className="block font-black text-purple-950 dark:text-purple-200 text-xs">{bg}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[11px] font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={pricingMap[bg] || '0'}
                      onChange={(e) => setPricingMap({ ...pricingMap, [bg]: e.target.value })}
                      className="w-full bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg pl-9 pr-2 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: BIAYA TAMBAHAN INSIDENTAL / DINAMIS */}
          <div className="space-y-3 border-t border-purple-100 dark:border-purple-900/60 pt-4">
            <h4 className="font-extrabold text-xs text-purple-950 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Biaya Tambahan Insidental (Transportasi, Penginapan, Buku, dll)</span>
            </h4>

            {/* List Existing Extra Fees */}
            <div className="space-y-2">
              {extraFees.length > 0 ? (
                extraFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                    <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>{fee.fee_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-purple-700 dark:text-purple-300">
                        + Rp {fee.amount.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExtraFee(fee.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 rounded transition cursor-pointer"
                        title="Hapus Biaya Tambahan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic text-[11px] py-1">Belum ada komponen biaya tambahan insidental yang dimasukkan.</p>
              )}
            </div>

            {/* Input Form for New Extra Fee */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 space-y-3">
              <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Tambah Komponen Biaya Tambahan Baru:</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nama Biaya (misal: Biaya Transportasi Bus, Buku Kensyu)"
                  value={newFeeName}
                  onChange={(e) => setNewFeeName(e.target.value)}
                  className="flex-1 bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
                <div className="relative w-full sm:w-36">
                  <span className="absolute left-3 top-2 text-[11px] font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    placeholder="Nominal"
                    value={newFeeAmount}
                    onChange={(e) => setNewFeeAmount(e.target.value)}
                    className="w-full bg-white dark:bg-purple-900/60 border border-purple-200 dark:border-purple-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddExtraFee}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-purple-100 dark:border-purple-900/60 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl gradient-mnsbdi text-white font-black text-xs hover:opacity-95 transition cursor-pointer shadow-md"
            >
              Simpan Perubahan Biaya
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
