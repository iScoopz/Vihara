'use client'

import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Calendar, 
  MapPin, 
  Building,
  Filter,
  Cake,
  Eye
} from 'lucide-react';
import { getProfiles, addProfile, deleteProfile } from '@/lib/actions/vihara-actions';
import { Profile } from '@/types/database';

export default function UmatDirectoryPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHan, setSelectedHan] = useState('all');
  const [selectedCetya, setSelectedCetya] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUmatDetail, setSelectedUmatDetail] = useState<Profile | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [han, setHan] = useState('HAN-Jakarta-01');
  const [cetya, setCetya] = useState('Cetya Avalokitesvara');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const loadProfiles = async () => {
    const data = await getProfiles();
    setProfiles(data);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleAddUmat = async (e: React.FormEvent) => {
    e.preventDefault();

    await addProfile({
      role: 'umat',
      full_name: fullName,
      han: han,
      cetya: cetya,
      phone: phone,
      birth_date: birthDate,
      gender: gender,
      address: address,
      emergency_contact: emergencyContact,
      is_active: true
    });

    setIsModalOpen(false);
    setFullName('');
    setPhone('');
    setBirthDate('');
    setAddress('');
    setEmergencyContact('');
    loadProfiles();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data umat ini?')) {
      await deleteProfile(id);
      loadProfiles();
    }
  };

  const hanOptions = Array.from(new Set(profiles.map(p => p.han).filter(Boolean)));
  const cetyaOptions = Array.from(new Set(profiles.map(p => p.cetya).filter(Boolean)));

  const filteredProfiles = profiles.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.han && p.han.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (p.phone && p.phone.includes(searchTerm));
    
    const matchHan = selectedHan === 'all' || p.han === selectedHan;
    const matchCetya = selectedCetya === 'all' || p.cetya === selectedCetya;
    const matchStatus = selectedStatus === 'all' || 
                        (selectedStatus === 'active' ? p.is_active : !p.is_active);
    
    let matchMonth = true;
    if (selectedMonth !== 'all' && p.birth_date) {
      const monthNum = parseInt(p.birth_date.split('-')[1], 10);
      matchMonth = monthNum === parseInt(selectedMonth, 10);
    }

    return matchSearch && matchHan && matchCetya && matchStatus && matchMonth;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="text-purple-600 dark:text-purple-400" size={28} />
            <span>Direktori Umat MNSBDI</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pencarian & penyaringan data umat berdasarkan HAN, Cetya, & Bulan Ultah</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 gradient-mnsbdi text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/25 text-sm hover:opacity-95"
        >
          <UserPlus size={18} />
          <span>Tambah Umat Baru</span>
        </button>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-purple-100 dark:border-indigo-900/60 pb-3">
          <span className="text-xs font-extrabold text-purple-950 dark:text-white flex items-center gap-1.5">
            <Filter size={16} className="text-amber-500" />
            <span>Penyaringan Data Umat Interaktif</span>
          </span>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Ditemukan: <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{filteredProfiles.length}</strong> Umat
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari Nama / Telepon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Filter HAN */}
          <select
            value={selectedHan}
            onChange={(e) => setSelectedHan(e.target.value)}
            className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
          >
            <option value="all">Semua HAN Wilayah</option>
            {hanOptions.map(h => <option key={h} value={h}>{h}</option>)}
          </select>

          {/* Filter Cetya */}
          <select
            value={selectedCetya}
            onChange={(e) => setSelectedCetya(e.target.value)}
            className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
          >
            <option value="all">Semua Cetya</option>
            {cetyaOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Filter Bulan Ultah */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
          >
            <option value="all">Semua Bulan Ultah</option>
            <option value="7">Bulan Ini (Juli)</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-aktif</option>
          </select>
        </div>
      </div>

      {/* Umat Table */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1b4b] border border-purple-100 dark:border-indigo-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-purple-50 dark:bg-indigo-950/60 border-b border-purple-100 dark:border-indigo-900 text-xs font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                <th className="py-4 px-6">Nama Umat & Role</th>
                <th className="py-4 px-6">Kode HAN</th>
                <th className="py-4 px-6">Cetya Bernaung</th>
                <th className="py-4 px-6">Kontak Phone</th>
                <th className="py-4 px-6">Tanggal Lahir</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 dark:divide-indigo-900/60 text-sm">
              {filteredProfiles.map((umat) => (
                <tr key={umat.id} className="hover:bg-purple-50/40 dark:hover:bg-indigo-900/40 transition">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-extrabold flex items-center justify-center text-xs border border-purple-200 dark:border-purple-800">
                      {umat.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-slate-100">{umat.full_name}</p>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        umat.role === 'admin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {umat.role}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded border border-purple-200 dark:border-purple-800">
                      <MapPin size={12} /> {umat.han || '-'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    <span className="flex items-center gap-1">
                      <Building size={14} className="text-amber-500" />
                      {umat.cetya || '-'}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-mono text-xs">
                    {umat.phone || '-'}
                  </td>

                  <td className="py-4 px-6 text-slate-700 dark:text-slate-300 text-xs">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar size={14} className="text-purple-500" />
                      {umat.birth_date ? new Date(umat.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {umat.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                        <CheckCircle size={12} /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        <XCircle size={12} /> Non-aktif
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedUmatDetail(umat)}
                        className="p-1.5 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition"
                        title="Lihat Detail Umat"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(umat.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition"
                        title="Hapus Data Umat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Drawer */}
      {selectedUmatDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1b4b] border border-purple-200 dark:border-indigo-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-purple-100 dark:border-indigo-900 pb-3">
              <h3 className="text-lg font-extrabold text-purple-950 dark:text-white">Detail Profil Umat</h3>
              <button onClick={() => setSelectedUmatDetail(null)} className="text-slate-400 hover:text-slate-600 text-xs">Tutup ✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block font-semibold">Nama Lengkap</span>
                <p className="text-base font-extrabold text-purple-950 dark:text-white">{selectedUmatDetail.full_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-semibold">Wilayah HAN</span>
                  <p className="font-mono font-bold text-purple-700 dark:text-purple-300">{selectedUmatDetail.han}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Cetya Bernaung</span>
                  <p className="font-bold text-amber-600 dark:text-amber-300">{selectedUmatDetail.cetya}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Alamat Lengkap</span>
                <p>{selectedUmatDetail.address || 'Belum diisi'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-semibold">Jenis Kelamin</span>
                  <p className="font-bold">{selectedUmatDetail.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Kontak Darurat</span>
                  <p>{selectedUmatDetail.emergency_contact || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Umat Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1b4b] border border-purple-200 dark:border-indigo-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-indigo-900 pb-3">Input Data Umat Lengkap</h3>
            
            <form onSubmit={handleAddUmat} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Umat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Upasika Tan Sri Wijaya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Wilayah HAN</label>
                  <input
                    type="text"
                    value={han}
                    onChange={(e) => setHan(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cetya Bernaung</label>
                  <select
                    value={cetya}
                    onChange={(e) => setCetya(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="Cetya Avalokitesvara">Cetya Avalokitesvara</option>
                    <option value="Cetya Maitreya">Cetya Maitreya</option>
                    <option value="Cetya Buddha Gaya">Cetya Buddha Gaya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No. HP</label>
                  <input
                    type="text"
                    placeholder="0812..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tgl Lahir</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  placeholder="Jl. Pluit Kencana No..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-indigo-950 border border-purple-100 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-100 dark:border-indigo-900">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md"
                >
                  Simpan Data Umat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
