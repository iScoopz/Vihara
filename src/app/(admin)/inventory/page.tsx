'use client'

import { useState, useEffect } from 'react';
import { 
  Package, 
  PlusCircle, 
  Search, 
  AlertTriangle, 
  Flame, 
  BookOpen, 
  Droplet,
  ShoppingCart,
  History,
  Receipt,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  getInventoryPageBundle,
  updateStockQuantity,
  addInventoryItem,
  recordInventoryPurchase
} from '@/lib/actions/vihara-actions';
import { InventoryItem, InventoryTransaction, Profile } from '@/types/database';
import { SearchableUmatSelect } from '@/components/ui/SearchableUmatSelect';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'stok' | 'transaksi'>('stok');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<InventoryItem | null>(null);

  // New Item Form
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Dupa');
  const [stockQty, setStockQty] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [unit, setUnit] = useState('Karton');

  // Purchase Form
  const [purchaseQty, setPurchaseQty] = useState('1');
  const [selectedUmatId, setSelectedUmatId] = useState('');
  const [customBuyerName, setCustomBuyerName] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [purchaseError, setPurchaseError] = useState('');

  const loadData = async () => {
    const bundle = await getInventoryPageBundle();
    setItems(bundle.inventory);
    setTransactions(bundle.transactions);
    setProfiles(bundle.profiles);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockAdjust = async (id: string, delta: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, stock_quantity: Math.max(0, item.stock_quantity + delta) } : item));
    try {
      const res = await updateStockQuantity(id, delta);
      if (res.error) loadData();
    } catch (e) {
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

  const openPurchaseModal = (item: InventoryItem) => {
    setSelectedItemForPurchase(item);
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

  const lowStockCount = items.filter(i => i.stock_quantity <= 10).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="text-purple-600 dark:text-purple-400" size={28} />
            <span>Manajemen Inventaris & POS Pembelian Umat</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pencatatan barang kebaktian, harga unit, & pengurangan stok otomatis saat pembelian</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddItemModalOpen(true)}
            className="inline-flex items-center gap-2 bg-purple-900 hover:bg-purple-800 text-amber-300 font-black px-4 py-2.5 rounded-xl transition shadow-sm border border-purple-700/60 text-xs active:scale-95 cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-extrabold">Peringatan Stok Menipis!</p>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Terdapat <strong className="font-extrabold">{lowStockCount} item</strong> barang di bawah batas minimum stok alert.
              </p>
            </div>
          </div>
          <span className="text-xs bg-rose-600 text-white font-extrabold px-3 py-1 rounded-lg">
            Action Required
          </span>
        </div>
      )}

      {/* Tabs Navigation (Sleek Segmented Pill Container) */}
      <div className="bg-slate-100/90 dark:bg-purple-950/40 p-1.5 rounded-2xl border border-slate-200/80 dark:border-purple-900/50 inline-flex flex-wrap gap-1.5 shadow-xs">
        <button
          onClick={() => setActiveTab('stok')}
          className={`py-2 px-4 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'stok'
              ? 'bg-white dark:bg-[#1f1338] text-purple-950 dark:text-amber-300 font-black shadow-xs border border-slate-200/80 dark:border-purple-700/60'
              : 'text-slate-600 dark:text-purple-300/80 font-bold hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-purple-900/30'
          }`}
        >
          <Package size={15} />
          <span>Daftar Stok Barang ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transaksi')}
          className={`py-2 px-4 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'transaksi'
              ? 'bg-white dark:bg-[#1f1338] text-purple-950 dark:text-amber-300 font-black shadow-xs border border-slate-200/80 dark:border-purple-700/60'
              : 'text-slate-600 dark:text-purple-300/80 font-bold hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-purple-900/30'
          }`}
        >
          <History size={15} />
          <span>Riwayat Transaksi ({transactions.length})</span>
        </button>
      </div>

      {/* TAB 1: STOK BARANG */}
      {activeTab === 'stok' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari Dupa, Lilin, Minyak, Buku..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                    : 'bg-black/[0.03] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]'
                }`}
              >
                Semua Kategori
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap cursor-pointer font-medium ${
                    selectedCategory === cat
                      ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                      : 'bg-black/[0.03] dark:bg-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.1]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50 dark:bg-indigo-950/60 border-b border-purple-100 dark:border-indigo-900 text-xs font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                    <th className="py-4 px-6">Nama Barang Inventaris</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6">Harga per Unit</th>
                    <th className="py-4 px-6">Sisa Stok</th>
                    <th className="py-4 px-6 text-center">Aksi POS Pembelian & Restok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-indigo-900/60 text-sm">
                  {filteredItems.map((item) => {
                    const isLow = item.stock_quantity <= 10;
                    return (
                      <tr key={item.id} className="hover:bg-purple-50/40 dark:hover:bg-indigo-900/40 transition">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                            {item.category === 'Dupa' ? <Flame size={18} /> :
                             item.category === 'Lilin' ? <Flame size={18} /> :
                             item.category === 'Minyak' ? <Droplet size={18} /> :
                             <BookOpen size={18} />}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-slate-100">{item.item_name}</p>
                            <p className="text-[11px] text-slate-400">Min. Alert: 10 {item.unit}</p>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-mono font-bold text-purple-900 dark:text-purple-200">
                          Rp {Number(item.price_per_unit).toLocaleString('id-ID')} / {item.unit}
                        </td>

                        <td className="py-4 px-6 font-mono">
                          <span className={`text-sm font-extrabold px-2.5 py-1 rounded ${
                            isLow ? 'text-rose-600 bg-rose-50 dark:bg-rose-950 border border-rose-200' : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950'
                          }`}>
                            {item.stock_quantity} {item.unit}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openPurchaseModal(item)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5"
                            >
                              <ShoppingCart size={14} />
                              <span>Catat Pembelian Umat</span>
                            </button>

                            <button
                              onClick={() => handleStockAdjust(item.id, 10)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 transition"
                              title="Restok +10"
                            >
                              +10 Restok
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIWAYAT TRANSAKSI PEMBELIAN UMAT */}
      {activeTab === 'transaksi' && (
        <div className="rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 overflow-hidden shadow-sm">
          <div className="p-4 bg-purple-50 dark:bg-indigo-950/60 border-b border-purple-100 dark:border-indigo-900 flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
              <Receipt size={18} className="text-amber-500" />
              <span>Log Pembelian Inventaris Umat (Otomatis Potong Stok)</span>
            </h3>
            <span className="text-xs text-slate-500">POS Sales History</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-purple-100 dark:border-indigo-900 text-slate-400 uppercase font-bold">
                <th className="p-4">Tanggal & Waktu</th>
                <th className="p-4">Nama Pembeli (Umat)</th>
                <th className="p-4">Barang Terbeli</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Total Harga (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-indigo-900/60">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-purple-50/40 dark:hover:bg-indigo-900/40">
                  <td className="p-4 font-mono text-slate-500">
                    {new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <UserCheck size={14} className="text-purple-500" />
                    <span>{tx.buyer_name}</span>
                  </td>
                  <td className="p-4 font-semibold text-purple-950 dark:text-purple-200">
                    {tx.item_name}
                  </td>
                  <td className="p-4 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {tx.quantity} Unit
                  </td>
                  <td className="p-4 font-extrabold font-mono text-purple-900 dark:text-purple-100">
                    Rp {Number(tx.total_price).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal POS Process Purchase */}
      {isPurchaseModalOpen && selectedItemForPurchase && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1b4b] border border-purple-200 dark:border-indigo-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-indigo-900 pb-3 flex items-center gap-2">
              <ShoppingCart className="text-emerald-500" size={20} />
              <span>Catat Pembelian Barang Umat</span>
            </h3>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-900 space-y-1 text-xs">
              <p className="font-extrabold text-purple-950 dark:text-white text-sm">{selectedItemForPurchase.item_name}</p>
              <p className="text-slate-500">Harga Unit: <strong className="text-purple-700 dark:text-purple-300">Rp {Number(selectedItemForPurchase.price_per_unit).toLocaleString('id-ID')}</strong></p>
              <p className="text-slate-500">Sisa Stok Tersebar: <strong className="text-emerald-600 dark:text-emerald-400">{selectedItemForPurchase.stock_quantity} {selectedItemForPurchase.unit}</strong></p>
            </div>

            {purchaseError && (
              <div className="text-xs p-2.5 rounded-lg bg-rose-100 text-rose-800 font-bold border border-rose-200">
                {purchaseError}
              </div>
            )}

            <form onSubmit={handleProcessPurchase} className="space-y-3 text-xs">
              <div>
                <SearchableUmatSelect
                  label="Pilih Umat Pembeli"
                  profiles={profiles}
                  value={selectedUmatId}
                  onChange={(id, profile) => {
                    setSelectedUmatId(id);
                    if (profile) setCustomBuyerName(profile.full_name);
                  }}
                  placeholder="-- Non-Umat / Cari Umat --"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pembeli (Tampilan)</label>
                <input
                  type="text"
                  required
                  placeholder="Suryani Dewi / Pembeli Umum"
                  value={customBuyerName}
                  onChange={(e) => setCustomBuyerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Pembelian</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedItemForPurchase.stock_quantity}
                    required
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Total Pembayaran</label>
                  <div className="w-full bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-2 text-xs font-extrabold text-purple-900 dark:text-purple-200">
                    Rp {((parseInt(purchaseQty, 10) || 0) * selectedItemForPurchase.price_per_unit).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-indigo-900">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md"
                >
                  Konfirmasi & Potong Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Inventory */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1b4b] border border-purple-200 dark:border-indigo-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-indigo-900 pb-3">Input Barang Inventaris Baru</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dupa Gaharu Asli 500g"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="Dupa">Dupa</option>
                    <option value="Lilin">Lilin</option>
                    <option value="Minyak">Minyak Pelita</option>
                    <option value="Buku">Buku Paritta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan</label>
                  <input
                    type="text"
                    required
                    placeholder="Karton / Pasang"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga per Unit (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-indigo-900">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#1d1d1f] hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold px-5 py-2 rounded-full text-xs shadow-xs transition-all cursor-pointer"
                >
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
