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
  Eye,
  Plus,
  Compass,
  Home,
  ShieldCheck,
  X
} from 'lucide-react';
import { 
  getProfiles, 
  addProfile, 
  updateProfile, 
  deleteProfile,
  getSentras,
  getCetyas,
  addCetya,
  updateCetya,
  deleteCetya,
  getHans,
  addHan,
  updateHan,
  deleteHan
} from '@/lib/actions/vihara-actions';
import { Profile, CetyaProfile, HanProfile } from '@/types/database';
import ConfirmModal from '@/components/ui/confirm-modal';

export default function UmatDirectoryPage() {
  const [activeMainTab, setActiveMainTab] = useState<'umat' | 'cetya' | 'han'>('umat');

  // Main Datasets
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sentras, setSentras] = useState<string[]>([]);
  const [cetyas, setCetyas] = useState<CetyaProfile[]>([]);
  const [hans, setHans] = useState<HanProfile[]>([]);

  // Search & Filters for Umat
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSentraFilter, setSelectedSentraFilter] = useState('all');
  const [selectedCetyaFilter, setSelectedCetyaFilter] = useState('all');
  const [selectedHanFilter, setSelectedHanFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals for Umat
  const [isAddUmatModalOpen, setIsAddUmatModalOpen] = useState(false);
  const [isEditUmatModalOpen, setIsEditUmatModalOpen] = useState(false);
  const [selectedUmatDetail, setSelectedUmatDetail] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Umat Form State (Sentra -> Cetya -> HAN sequence)
  const [sentra, setSentra] = useState('Sentra Makassar');
  const [cetya, setCetya] = useState('');
  const [han, setHan] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Umat Edit Form State
  const [editSentra, setEditSentra] = useState('');
  const [editCetya, setEditCetya] = useState('');
  const [editHan, setEditHan] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [editRole, setEditRole] = useState<'umat' | 'admin'>('umat');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Modals & State for Cetya Management
  const [isAddCetyaModalOpen, setIsAddCetyaModalOpen] = useState(false);
  const [isEditCetyaModalOpen, setIsEditCetyaModalOpen] = useState(false);
  const [editingCetya, setEditingCetya] = useState<CetyaProfile | null>(null);

  const [cetyaNameInput, setCetyaNameInput] = useState('');
  const [cetyaSentraInput, setCetyaSentraInput] = useState('Sentra Makassar');
  const [cetyaAddressInput, setCetyaAddressInput] = useState('');
  const [cetyaLeaderInput, setCetyaLeaderInput] = useState('');
  const [cetyaPhoneInput, setCetyaPhoneInput] = useState('');

  // Modals & State for HAN Management
  const [isAddHanModalOpen, setIsAddHanModalOpen] = useState(false);
  const [isEditHanModalOpen, setIsEditHanModalOpen] = useState(false);
  const [editingHan, setEditingHan] = useState<HanProfile | null>(null);

  const [hanNameInput, setHanNameInput] = useState('');
  const [hanCetyaInput, setHanCetyaInput] = useState('');
  const [hanSentraInput, setHanSentraInput] = useState('Sentra Makassar');
  const [hanLeaderInput, setHanLeaderInput] = useState('');

  // BEAUTIFUL CONFIRM MODAL STATE
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const loadAllData = async () => {
    const pList = await getProfiles();
    setProfiles(pList);
    const sList = await getSentras();
    setSentras(sList);
    const cList = await getCetyas();
    setCetyas(cList);
    if (cList.length > 0) {
      setCetya(cList[0].name);
      setHanCetyaInput(cList[0].name);
    }
    const hList = await getHans();
    setHans(hList);
    if (hList.length > 0) {
      setHan(hList[0].name);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter Cetya options based on selected Sentra
  const availableCetyasForAdd = cetyas.filter(c => c.sentra === sentra);
  const availableCetyasForEdit = cetyas.filter(c => c.sentra === editSentra);

  // Filter HAN options based on selected Cetya
  const availableHansForAdd = hans.filter(h => h.cetya_name === cetya);
  const availableHansForEdit = hans.filter(h => h.cetya_name === editCetya);

  // Umat Actions
  const handleAddUmat = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProfile({
      role: 'umat',
      full_name: fullName,
      sentra: sentra,
      cetya: cetya,
      han: han,
      phone: phone,
      birth_date: birthDate,
      gender: gender,
      address: address,
      emergency_contact: emergencyContact,
      is_active: true
    });

    setIsAddUmatModalOpen(false);
    setFullName('');
    setPhone('');
    setBirthDate('');
    setAddress('');
    setEmergencyContact('');
    loadAllData();
  };

  const openEditUmatModal = (profile: Profile) => {
    setEditingProfile(profile);
    setEditSentra(profile.sentra || 'Sentra Makassar');
    setEditCetya(profile.cetya || cetyas[0]?.name || '');
    setEditHan(profile.han || hans[0]?.name || '');
    setEditFullName(profile.full_name || '');
    setEditPhone(profile.phone || '');
    setEditBirthDate(profile.birth_date || '');
    setEditGender(profile.gender || 'L');
    setEditAddress(profile.address || '');
    setEditEmergencyContact(profile.emergency_contact || '');
    setEditRole(profile.role || 'umat');
    setEditIsActive(profile.is_active ?? true);
    setIsEditUmatModalOpen(true);
  };

  const handleUpdateUmat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    await updateProfile(editingProfile.id, {
      full_name: editFullName,
      sentra: editSentra,
      cetya: editCetya,
      han: editHan,
      phone: editPhone,
      birth_date: editBirthDate,
      gender: editGender,
      address: editAddress,
      emergency_contact: editEmergencyContact,
      role: editRole,
      is_active: editIsActive
    });

    setIsEditUmatModalOpen(false);
    setEditingProfile(null);
    loadAllData();
  };

  const handleDeleteUmat = (profile: Profile) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Data Umat?',
      message: `Apakah Anda yakin ingin menghapus data umat "${profile.full_name}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        await deleteProfile(profile.id);
        loadAllData();
      }
    });
  };

  // Cetya Actions
  const handleAddCetya = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCetya({
      name: cetyaNameInput,
      sentra: cetyaSentraInput,
      address: cetyaAddressInput,
      leader_name: cetyaLeaderInput,
      phone: cetyaPhoneInput
    });
    setIsAddCetyaModalOpen(false);
    setCetyaNameInput('');
    setCetyaAddressInput('');
    setCetyaLeaderInput('');
    setCetyaPhoneInput('');
    loadAllData();
  };

  const openEditCetyaModal = (cetyaItem: CetyaProfile) => {
    setEditingCetya(cetyaItem);
    setCetyaNameInput(cetyaItem.name);
    setCetyaSentraInput(cetyaItem.sentra);
    setCetyaAddressInput(cetyaItem.address || '');
    setCetyaLeaderInput(cetyaItem.leader_name || '');
    setCetyaPhoneInput(cetyaItem.phone || '');
    setIsEditCetyaModalOpen(true);
  };

  const handleUpdateCetya = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCetya) return;
    await updateCetya(editingCetya.id, {
      name: cetyaNameInput,
      sentra: cetyaSentraInput,
      address: cetyaAddressInput,
      leader_name: cetyaLeaderInput,
      phone: cetyaPhoneInput
    });
    setIsEditCetyaModalOpen(false);
    setEditingCetya(null);
    loadAllData();
  };

  const handleDeleteCetya = (cetyaItem: CetyaProfile) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Master Cetya?',
      message: `Apakah Anda yakin ingin menghapus Cetya "${cetyaItem.name}" dari master data?`,
      onConfirm: async () => {
        await deleteCetya(cetyaItem.id);
        loadAllData();
      }
    });
  };

  // HAN Actions
  const handleAddHan = async (e: React.FormEvent) => {
    e.preventDefault();
    await addHan({
      name: hanNameInput,
      cetya_name: hanCetyaInput,
      sentra: hanSentraInput,
      leader_name: hanLeaderInput
    });
    setIsAddHanModalOpen(false);
    setHanNameInput('');
    setHanLeaderInput('');
    loadAllData();
  };

  const openEditHanModal = (hanItem: HanProfile) => {
    setEditingHan(hanItem);
    setHanNameInput(hanItem.name);
    setHanCetyaInput(hanItem.cetya_name);
    setHanSentraInput(hanItem.sentra);
    setHanLeaderInput(hanItem.leader_name || '');
    setIsEditHanModalOpen(true);
  };

  const handleUpdateHan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHan) return;
    await updateHan(editingHan.id, {
      name: hanNameInput,
      cetya_name: hanCetyaInput,
      sentra: hanSentraInput,
      leader_name: hanLeaderInput
    });
    setIsEditHanModalOpen(false);
    setEditingHan(null);
    loadAllData();
  };

  const handleDeleteHan = (hanItem: HanProfile) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus Master HAN?',
      message: `Apakah Anda yakin ingin menghapus kelompok HAN "${hanItem.name}" dari master data?`,
      onConfirm: async () => {
        await deleteHan(hanItem.id);
        loadAllData();
      }
    });
  };

  // Filter Umat
  const filteredProfiles = profiles.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.han && p.han.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (p.cetya && p.cetya.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (p.phone && p.phone.includes(searchTerm));
    
    const matchSentra = selectedSentraFilter === 'all' || p.sentra === selectedSentraFilter;
    const matchCetya = selectedCetyaFilter === 'all' || p.cetya === selectedCetyaFilter;
    const matchHan = selectedHanFilter === 'all' || p.han === selectedHanFilter;
    const matchStatus = selectedStatus === 'all' || 
                        (selectedStatus === 'active' ? p.is_active : !p.is_active);
    
    let matchMonth = true;
    if (selectedMonth !== 'all' && p.birth_date) {
      const monthNum = parseInt(p.birth_date.split('-')[1], 10);
      matchMonth = monthNum === parseInt(selectedMonth, 10);
    }

    return matchSearch && matchSentra && matchCetya && matchHan && matchStatus && matchMonth;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* BEAUTIFUL REUSABLE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-purple-950 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="text-purple-600 dark:text-purple-400" size={28} />
            <span>Struktur & Direktori Umat MNSBDI</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Hierarki Lokasi: <strong>Sentra ➔ Cetya ➔ HAN</strong> (Pusat Sentra Makassar)</p>
        </div>

        {/* Dynamic Add Button based on Active Tab */}
        {activeMainTab === 'umat' && (
          <button
            onClick={() => setIsAddUmatModalOpen(true)}
            className="inline-flex items-center gap-2 gradient-mnsbdi text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg shadow-purple-500/25 text-sm hover:opacity-95 cursor-pointer"
          >
            <UserPlus size={18} />
            <span>Tambah Umat Baru</span>
          </button>
        )}

        {activeMainTab === 'cetya' && (
          <button
            onClick={() => {
              setCetyaNameInput('');
              setCetyaAddressInput('');
              setCetyaLeaderInput('');
              setCetyaPhoneInput('');
              setIsAddCetyaModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg text-sm cursor-pointer"
          >
            <Building size={18} />
            <span>Tambah Cetya Baru</span>
          </button>
        )}

        {activeMainTab === 'han' && (
          <button
            onClick={() => {
              setHanNameInput('');
              setHanLeaderInput('');
              setIsAddHanModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-lg text-sm cursor-pointer"
          >
            <Home size={18} />
            <span>Tambah HAN Baru</span>
          </button>
        )}
      </div>

      {/* Main Hierarchy Tabs */}
      <div className="flex border-b border-purple-100 dark:border-purple-900/60 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveMainTab('umat')}
          className={`pb-3 px-4 font-black text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeMainTab === 'umat'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Users size={16} />
          <span>Data Umat ({profiles.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('cetya')}
          className={`pb-3 px-4 font-black text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeMainTab === 'cetya'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Building size={16} />
          <span>Kelola & Profil Cetya ({cetyas.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('han')}
          className={`pb-3 px-4 font-black text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeMainTab === 'han'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Home size={16} />
          <span>Kelola & Profil HAN ({hans.length})</span>
        </button>
      </div>

      {/* TAB 1: DATA UMAT */}
      {activeMainTab === 'umat' && (
        <div className="space-y-6">
          {/* Advanced Filter Toolbar */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <span className="text-xs font-extrabold text-purple-950 dark:text-white flex items-center gap-1.5">
                <Filter size={16} className="text-amber-500" />
                <span>Filter Umat berdasarkan Hierarki: Sentra ➔ Cetya ➔ HAN</span>
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Ditemukan: <strong className="text-purple-700 dark:text-purple-300 font-extrabold">{filteredProfiles.length}</strong> Umat
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search Bar */}
              <div className="relative col-span-1 sm:col-span-2">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari Nama / HAN / Cetya / Telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* Filter Sentra */}
              <select
                value={selectedSentraFilter}
                onChange={(e) => setSelectedSentraFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="all">Semua Sentra</option>
                {sentras.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Filter Cetya */}
              <select
                value={selectedCetyaFilter}
                onChange={(e) => setSelectedCetyaFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="all">Semua Cetya</option>
                {cetyas.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              {/* Filter HAN */}
              <select
                value={selectedHanFilter}
                onChange={(e) => setSelectedHanFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="all">Semua HAN</option>
                {hans.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
              </select>

              {/* Filter Bulan Ultah */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
              >
                <option value="all">Semua Ultah</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>
          </div>

          {/* Umat Table */}
          <div className="rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-purple-50 dark:bg-purple-950/60 border-b border-purple-100 dark:border-purple-900/60 text-xs font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                    <th className="py-4 px-6">Nama Umat & Role</th>
                    <th className="py-4 px-6">Sentra Utama</th>
                    <th className="py-4 px-6">Cetya Bernaung</th>
                    <th className="py-4 px-6">Kelompok HAN</th>
                    <th className="py-4 px-6">Tanggal Lahir</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 dark:divide-purple-900/60 text-sm">
                  {filteredProfiles.map((umat) => (
                    <tr key={umat.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/40 transition">
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

                      <td className="py-4 px-6 font-semibold text-xs text-purple-900 dark:text-purple-200">
                        <span className="flex items-center gap-1 font-extrabold">
                          <Compass size={14} className="text-purple-600" />
                          {umat.sentra || 'Sentra Makassar'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        <span className="flex items-center gap-1">
                          <Building size={14} className="text-amber-500" />
                          {umat.cetya || '-'}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded border border-purple-200 dark:border-purple-800">
                          <Home size={12} /> {umat.han || '-'}
                        </span>
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
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEditUmatModal(umat)}
                            className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded-lg transition cursor-pointer"
                            title="Edit Data Umat"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => setSelectedUmatDetail(umat)}
                            className="p-1.5 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition cursor-pointer"
                            title="Lihat Detail Umat"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteUmat(umat)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition cursor-pointer"
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
        </div>
      )}

      {/* TAB 2: KELOLA & PROFIL CETYA */}
      {activeMainTab === 'cetya' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cetyas.map(c => {
            const umatCount = profiles.filter(p => p.cetya === c.name).length;
            const hanCount = hans.filter(h => h.cetya_name === c.name).length;

            return (
              <div key={c.id} className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 relative group">
                <div className="flex justify-between items-start border-b border-purple-100 dark:border-purple-900/60 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                      {c.sentra}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                      <Building className="text-amber-500" size={20} />
                      <span>{c.name}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditCetyaModal(c)}
                      className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg transition cursor-pointer"
                      title="Edit Profile Cetya"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCetya(c)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition cursor-pointer"
                      title="Hapus Cetya"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p>📍 <strong>Alamat:</strong> {c.address || '-'}</p>
                  <p>👤 <strong>Ketua / PJ Cetya:</strong> {c.leader_name || '-'}</p>
                  <p>📞 <strong>Telepon Sekretariat:</strong> {c.phone || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60 text-xs">
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60">
                    <span className="text-[10px] text-slate-400 font-bold block">JUMLAH HAN NAUNGAN</span>
                    <strong className="text-purple-900 dark:text-purple-200 text-base">{hanCount} HAN</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40">
                    <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold block">TOTAL UMAT BERNAUNG</span>
                    <strong className="text-amber-950 dark:text-amber-200 text-base">{umatCount} Umat</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: KELOLA & PROFIL HAN */}
      {activeMainTab === 'han' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hans.map(h => {
            const umatInHan = profiles.filter(p => p.han === h.name).length;

            return (
              <div key={h.id} className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-3">
                <div className="flex justify-between items-start border-b border-purple-100 dark:border-purple-900/60 pb-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 font-mono">
                      {h.sentra}
                    </span>
                    <h4 className="text-base font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                      <Home className="text-purple-600" size={18} />
                      <span>{h.name}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditHanModal(h)}
                      className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-50 rounded transition cursor-pointer"
                      title="Edit HAN"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteHan(h)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Hapus HAN"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p>🏛️ <strong>Cetya Induk:</strong> {h.cetya_name}</p>
                  <p>👤 <strong>Pembina HAN:</strong> {h.leader_name || '-'}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-xs font-bold text-purple-900 dark:text-purple-200 flex justify-between items-center">
                  <span>Anggota Umat:</span>
                  <span className="text-sm font-black">{umatInHan} Umat</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL EDIT UMAT (Sentra -> Cetya -> HAN Sequence) */}
      {isEditUmatModalOpen && editingProfile && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <h3 className="text-lg font-extrabold text-purple-950 dark:text-white flex items-center gap-2">
                <Edit2 size={18} className="text-amber-500" />
                <span>Edit Data Umat ({editingProfile.full_name})</span>
              </h3>
              <button onClick={() => setIsEditUmatModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">Tutup ✕</button>
            </div>
            
            <form onSubmit={handleUpdateUmat} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Umat</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* HIERARKI URUTAN LOKASI: SENTRA -> CETYA -> HAN */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">1. Sentra Utama</label>
                  <select
                    value={editSentra}
                    onChange={(e) => setEditSentra(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2.5 py-2 text-xs font-extrabold text-purple-950 dark:text-purple-200 focus:outline-none focus:border-purple-600"
                  >
                    {sentras.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">2. Cetya</label>
                  <select
                    value={editCetya}
                    onChange={(e) => setEditCetya(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2.5 py-2 text-xs font-extrabold text-amber-700 dark:text-amber-300 focus:outline-none focus:border-purple-600"
                  >
                    {availableCetyasForEdit.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">3. Kelompok HAN</label>
                  <select
                    value={editHan}
                    onChange={(e) => setEditHan(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    {availableHansForEdit.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">No. HP</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tgl Lahir</label>
                  <input
                    type="date"
                    required
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e: any) => setEditGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
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
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Pengguna</label>
                  <select
                    value={editRole}
                    onChange={(e: any) => setEditRole(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="umat">Umat Biasa</option>
                    <option value="admin">Administrator (Pengurus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Keaktifan</label>
                  <select
                    value={editIsActive ? 'true' : 'false'}
                    onChange={(e) => setEditIsActive(e.target.value === 'true')}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="true">Aktif</option>
                    <option value="false">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-100 dark:border-purple-900/60">
                <button
                  type="button"
                  onClick={() => setIsEditUmatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD UMAT (Sentra -> Cetya -> HAN Sequence) */}
      {isAddUmatModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">Input Data Umat Baru</h3>
            
            <form onSubmit={handleAddUmat} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Umat</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Upasika Tan Sri Wijaya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              {/* HIERARKI URUTAN LOKASI: SENTRA -> CETYA -> HAN */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">1. Sentra Utama</label>
                  <select
                    value={sentra}
                    onChange={(e) => setSentra(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2.5 py-2 text-xs font-extrabold text-purple-950 dark:text-purple-200 focus:outline-none focus:border-purple-600"
                  >
                    {sentras.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">2. Cetya</label>
                  <select
                    value={cetya}
                    onChange={(e) => setCetya(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2.5 py-2 text-xs font-extrabold text-amber-700 dark:text-amber-300 focus:outline-none focus:border-purple-600"
                  >
                    {availableCetyasForAdd.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">3. Kelompok HAN</label>
                  <select
                    value={han}
                    onChange={(e) => setHan(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  >
                    {availableHansForAdd.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
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
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tgl Lahir</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
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
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-purple-100 dark:border-purple-900/60">
                <button
                  type="button"
                  onClick={() => setIsAddUmatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Simpan Data Umat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD CETYA */}
      {isAddCetyaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">Tambah Cetya Baru</h3>
            <form onSubmit={handleAddCetya} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Cetya</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cetya Avalokitesvara Makassar"
                  value={cetyaNameInput}
                  onChange={(e) => setCetyaNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sentra Utama Naungan</label>
                <select
                  value={cetyaSentraInput}
                  onChange={(e) => setCetyaSentraInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  {sentras.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ketua / Penanggung Jawab Cetya</label>
                <input
                  type="text"
                  placeholder="Nama Penanggung Jawab"
                  value={cetyaLeaderInput}
                  onChange={(e) => setCetyaLeaderInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Cetya</label>
                <input
                  type="text"
                  placeholder="Jl. Sulawesi No. 88, Makassar"
                  value={cetyaAddressInput}
                  onChange={(e) => setCetyaAddressInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">No. HP Sekretariat Cetya</label>
                <input
                  type="text"
                  placeholder="0411-876543"
                  value={cetyaPhoneInput}
                  onChange={(e) => setCetyaPhoneInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsAddCetyaModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Cetya</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT CETYA */}
      {isEditCetyaModalOpen && editingCetya && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">Edit Profile Cetya ({editingCetya.name})</h3>
            <form onSubmit={handleUpdateCetya} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Cetya</label>
                <input
                  type="text"
                  required
                  value={cetyaNameInput}
                  onChange={(e) => setCetyaNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sentra Utama Naungan</label>
                <select
                  value={cetyaSentraInput}
                  onChange={(e) => setCetyaSentraInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  {sentras.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ketua / Penanggung Jawab Cetya</label>
                <input
                  type="text"
                  value={cetyaLeaderInput}
                  onChange={(e) => setCetyaLeaderInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Cetya</label>
                <input
                  type="text"
                  value={cetyaAddressInput}
                  onChange={(e) => setCetyaAddressInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsEditCetyaModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD HAN */}
      {isAddHanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">Tambah HAN Baru</h3>
            <form onSubmit={handleAddHan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode / Nama HAN</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: HAN Makassar 01"
                  value={hanNameInput}
                  onChange={(e) => setHanNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cetya Induk Naungan</label>
                <select
                  value={hanCetyaInput}
                  onChange={(e) => setHanCetyaInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  {cetyas.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pembina / PJ HAN</label>
                <input
                  type="text"
                  placeholder="Nama Pembina HAN"
                  value={hanLeaderInput}
                  onChange={(e) => setHanLeaderInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsAddHanModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan HAN</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT HAN */}
      {isEditHanModalOpen && editingHan && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-purple-950 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">Edit Profile HAN ({editingHan.name})</h3>
            <form onSubmit={handleUpdateHan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode / Nama HAN</label>
                <input
                  type="text"
                  required
                  value={hanNameInput}
                  onChange={(e) => setHanNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cetya Induk Naungan</label>
                <select
                  value={hanCetyaInput}
                  onChange={(e) => setHanCetyaInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  {cetyas.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pembina / PJ HAN</label>
                <input
                  type="text"
                  value={hanLeaderInput}
                  onChange={(e) => setHanLeaderInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsEditHanModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL UMAT DETAIL DRAWER */}
      {selectedUmatDetail && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <h3 className="text-lg font-extrabold text-purple-950 dark:text-white">Detail Profil Umat</h3>
              <button onClick={() => setSelectedUmatDetail(null)} className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block font-semibold">Nama Lengkap</span>
                <p className="text-base font-extrabold text-purple-950 dark:text-white">{selectedUmatDetail.full_name}</p>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 space-y-1 border border-purple-100 dark:border-purple-900">
                <span className="text-[10px] text-purple-900 dark:text-purple-300 font-extrabold uppercase">HIERARKI LOKASI MNSBDI</span>
                <p className="font-extrabold text-purple-950 dark:text-white text-xs">
                  {selectedUmatDetail.sentra || 'Sentra Makassar'} ➔ {selectedUmatDetail.cetya} ➔ {selectedUmatDetail.han}
                </p>
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

              <div className="pt-3 border-t border-purple-100 dark:border-purple-900/60 flex justify-end">
                <button
                  onClick={() => {
                    const target = selectedUmatDetail;
                    setSelectedUmatDetail(null);
                    openEditUmatModal(target);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Edit2 size={14} />
                  <span>Edit Data Umat Ini</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
