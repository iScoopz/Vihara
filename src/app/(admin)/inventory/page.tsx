'use client'

import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, Search, ShoppingCart } from 'lucide-react';
import {
  getInventoryPageBundle,
  updateStockQuantity,
  addInventoryItem,
  recordInventoryPurchase
} from '@/lib/actions/vihara-actions';
import { InventoryItem, InventoryTransaction, Profile } from '@/types/database';
import { SearchableUmatSelect } from '@/components/ui/SearchableUmatSelect';
import { Badge, Button, Fab, Field, Modal, ModalActions, PageHeader, Panel, StateMessage, inputClass, selectClass } from '@/components/ui/kit';

const LOW_STOCK_LIMIT = 10;

const formatRupiah = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'stok' | 'transaksi'>('stok');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<InventoryItem | null>(null);
  // Opened from the phone Fab on the history tab: the item is picked inside the form.
  const [purchasePicksItem, setPurchasePicksItem] = useState(false);

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Dupa');
  const [stockQty, setStockQty] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState('Karton');

  const [purchaseQty, setPurchaseQty] = useState('1');
  const [selectedUmatId, setSelectedUmatId] = useState('');
  const [customBuyerName, setCustomBuyerName] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [purchaseError, setPurchaseError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const bundle = await getInventoryPageBundle();
      setItems(bundle.inventory);
      setTransactions(bundle.transactions);
      setProfiles(bundle.profiles);
      setLoadState('ready');
    } catch (e) {
      console.error('Inventory load error:', e);
      setLoadState(prev => (prev === 'ready' ? prev : 'error'));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const retryLoad = () => {
    setLoadState('loading');
    loadData();
  };

  // Update the row first so the number changes on tap; reload from the server only if the save fails.
  const handleStockAdjust = async (id: string, delta: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, stock_quantity: Math.max(0, item.stock_quantity + delta) } : item));
    try {
      const res = await updateStockQuantity(id, delta);
      if (res.error) loadData();
    } catch {
      loadData();
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addInventoryItem({
      item_name: itemName,
      category: category,
      stock_quantity: parseInt(stockQty, 10) || 0,
      price_per_unit: parseFloat(pricePerUnit) || 0,
      unit: unit
    });

    setIsAddItemModalOpen(false);
    setItemName('');
    setStockQty('');
    setPricePerUnit('');
    loadData();
  };

  const openPurchaseModal = (item: InventoryItem | null) => {
    setSelectedItemForPurchase(item);
    setPurchasePicksItem(item === null);
    setPurchaseQty('1');
    setPurchaseError('');
    setIsPurchaseModalOpen(true);
  };

  const handleProcessPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForPurchase) return;

    const buyerName = customBuyerName || (profiles.find(p => p.id === selectedUmatId)?.full_name) || 'Umat Vihara';

    const res = await recordInventoryPurchase(
      selectedItemForPurchase.id,
      parseInt(purchaseQty, 10) || 1,
      buyerName,
      selectedUmatId || undefined,
      purchaseNotes
    );

    if (res.error) {
      setPurchaseError(res.error);
    } else {
      setIsPurchaseModalOpen(false);
      setCustomBuyerName('');
      setPurchaseNotes('');
      loadData();
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const lowStockCount = items.filter(i => i.stock_quantity <= LOW_STOCK_LIMIT).length;

  const tabClass = (active: boolean) =>
    `min-h-[44px] sm:min-h-[38px] px-3 text-sm rounded-md cursor-pointer ${
      active ? 'bg-surface text-ink font-semibold border border-line' : 'text-ink-2 font-medium hover:text-ink'
    }`;

  const chipClass = (active: boolean) =>
    `min-h-[44px] sm:min-h-[32px] px-3 rounded-lg text-xs whitespace-nowrap cursor-pointer border ${
      active ? 'bg-brand text-on-brand border-brand font-semibold' : 'bg-surface text-ink-2 border-line-strong hover:bg-surface-2 font-medium'
    }`;

  const stepperButtonClass =
    'w-8 h-8 inline-flex items-center justify-center rounded-lg border border-line-strong bg-surface text-ink hover:bg-surface-2 disabled:opacity-50 cursor-pointer';

  const renderStockStepper = (item: InventoryItem) => (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => handleStockAdjust(item.id, -1)}
        disabled={item.stock_quantity <= 0}
        aria-label={`Kurangi stok ${item.item_name}`}
        className={stepperButtonClass}
      >
        <Minus size={14} aria-hidden />
      </button>
      <span className={`min-w-[4.5rem] text-center text-sm tabular-nums ${item.stock_quantity <= LOW_STOCK_LIMIT ? 'text-gold font-semibold' : 'text-ink'}`}>
        {item.stock_quantity} {item.unit}
      </span>
      <button
        type="button"
        onClick={() => handleStockAdjust(item.id, 1)}
        aria-label={`Tambah stok ${item.item_name}`}
        className={stepperButtonClass}
      >
        <Plus size={14} aria-hidden />
      </button>
    </div>
  );

  const thClass = 'sticky top-0 z-10 bg-surface-2 border-b border-line py-2.5 px-4 font-medium first:rounded-tl-xl last:rounded-tr-xl';

  const phoneStepClass =
    'min-h-[44px] inline-flex items-center justify-center gap-1 rounded-lg border border-line-strong bg-surface text-sm font-semibold text-ink tabular-nums hover:bg-surface-2 disabled:opacity-50 cursor-pointer';

  const purchaseTotal = selectedItemForPurchase
    ? (parseInt(purchaseQty, 10) || 0) * selectedItemForPurchase.price_per_unit
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventaris"
        description="Stok barang kebaktian dan pembelian oleh umat. Stok berkurang otomatis saat pembelian dicatat."
        actions={
          <Button variant="primary" className="max-md:hidden" onClick={() => setIsAddItemModalOpen(true)}>
            <Plus size={14} aria-hidden />
            Tambah barang
          </Button>
        }
      />

      {loadState === 'ready' && activeTab === 'stok' && (
        <Fab label="Tambah barang" icon={<Plus size={18} />} onClick={() => setIsAddItemModalOpen(true)} />
      )}
      {loadState === 'ready' && activeTab === 'transaksi' && items.length > 0 && (
        <Fab label="Catat pembelian" icon={<ShoppingCart size={18} />} onClick={() => openPurchaseModal(null)} />
      )}

      {loadState === 'loading' && (
        <Panel><StateMessage kind="loading" title="Memuat inventaris..." /></Panel>
      )}

      {loadState === 'error' && (
        <Panel>
          <StateMessage
            kind="error"
            title="Inventaris gagal dimuat."
            description="Periksa koneksi lalu coba lagi."
            action={<Button size="sm" onClick={retryLoad}>Coba lagi</Button>}
          />
        </Panel>
      )}

      {loadState === 'ready' && (
        <>
          {lowStockCount > 0 && (
            <p className="rounded-lg bg-gold-soft text-gold px-4 py-3 text-sm">
              {lowStockCount} barang tersisa {LOW_STOCK_LIMIT} atau kurang. Tambah stoknya sebelum kegiatan berikutnya.
            </p>
          )}

          <div role="tablist" aria-label="Tampilan inventaris" className="inline-flex gap-1 p-1 rounded-lg bg-surface-2">
            <button role="tab" type="button" aria-selected={activeTab === 'stok'} onClick={() => setActiveTab('stok')} className={tabClass(activeTab === 'stok')}>
              Stok barang <span className="tabular-nums text-ink-3">({items.length})</span>
            </button>
            <button role="tab" type="button" aria-selected={activeTab === 'transaksi'} onClick={() => setActiveTab('transaksi')} className={tabClass(activeTab === 'transaksi')}>
              Riwayat pembelian <span className="tabular-nums text-ink-3">({transactions.length})</span>
            </button>
          </div>

          {activeTab === 'stok' && (
            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="relative flex-1 md:max-w-md">
                  <span className="sr-only">Cari barang</span>
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
                  <input
                    type="search"
                    placeholder="Cari dupa, lilin, minyak, buku"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </label>

                <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter kategori">
                  <button type="button" aria-pressed={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} className={chipClass(selectedCategory === 'all')}>
                    Semua kategori
                  </button>
                  {categories.map(cat => (
                    <button key={cat} type="button" aria-pressed={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} className={chipClass(selectedCategory === cat)}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredItems.length === 0 ? (
                <Panel>
                  <StateMessage
                    kind="empty"
                    title={items.length === 0 ? 'Belum ada barang di inventaris.' : 'Tidak ada barang yang cocok dengan pencarian ini.'}
                    action={
                      items.length === 0 ? (
                        <Button variant="primary" size="sm" onClick={() => setIsAddItemModalOpen(true)}>Tambah barang</Button>
                      ) : (
                        <Button size="sm" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>Reset filter</Button>
                      )
                    }
                  />
                </Panel>
              ) : (
                <Panel className="overflow-hidden xl:overflow-visible">
                  <table className="hidden xl:table w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-ink-3">
                        <th scope="col" className={thClass}>Barang</th>
                        <th scope="col" className={thClass}>Kategori</th>
                        <th scope="col" className={`${thClass} text-right`}>Harga per unit</th>
                        <th scope="col" className={`${thClass} text-center`}>Stok</th>
                        <th scope="col" className={thClass}><span className="sr-only">Aksi</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-2">
                          <td className="py-2.5 px-4 font-medium text-ink">{item.item_name}</td>
                          <td className="py-2.5 px-4 text-ink-2">{item.category}</td>
                          <td className="py-2.5 px-4 text-ink-2 tabular-nums text-right whitespace-nowrap">
                            {formatRupiah(Number(item.price_per_unit))} / {item.unit}
                          </td>
                          <td className="py-2 px-4 text-center">{renderStockStepper(item)}</td>
                          <td className="py-2 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button size="sm" onClick={() => handleStockAdjust(item.id, 10)}>Restok +10</Button>
                              <Button variant="primary" size="sm" onClick={() => openPurchaseModal(item)}>
                                <ShoppingCart size={14} aria-hidden />
                                Catat pembelian
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ul className="xl:hidden divide-y divide-line">
                    {filteredItems.map((item) => {
                      const low = item.stock_quantity <= LOW_STOCK_LIMIT;
                      return (
                        <li key={item.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm font-medium text-ink break-words">{item.item_name}</p>
                              <p className="text-xs text-ink-2">
                                {item.category}, <span className="tabular-nums">{formatRupiah(Number(item.price_per_unit))}</span> / {item.unit}
                              </p>
                              {low && <Badge tone="gold">Stok menipis</Badge>}
                            </div>
                            <p className="shrink-0 text-right">
                              <span className={`block font-display text-3xl font-semibold leading-none tabular-nums ${low ? 'text-gold' : 'text-ink'}`}>
                                {item.stock_quantity}
                              </span>
                              <span className="text-xs text-ink-3">{item.unit}</span>
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2" role="group" aria-label={`Ubah stok ${item.item_name}`}>
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(item.id, -1)}
                              disabled={item.stock_quantity <= 0}
                              aria-label={`Kurangi stok ${item.item_name} 1`}
                              className={phoneStepClass}
                            >
                              <Minus size={14} aria-hidden />1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(item.id, 1)}
                              aria-label={`Tambah stok ${item.item_name} 1`}
                              className={phoneStepClass}
                            >
                              <Plus size={14} aria-hidden />1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStockAdjust(item.id, 10)}
                              aria-label={`Tambah stok ${item.item_name} 10`}
                              className={phoneStepClass}
                            >
                              <Plus size={14} aria-hidden />10
                            </button>
                          </div>
                          <Button variant="primary" className="w-full" onClick={() => openPurchaseModal(item)}>
                            <ShoppingCart size={14} aria-hidden />
                            Catat pembelian
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                </Panel>
              )}
            </div>
          )}

          {activeTab === 'transaksi' && (
            transactions.length === 0 ? (
              <Panel><StateMessage kind="empty" title="Belum ada pembelian yang dicatat." /></Panel>
            ) : (
              <Panel className="overflow-hidden md:overflow-visible">
                <table className="hidden md:table w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs text-ink-3">
                      <th scope="col" className={thClass}>Waktu</th>
                      <th scope="col" className={thClass}>Pembeli</th>
                      <th scope="col" className={thClass}>Barang</th>
                      <th scope="col" className={`${thClass} text-right`}>Jumlah</th>
                      <th scope="col" className={`${thClass} text-right`}>Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-surface-2">
                        <td className="py-2.5 px-4 text-ink-2 whitespace-nowrap">
                          {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-ink">{tx.buyer_name}</td>
                        <td className="py-2.5 px-4 text-ink-2">{tx.item_name}</td>
                        <td className="py-2.5 px-4 text-ink tabular-nums text-right">{tx.quantity}</td>
                        <td className="py-2.5 px-4 text-ink tabular-nums text-right whitespace-nowrap">{formatRupiah(Number(tx.total_price))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <ul className="md:hidden divide-y divide-line">
                  {transactions.map(tx => (
                    <li key={tx.id} className="p-3.5 space-y-0.5">
                      <div className="flex justify-between gap-3">
                        <p className="text-sm font-medium text-ink break-words">{tx.buyer_name}</p>
                        <p className="text-sm tabular-nums text-ink shrink-0">{formatRupiah(Number(tx.total_price))}</p>
                      </div>
                      <p className="text-xs text-ink-2">
                        <span className="tabular-nums">{tx.quantity}</span> x {tx.item_name}
                      </p>
                      <p className="text-xs text-ink-3">
                        {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>
            )
          )}
        </>
      )}

      <Modal
        open={isPurchaseModalOpen && (!!selectedItemForPurchase || purchasePicksItem)}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Catat pembelian"
      >
        {purchasePicksItem && (
          <Field label="Barang" className={selectedItemForPurchase ? 'mb-4' : ''}>
            <select
              value={selectedItemForPurchase?.id ?? ''}
              onChange={(e) => {
                setSelectedItemForPurchase(items.find(i => i.id === e.target.value) ?? null);
                setPurchaseQty('1');
              }}
              className={selectClass}
            >
              <option value="" disabled>Pilih barang</option>
              {items.map(i => (
                <option key={i.id} value={i.id} disabled={i.stock_quantity <= 0}>
                  {i.item_name} (stok {i.stock_quantity} {i.unit})
                </option>
              ))}
            </select>
          </Field>
        )}
        {selectedItemForPurchase && (
          <form onSubmit={handleProcessPurchase} className="space-y-4">
            <dl className="rounded-lg bg-surface-2 p-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-ink-3">Barang</dt>
              <dd className="font-medium text-ink break-words">{selectedItemForPurchase.item_name}</dd>
              <dt className="text-ink-3">Harga</dt>
              <dd className="tabular-nums text-ink">{formatRupiah(Number(selectedItemForPurchase.price_per_unit))} / {selectedItemForPurchase.unit}</dd>
              <dt className="text-ink-3">Sisa stok</dt>
              <dd className="tabular-nums text-ink">{selectedItemForPurchase.stock_quantity} {selectedItemForPurchase.unit}</dd>
            </dl>

            {purchaseError && (
              <p role="alert" className="rounded-lg bg-danger-soft text-danger px-3 py-2 text-sm">{purchaseError}</p>
            )}

            <SearchableUmatSelect
              label="Umat pembeli (opsional)"
              profiles={profiles}
              value={selectedUmatId}
              onChange={(id, profile) => {
                setSelectedUmatId(id);
                if (profile) setCustomBuyerName(profile.full_name);
              }}
              placeholder="Cari nama umat"
            />

            <Field label="Nama pembeli">
              <input
                type="text"
                required
                placeholder="Nama umat atau pembeli umum"
                value={customBuyerName}
                onChange={(e) => setCustomBuyerName(e.target.value)}
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Jumlah">
                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={selectedItemForPurchase.stock_quantity}
                  required
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(e.target.value)}
                  className={`${inputClass} tabular-nums`}
                />
              </Field>
              <div>
                <span className="block text-xs font-medium text-ink-2 mb-1">Total bayar</span>
                <p className="min-h-[44px] sm:min-h-[38px] flex items-center text-base font-semibold tabular-nums text-ink" aria-live="polite">
                  {formatRupiah(purchaseTotal)}
                </p>
              </div>
            </div>

            <ModalActions>
              <Button onClick={() => setIsPurchaseModalOpen(false)}>Batal</Button>
              <Button type="submit" variant="primary">Simpan dan kurangi stok</Button>
            </ModalActions>
          </form>
        )}
      </Modal>

      <Modal open={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title="Tambah barang">
        <form onSubmit={handleAddItem} className="space-y-4">
          <Field label="Nama barang">
            <input
              type="text"
              required
              placeholder="Contoh: Dupa Gaharu 500 g"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Kategori">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
                <option value="Dupa">Dupa</option>
                <option value="Lilin">Lilin</option>
                <option value="Minyak">Minyak pelita</option>
                <option value="Buku">Buku paritta</option>
              </select>
            </Field>
            <Field label="Satuan">
              <input
                type="text"
                required
                placeholder="Karton, pasang"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Stok awal">
              <input
                type="number"
                inputMode="numeric"
                required
                min={0}
                placeholder="100"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className={`${inputClass} tabular-nums`}
              />
            </Field>
            <Field label="Harga per unit (Rp)">
              <input
                type="number"
                inputMode="numeric"
                required
                min={0}
                placeholder="45000"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className={`${inputClass} tabular-nums`}
              />
            </Field>
          </div>

          <ModalActions>
            <Button onClick={() => setIsAddItemModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan barang</Button>
          </ModalActions>
        </form>
      </Modal>
    </div>
  );
}
