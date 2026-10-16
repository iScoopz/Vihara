'use client'

import { useState, useEffect, useMemo } from 'react';
import { UserPlus, Search, Trash2, Edit2, Eye, Plus, SlidersHorizontal } from 'lucide-react';
import { 
  getUmatPageBundle,
  addProfile, 
  updateProfile, 
  deleteProfile,
  addCetya,
  updateCetya,
  deleteCetya,
  addHan,
  updateHan,
  deleteHan
} from '@/lib/actions/vihara-actions';
import { Profile, CetyaProfile, HanProfile, UmatBagian } from '@/types/database';
import ConfirmModal from '@/components/ui/confirm-modal';
import { BAGIAN_OPTIONS, NO_CETYA, UNAFFILIATED_CETYA_OPTIONS } from '@/lib/umat-options';
import { Badge, Button, Fab, Field, IconButton, Modal, ModalActions, PageHeader, Panel, RowActions, StateMessage, inputClass, selectClass } from '@/components/ui/kit';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Header cells stick while a long list scrolls (desktop only; phones get cards).
const th = 'sticky top-0 z-10 bg-surface-2 py-2.5 px-4 text-xs font-medium text-ink-3 whitespace-nowrap';
const pageLayoutPad = 'pb-20 md:pb-0';
const td = 'py-2.5 px-4 text-ink-2';

function Empty() {
  return <span className="text-ink-3">-</span>;
}

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
  const [selectedBagianFilter, setSelectedBagianFilter] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Modals for Umat
  const [isAddUmatModalOpen, setIsAddUmatModalOpen] = useState(false);
  const [isEditUmatModalOpen, setIsEditUmatModalOpen] = useState(false);
  const [selectedUmatDetail, setSelectedUmatDetail] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Umat Form State (Sentra -> Cetya -> HAN sequence)
  const [role, setRole] = useState<'umat' | 'admin'>('umat');
  const [email, setEmail] = useState('');
  const [sentra, setSentra] = useState('Sentra Makassar');
  const [cetya, setCetya] = useState('');
  const [han, setHan] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [bagian, setBagian] = useState<UmatBagian | ''>('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Umat Edit Form State
  const [editRole, setEditRole] = useState<'umat' | 'admin'>('umat');
  const [editEmail, setEditEmail] = useState('');
  const [editSentra, setEditSentra] = useState('');
  const [editCetya, setEditCetya] = useState('');
  const [editHan, setEditHan] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editBagian, setEditBagian] = useState<UmatBagian | ''>('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
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

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

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
    try {
      const bundle = await getUmatPageBundle();
      setProfiles(bundle.profiles);
      setSentras(bundle.sentras);
      setCetyas(bundle.cetyas);
      if (bundle.cetyas.length > 0) {
        setHanCetyaInput(prev => prev || bundle.cetyas[0].name);
      }
      setHans(bundle.hans);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  };

  const retryLoad = () => {
    setLoadState('loading');
    loadAllData();
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const counts = useMemo(() => {
    const umatByCetya = new Map<string, number>();
    const umatByHan = new Map<string, number>();
    const hanByCetya = new Map<string, number>();
    for (const p of profiles) {
      if (p.cetya) umatByCetya.set(p.cetya, (umatByCetya.get(p.cetya) || 0) + 1);
      if (p.han) umatByHan.set(p.han, (umatByHan.get(p.han) || 0) + 1);
    }
    for (const h of hans) {
      hanByCetya.set(h.cetya_name, (hanByCetya.get(h.cetya_name) || 0) + 1);
    }
    return { umatByCetya, umatByHan, hanByCetya };
  }, [profiles, hans]);

  // Filter Cetya options based on selected Sentra
  const availableCetyasForAdd = cetyas.filter(c => c.sentra === sentra);
  const availableCetyasForEdit = cetyas.filter(c => c.sentra === editSentra);

  // Filter HAN options based on selected Cetya
  const availableHansForAdd = hans.filter(h => h.cetya_name === cetya);
  const availableHansForEdit = hans.filter(h => h.cetya_name === editCetya);
  // Members of one HAN can come from several Cetya, so the rest stay selectable.
  const otherHansForAdd = hans.filter(h => h.cetya_name !== cetya);
  const otherHansForEdit = hans.filter(h => h.cetya_name !== editCetya && h.name !== editHan);

  // Sentra -> Cetya -> HAN cascade: picking a parent resets the children to a valid choice.
  const firstCetyaFor = (sentraName: string) =>
    cetyas.find(c => c.sentra === sentraName)?.name || NO_CETYA;
  const firstHanFor = (cetyaName: string) =>
    hans.find(h => h.cetya_name === cetyaName)?.name || '';

  const changeAddSentra = (value: string) => {
    const nextCetya = firstCetyaFor(value);
    setSentra(value);
    setCetya(nextCetya);
    setHan(firstHanFor(nextCetya));
  };
  const changeAddCetya = (value: string) => {
    setCetya(value);
    setHan(firstHanFor(value));
  };
  const changeEditSentra = (value: string) => {
    const nextCetya = firstCetyaFor(value);
    setEditSentra(value);
    setEditCetya(nextCetya);
    setEditHan(firstHanFor(nextCetya));
  };
  const changeEditCetya = (value: string) => {
    setEditCetya(value);
    setEditHan(firstHanFor(value));
  };

  const openAddUmatModal = () => {
    changeAddSentra(sentra || 'Sentra Makassar');
    setIsAddUmatModalOpen(true);
  };

  // Umat Actions
  const handleAddUmat = async (e: React.FormEvent) => {
    e.preventDefault();

    const tempId = `p_${Date.now()}`;
    const newProfile: Profile = {
      id: tempId,
      role: role,
      full_name: fullName,
      email: email.trim() || undefined,
      sentra: sentra,
      cetya: cetya,
      han: han,
      phone: phone,
      bagian: bagian || undefined,
      birth_date: birthDate,
      gender: gender,
      address: address,
      emergency_contact: emergencyContact,
      is_active: true,
      created_at: new Date().toISOString()
    };

    // Show the row right away; the temp id is swapped for the real one when the server answers.
    setProfiles(prev => [newProfile, ...prev]);

    setIsAddUmatModalOpen(false);
    setRole('umat');
    setEmail('');
    setFullName('');
    setPhone('');
    setBagian('');
    setBirthDate('');
    setAddress('');
    setEmergencyContact('');

    const res = await addProfile({
      role: role,
      full_name: fullName,
      email: email.trim() || undefined,
      sentra: sentra,
      cetya: cetya,
      han: han,
      phone: phone,
      bagian: bagian || undefined,
      birth_date: birthDate,
      gender: gender,
      address: address,
      emergency_contact: emergencyContact,
      is_active: true
    });

    if (res.profile) {
      setProfiles(prev => prev.map(p => p.id === tempId ? res.profile : p));
    }
  };

  const openEditUmatModal = (profile: Profile) => {
    setEditingProfile(profile);
    setEditSentra(profile.sentra || 'Sentra Makassar');
    setEditCetya(profile.cetya || NO_CETYA);
    setEditHan(profile.han || '');
    setEditFullName(profile.full_name || '');
    setEditEmail(profile.email || '');
    setEditPhone(profile.phone || '');
    setEditBirthDate(profile.birth_date || '');
    setEditGender(profile.gender || 'L');
    setEditBagian(profile.bagian || '');
    setEditAddress(profile.address || '');
    setEditEmergencyContact(profile.emergency_contact || '');
    setEditRole(profile.role || 'umat');
    setEditIsActive(profile.is_active ?? true);
    setIsEditUmatModalOpen(true);
  };

  const handleUpdateUmat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;

    const targetId = editingProfile.id;
    const updateData: Partial<Profile> = {
      role: editRole,
      full_name: editFullName,
      email: editEmail.trim() || undefined,
      sentra: editSentra,
      cetya: editCetya,
      han: editHan,
      phone: editPhone,
      bagian: editBagian || undefined,
      birth_date: editBirthDate,
      gender: editGender,
      address: editAddress,
      emergency_contact: editEmergencyContact,
      is_active: editIsActive
    };

    setProfiles(prev => prev.map(p => p.id === targetId ? { ...p, ...updateData } : p));

    setIsEditUmatModalOpen(false);
    setEditingProfile(null);

    await updateProfile(targetId, updateData);
  };

  const handleDeleteUmat = (profile: Profile) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus data umat?',
      message: `Data umat "${profile.full_name}" akan dihapus dan tidak bisa dikembalikan.`,
      onConfirm: async () => {
        setProfiles(prev => prev.filter(p => p.id !== profile.id));
        await deleteProfile(profile.id);
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
      title: 'Hapus Cetya?',
      message: `Cetya "${cetyaItem.name}" akan dihapus dari daftar Cetya.`,
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
      // A HAN sits in the Sentra of its parent Cetya.
      sentra: cetyas.find(c => c.name === hanCetyaInput)?.sentra || hanSentraInput,
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
      // A HAN sits in the Sentra of its parent Cetya.
      sentra: cetyas.find(c => c.name === hanCetyaInput)?.sentra || hanSentraInput,
      leader_name: hanLeaderInput
    });
    setIsEditHanModalOpen(false);
    setEditingHan(null);
    loadAllData();
  };

  const handleDeleteHan = (hanItem: HanProfile) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Hapus HAN?',
      message: `HAN "${hanItem.name}" akan dihapus dari daftar HAN.`,
      onConfirm: async () => {
        await deleteHan(hanItem.id);
        loadAllData();
      }
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSentraFilter, selectedCetyaFilter, selectedHanFilter, selectedBagianFilter, selectedStatus, selectedMonth]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchSearch = !searchTerm ||
                          p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.han && p.han.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.cetya && p.cetya.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.phone && p.phone.includes(searchTerm));
      
      const matchSentra = selectedSentraFilter === 'all' || p.sentra === selectedSentraFilter;
      const matchCetya = selectedCetyaFilter === 'all' || p.cetya === selectedCetyaFilter;
      const matchHan = selectedHanFilter === 'all' || p.han === selectedHanFilter;
      const matchBagian = selectedBagianFilter === 'all' || p.bagian === selectedBagianFilter;
      const matchStatus = selectedStatus === 'all' || 
                          (selectedStatus === 'active' ? p.is_active : !p.is_active);
      
      let matchMonth = true;
      if (selectedMonth !== 'all' && p.birth_date) {
        const parts = p.birth_date.split('-');
        if (parts[1]) {
          matchMonth = parseInt(parts[1], 10) === parseInt(selectedMonth, 10);
        }
      }

      return matchSearch && matchSentra && matchCetya && matchHan && matchBagian && matchStatus && matchMonth;
    });
  }, [profiles, searchTerm, selectedSentraFilter, selectedCetyaFilter, selectedHanFilter, selectedBagianFilter, selectedStatus, selectedMonth]);

  const totalPages = Math.ceil(filteredProfiles.length / pageSize) || 1;
  const paginatedProfiles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProfiles.slice(start, start + pageSize);
  }, [filteredProfiles, currentPage, pageSize]);

  const hasFilter =
    searchTerm.trim() !== '' ||
    selectedSentraFilter !== 'all' ||
    selectedCetyaFilter !== 'all' ||
    selectedHanFilter !== 'all' ||
    selectedBagianFilter !== 'all' ||
    selectedStatus !== 'all' ||
    selectedMonth !== 'all';

  const activeFilterCount = [selectedSentraFilter, selectedCetyaFilter, selectedHanFilter, selectedBagianFilter, selectedStatus, selectedMonth]
    .filter(v => v !== 'all').length;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSentraFilter('all');
    setSelectedCetyaFilter('all');
    setSelectedHanFilter('all');
    setSelectedBagianFilter('all');
    setSelectedStatus('all');
    setSelectedMonth('all');
  };

  const openAddCetyaModal = () => {
    setCetyaNameInput('');
    setCetyaAddressInput('');
    setCetyaLeaderInput('');
    setCetyaPhoneInput('');
    setIsAddCetyaModalOpen(true);
  };

  const openAddHanModal = () => {
    setHanNameInput('');
    setHanLeaderInput('');
    setIsAddHanModalOpen(true);
  };

  const tabs = [
    { id: 'umat', label: 'Umat', count: profiles.length },
    { id: 'cetya', label: 'Cetya', count: cetyas.length },
    { id: 'han', label: 'HAN', count: hans.length }
  ] as const;

  // md+ shows the add action in the header; phones get the Fab instead.
  const headerAction =
    activeMainTab === 'umat' ? (
      <Button variant="primary" className="max-md:hidden" onClick={openAddUmatModal}>
        <UserPlus size={16} aria-hidden />
        Tambah umat
      </Button>
    ) : activeMainTab === 'cetya' ? (
      <Button variant="primary" className="max-md:hidden" onClick={openAddCetyaModal}>
        <Plus size={16} aria-hidden />
        Tambah Cetya
      </Button>
    ) : (
      <Button variant="primary" className="max-md:hidden" onClick={openAddHanModal}>
        <Plus size={16} aria-hidden />
        Tambah HAN
      </Button>
    );

  const fab =
    activeMainTab === 'umat' ? (
      <Fab label="Tambah umat" icon={<UserPlus size={18} />} onClick={openAddUmatModal} />
    ) : activeMainTab === 'cetya' ? (
      <Fab label="Tambah Cetya" icon={<Plus size={18} />} onClick={openAddCetyaModal} />
    ) : (
      <Fab label="Tambah HAN" icon={<Plus size={18} />} onClick={openAddHanModal} />
    );

  const cetyaFormFields = (
    <div className="space-y-3">
      <Field label="Nama Cetya">
        <input
          type="text"
          required
          placeholder="Contoh: Cetya Avalokitesvara Makassar"
          value={cetyaNameInput}
          onChange={(e) => setCetyaNameInput(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Sentra">
        <select value={cetyaSentraInput} onChange={(e) => setCetyaSentraInput(e.target.value)} className={selectClass}>
          {sentras.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Ketua / penanggung jawab">
        <input type="text" value={cetyaLeaderInput} onChange={(e) => setCetyaLeaderInput(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Alamat">
        <input type="text" value={cetyaAddressInput} onChange={(e) => setCetyaAddressInput(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Telepon sekretariat">
        <input type="tel" value={cetyaPhoneInput} onChange={(e) => setCetyaPhoneInput(e.target.value)} className={inputClass} />
      </Field>
    </div>
  );

  const hanFormFields = (
    <div className="space-y-3">
      <Field label="Nama HAN">
        <input
          type="text"
          required
          placeholder="Contoh: HAN Makassar 01"
          value={hanNameInput}
          onChange={(e) => setHanNameInput(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Cetya induk">
        <select value={hanCetyaInput} onChange={(e) => setHanCetyaInput(e.target.value)} className={selectClass}>
          {cetyas.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </Field>
      <Field label="Pembina">
        <input type="text" value={hanLeaderInput} onChange={(e) => setHanLeaderInput(e.target.value)} className={inputClass} />
      </Field>
    </div>
  );

  const bagianOptions = BAGIAN_OPTIONS.map(b => <option key={b} value={b}>{b}</option>);

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-w-0">
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <PageHeader
        title="Data Umat"
        description="Umat dikelompokkan per Sentra, Cetya, lalu HAN."
        actions={loadState === 'ready' ? headerAction : undefined}
      />

      {loadState === 'loading' && (
        <Panel>
          <StateMessage kind="loading" title="Memuat data umat..." />
        </Panel>
      )}

      {loadState === 'error' && (
        <Panel>
          <StateMessage
            kind="error"
            title="Data umat gagal dimuat."
            description="Periksa koneksi internet, lalu coba lagi."
            action={<Button size="sm" onClick={retryLoad}>Coba lagi</Button>}
          />
        </Panel>
      )}

      {loadState === 'ready' && (
        <>
          <div role="tablist" aria-label="Jenis data" className="flex gap-1 border-b border-line relative overflow-x-auto overflow-y-hidden">
            {tabs.map(t => {
              const selected = activeMainTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setActiveMainTab(t.id)}
                  className={`min-h-[44px] px-3 -mb-px border-b-2 text-sm font-medium whitespace-nowrap cursor-pointer ${
                    selected ? 'border-brand text-ink' : 'border-transparent text-ink-2 hover:text-ink'
                  }`}
                >
                  {t.label} <span className="text-ink-3 tabular-nums">{t.count}</span>
                </button>
              );
            })}
          </div>

          {fab}

          {activeMainTab === 'umat' && (
            <div role="tabpanel" id="panel-umat" aria-labelledby="tab-umat" className={`space-y-4 ${pageLayoutPad}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="flex gap-2 sm:col-span-2">
                  <label className="relative flex-1 min-w-0">
                    <span className="sr-only">Cari umat</span>
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
                    <input
                      type="search"
                      placeholder="Cari nama, HAN, Cetya, atau telepon"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${inputClass} pl-9`}
                    />
                  </label>
                  <Button
                    className="md:hidden shrink-0"
                    aria-expanded={filtersOpen}
                    aria-controls="umat-filter-panel"
                    onClick={() => setFiltersOpen(open => !open)}
                  >
                    <SlidersHorizontal size={16} aria-hidden />
                    {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
                  </Button>
                </div>

                <div
                  id="umat-filter-panel"
                  className={`${filtersOpen ? 'grid' : 'hidden'} grid-cols-1 sm:grid-cols-2 gap-2 sm:col-span-2 md:contents`}
                >
                  <select aria-label="Filter Sentra" value={selectedSentraFilter} onChange={(e) => setSelectedSentraFilter(e.target.value)} className={selectClass}>
                    <option value="all">Semua Sentra</option>
                    {sentras.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <select aria-label="Filter Cetya" value={selectedCetyaFilter} onChange={(e) => setSelectedCetyaFilter(e.target.value)} className={selectClass}>
                    <option value="all">Semua Cetya</option>
                    {cetyas.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    {UNAFFILIATED_CETYA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>

                  <select aria-label="Filter HAN" value={selectedHanFilter} onChange={(e) => setSelectedHanFilter(e.target.value)} className={selectClass}>
                    <option value="all">Semua HAN</option>
                    {hans.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>

                  <select aria-label="Filter Bagian" value={selectedBagianFilter} onChange={(e) => setSelectedBagianFilter(e.target.value)} className={selectClass}>
                    <option value="all">Semua Bagian</option>
                    {bagianOptions}
                  </select>

                  <select aria-label="Filter bulan lahir" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={selectClass}>
                    <option value="all">Semua bulan lahir</option>
                    {MONTHS.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
                  </select>

                  <select aria-label="Filter status" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className={selectClass}>
                    <option value="all">Aktif dan non-aktif</option>
                    <option value="active">Hanya aktif</option>
                    <option value="inactive">Hanya non-aktif</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-ink-2">
                  <span className="tabular-nums">{filteredProfiles.length}</span> umat
                </p>
                {hasFilter && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset filter
                  </Button>
                )}
              </div>

              {filteredProfiles.length === 0 ? (
                <Panel>
                  {profiles.length === 0 ? (
                    <StateMessage
                      kind="empty"
                      title="Belum ada data umat."
                      action={
                        <Button variant="primary" size="sm" onClick={openAddUmatModal}>
                          Tambah umat
                        </Button>
                      }
                    />
                  ) : (
                    <StateMessage
                      kind="empty"
                      title="Tidak ada umat yang cocok dengan filter ini."
                      action={hasFilter ? <Button size="sm" onClick={resetFilters}>Reset filter</Button> : undefined}
                    />
                  )}
                </Panel>
              ) : (
                <Panel className="overflow-hidden xl:overflow-visible">
                  <table className="hidden xl:table w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-2">
                        <th scope="col" className={`${th} rounded-tl-xl`}>Nama</th>
                        <th scope="col" className={`${th} hidden 2xl:table-cell`}>Sentra</th>
                        <th scope="col" className={th}>Cetya</th>
                        <th scope="col" className={th}>HAN</th>
                        <th scope="col" className={th}>Bagian</th>
                        <th scope="col" className={`${th} hidden 2xl:table-cell`}>Tgl lahir</th>
                        <th scope="col" className={th}>Status</th>
                        <th scope="col" className={`${th} rounded-tr-xl`}><span className="sr-only">Aksi</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {paginatedProfiles.map((umat) => (
                        <tr key={umat.id} onClick={() => setSelectedUmatDetail(umat)} className="hover:bg-surface-2 cursor-pointer">
                          <td className="py-2.5 px-4 font-medium text-ink min-w-[12rem]">
                            {umat.full_name}
                            {umat.role === 'admin' && <Badge tone="brand" className="ml-2 align-middle">Pengurus</Badge>}
                          </td>
                          <td className={`${td} whitespace-nowrap hidden 2xl:table-cell`}>{umat.sentra || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap`}>{umat.cetya || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap`}>{umat.han || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap`}>{umat.bagian || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap tabular-nums hidden 2xl:table-cell`}>
                            {umat.birth_date
                              ? new Date(umat.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              : <Empty />}
                          </td>
                          <td className="py-2.5 px-4">
                            {umat.is_active ? <Badge tone="ok">Aktif</Badge> : <Badge>Non-aktif</Badge>}
                          </td>
                          <td className="py-1 px-2">
                            <div className="flex items-center justify-end gap-0.5">
                              <IconButton label={`Lihat detail ${umat.full_name}`} onClick={(e) => { e.stopPropagation(); setSelectedUmatDetail(umat); }}>
                                <Eye size={16} aria-hidden />
                              </IconButton>
                              <IconButton label={`Ubah data ${umat.full_name}`} onClick={(e) => { e.stopPropagation(); openEditUmatModal(umat); }}>
                                <Edit2 size={16} aria-hidden />
                              </IconButton>
                              <IconButton tone="danger" label={`Hapus ${umat.full_name}`} onClick={(e) => { e.stopPropagation(); handleDeleteUmat(umat); }}>
                                <Trash2 size={16} aria-hidden />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ul className="xl:hidden divide-y divide-line">
                    {paginatedProfiles.map((umat) => (
                      <li key={umat.id} className="p-3.5">
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedUmatDetail(umat)}
                            aria-label={`Lihat detail ${umat.full_name}`}
                            className="min-w-0 flex-1 -m-1 p-1 rounded-lg text-left cursor-pointer hover:bg-surface-2"
                          >
                            <span className="flex flex-wrap items-center gap-1.5">
                              <span className="text-sm font-medium text-ink break-words">{umat.full_name}</span>
                              {umat.role === 'admin' && <Badge tone="brand">Pengurus</Badge>}
                              {!umat.is_active && <Badge>Non-aktif</Badge>}
                            </span>
                            <span className="mt-1 block text-xs text-ink-2 break-words">
                              {umat.han || '-'} · {umat.cetya || '-'}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-3 break-words">
                              {umat.sentra || '-'} · {umat.bagian || '-'}
                            </span>
                          </button>
                          <RowActions
                            title={umat.full_name}
                            actions={[
                              { label: 'Lihat detail', icon: <Eye size={16} />, onSelect: () => setSelectedUmatDetail(umat) },
                              { label: 'Edit data', icon: <Edit2 size={16} />, onSelect: () => openEditUmatModal(umat) },
                              { label: 'Hapus umat', icon: <Trash2 size={16} />, tone: 'danger', onSelect: () => handleDeleteUmat(umat) }
                            ]}
                          />
                        </div>
                        <Button size="sm" className="mt-3 w-full h-11" onClick={() => openEditUmatModal(umat)}>
                          <Edit2 size={14} aria-hidden />
                          Edit
                        </Button>
                      </li>
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <div className="p-3 border-t border-line flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-ink-2">
                      <span className="tabular-nums">
                        {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredProfiles.length)} dari {filteredProfiles.length} umat
                        <span className="xl:hidden">, halaman {currentPage} dari {totalPages}</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto md:items-center">
                        <Button
                          className="h-11 md:h-auto"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        >
                          Sebelumnya
                        </Button>
                        <span className="hidden xl:inline px-1 tabular-nums whitespace-nowrap">
                          Halaman {currentPage} dari {totalPages}
                        </span>
                        <Button
                          className="h-11 md:h-auto"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        >
                          Berikutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </Panel>
              )}
            </div>
          )}

          {activeMainTab === 'cetya' && (
            <div role="tabpanel" id="panel-cetya" aria-labelledby="tab-cetya" className={pageLayoutPad}>
              {cetyas.length === 0 ? (
                <Panel>
                  <StateMessage
                    kind="empty"
                    title="Belum ada Cetya."
                    action={<Button variant="primary" size="sm" onClick={openAddCetyaModal}>Tambah Cetya</Button>}
                  />
                </Panel>
              ) : (
                <Panel className="overflow-hidden xl:overflow-visible">
                  <table className="hidden xl:table w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-2">
                        <th scope="col" className={`${th} rounded-tl-xl`}>Nama</th>
                        <th scope="col" className={th}>Sentra</th>
                        <th scope="col" className={th}>Ketua / PJ</th>
                        <th scope="col" className={`${th} hidden 2xl:table-cell`}>Telepon</th>
                        <th scope="col" className={`${th} hidden 2xl:table-cell`}>Alamat</th>
                        <th scope="col" className={`${th} text-right`}>Jumlah HAN</th>
                        <th scope="col" className={`${th} text-right`}>Jumlah umat</th>
                        <th scope="col" className={`${th} rounded-tr-xl`}><span className="sr-only">Aksi</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {cetyas.map(c => (
                        <tr key={c.id} className="hover:bg-surface-2">
                          <td className="py-2.5 px-4 font-medium text-ink min-w-[12rem]">{c.name}</td>
                          <td className={`${td} whitespace-nowrap`}>{c.sentra || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap`}>{c.leader_name || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap tabular-nums hidden 2xl:table-cell`}>{c.phone || <Empty />}</td>
                          <td className={`${td} min-w-[14rem] hidden 2xl:table-cell`}>{c.address || <Empty />}</td>
                          <td className={`${td} text-right tabular-nums`}>{counts.hanByCetya.get(c.name) || 0}</td>
                          <td className={`${td} text-right tabular-nums`}>{counts.umatByCetya.get(c.name) || 0}</td>
                          <td className="py-1 px-2">
                            <div className="flex items-center justify-end gap-0.5">
                              <IconButton label={`Ubah ${c.name}`} onClick={() => openEditCetyaModal(c)}>
                                <Edit2 size={16} aria-hidden />
                              </IconButton>
                              <IconButton tone="danger" label={`Hapus ${c.name}`} onClick={() => handleDeleteCetya(c)}>
                                <Trash2 size={16} aria-hidden />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ul className="xl:hidden divide-y divide-line">
                    {cetyas.map(c => (
                      <li key={c.id} className="p-3.5">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink break-words">{c.name}</p>
                            <p className="mt-1 text-xs text-ink-2 break-words">
                              {c.sentra || '-'} · Ketua {c.leader_name || '-'}
                            </p>
                            {c.phone && <p className="mt-0.5 text-xs text-ink-3 tabular-nums">{c.phone}</p>}
                            <p className="mt-0.5 text-xs text-ink-3 tabular-nums">
                              {counts.hanByCetya.get(c.name) || 0} HAN · {counts.umatByCetya.get(c.name) || 0} umat
                            </p>
                          </div>
                          <RowActions
                            title={c.name}
                            actions={[
                              { label: 'Hapus Cetya', icon: <Trash2 size={16} />, tone: 'danger', onSelect: () => handleDeleteCetya(c) }
                            ]}
                          />
                        </div>
                        <Button size="sm" className="mt-3 w-full h-11" onClick={() => openEditCetyaModal(c)}>
                          <Edit2 size={14} aria-hidden />
                          Edit
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </div>
          )}

          {activeMainTab === 'han' && (
            <div role="tabpanel" id="panel-han" aria-labelledby="tab-han" className={pageLayoutPad}>
              {hans.length === 0 ? (
                <Panel>
                  <StateMessage
                    kind="empty"
                    title="Belum ada HAN."
                    action={<Button variant="primary" size="sm" onClick={openAddHanModal}>Tambah HAN</Button>}
                  />
                </Panel>
              ) : (
                <Panel className="overflow-hidden xl:overflow-visible">
                  <table className="hidden xl:table w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-2">
                        <th scope="col" className={`${th} rounded-tl-xl`}>Nama</th>
                        <th scope="col" className={th}>Cetya induk</th>
                        <th scope="col" className={th}>Sentra</th>
                        <th scope="col" className={th}>Pembina</th>
                        <th scope="col" className={`${th} text-right`}>Jumlah umat</th>
                        <th scope="col" className={`${th} rounded-tr-xl`}><span className="sr-only">Aksi</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {hans.map(h => (
                        <tr key={h.id} className="hover:bg-surface-2">
                          <td className="py-2.5 px-4 font-medium text-ink whitespace-nowrap">{h.name}</td>
                          <td className={`${td} whitespace-nowrap`}>{h.cetya_name || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap`}>{h.sentra || <Empty />}</td>
                          <td className={`${td} whitespace-nowrap`}>{h.leader_name || <Empty />}</td>
                          <td className={`${td} text-right tabular-nums`}>{counts.umatByHan.get(h.name) || 0}</td>
                          <td className="py-1 px-2">
                            <div className="flex items-center justify-end gap-0.5">
                              <IconButton label={`Ubah ${h.name}`} onClick={() => openEditHanModal(h)}>
                                <Edit2 size={16} aria-hidden />
                              </IconButton>
                              <IconButton tone="danger" label={`Hapus ${h.name}`} onClick={() => handleDeleteHan(h)}>
                                <Trash2 size={16} aria-hidden />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <ul className="xl:hidden divide-y divide-line">
                    {hans.map(h => (
                      <li key={h.id} className="p-3.5">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink break-words">{h.name}</p>
                            <p className="mt-1 text-xs text-ink-2 break-words">
                              {h.cetya_name || '-'} · {h.sentra || '-'}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-3 break-words">
                              Pembina {h.leader_name || '-'} · <span className="tabular-nums">{counts.umatByHan.get(h.name) || 0}</span> umat
                            </p>
                          </div>
                          <RowActions
                            title={h.name}
                            actions={[
                              { label: 'Hapus HAN', icon: <Trash2 size={16} />, tone: 'danger', onSelect: () => handleDeleteHan(h) }
                            ]}
                          />
                        </div>
                        <Button size="sm" className="mt-3 w-full h-11" onClick={() => openEditHanModal(h)}>
                          <Edit2 size={14} aria-hidden />
                          Edit
                        </Button>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </div>
          )}
        </>
      )}

      <Modal
        open={isEditUmatModalOpen && !!editingProfile}
        onClose={() => setIsEditUmatModalOpen(false)}
        title={editingProfile ? `Ubah data ${editingProfile.full_name}` : 'Ubah data umat'}
        size="lg"
      >
        <form onSubmit={handleUpdateUmat} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nama lengkap">
              <input type="text" required value={editFullName} onChange={(e) => setEditFullName(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Email login">
              <input
                type="email"
                placeholder="contoh: hendra@vihara.or.id"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Sentra">
              <select value={editSentra} onChange={(e) => changeEditSentra(e.target.value)} className={selectClass}>
                {sentras.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Cetya">
              <select value={editCetya} onChange={(e) => changeEditCetya(e.target.value)} className={selectClass}>
                {editCetya && !UNAFFILIATED_CETYA_OPTIONS.includes(editCetya) && !availableCetyasForEdit.some(c => c.name === editCetya) && (
                  <option value={editCetya}>{editCetya}</option>
                )}
                {availableCetyasForEdit.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                <optgroup label="Tanpa naungan">
                  {UNAFFILIATED_CETYA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </optgroup>
              </select>
            </Field>
            <Field label="HAN">
              <select value={editHan} onChange={(e) => setEditHan(e.target.value)} className={selectClass}>
                {editHan && !availableHansForEdit.some(h => h.name === editHan) && (
                  <option value={editHan}>{editHan}</option>
                )}
                {availableHansForEdit.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                <option value="">Tidak ada HAN</option>
                {otherHansForEdit.length > 0 && (
                  <optgroup label="HAN di Cetya lain">
                    {otherHansForEdit.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </optgroup>
                )}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="No. HP">
              <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Bagian">
              <select value={editBagian} onChange={(e) => setEditBagian(e.target.value as UmatBagian | '')} className={selectClass}>
                <option value="">Pilih bagian</option>
                {bagianOptions}
              </select>
            </Field>
            <Field label="Tanggal lahir">
              <input type="date" required value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Jenis kelamin">
              <select value={editGender} onChange={(e) => setEditGender(e.target.value as 'L' | 'P')} className={selectClass}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
          </div>

          <Field label="Alamat">
            <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className={inputClass} />
          </Field>

          <Field label="Kontak darurat" hint="Nama dan nomor yang bisa dihubungi">
            <input type="text" value={editEmergencyContact} onChange={(e) => setEditEmergencyContact(e.target.value)} className={inputClass} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Hak akses">
              <select value={editRole} onChange={(e) => setEditRole(e.target.value as 'umat' | 'admin')} className={selectClass}>
                <option value="umat">Umat (portal umat)</option>
                <option value="admin">Pengurus (akses admin)</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={editIsActive ? 'true' : 'false'} onChange={(e) => setEditIsActive(e.target.value === 'true')} className={selectClass}>
                <option value="true">Aktif</option>
                <option value="false">Non-aktif</option>
              </select>
            </Field>
          </div>

          <ModalActions>
            <Button variant="ghost" onClick={() => setIsEditUmatModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan perubahan</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={isAddUmatModalOpen} onClose={() => setIsAddUmatModalOpen(false)} title="Tambah umat" size="lg">
        <form onSubmit={handleAddUmat} className="space-y-3">
          <Field label="Nama lengkap">
            <input
              type="text"
              required
              placeholder="Contoh: Upasaka Hendra Kurniawan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Hak akses">
              <select value={role} onChange={(e) => setRole(e.target.value as 'umat' | 'admin')} className={selectClass}>
                <option value="umat">Umat (portal umat)</option>
                <option value="admin">Pengurus (akses admin)</option>
              </select>
            </Field>
            <Field label="Email login">
              <input
                type="email"
                placeholder="contoh: nama@vihara.or.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Sentra">
              <select value={sentra} onChange={(e) => changeAddSentra(e.target.value)} className={selectClass}>
                {sentras.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Cetya">
              <select value={cetya} onChange={(e) => changeAddCetya(e.target.value)} className={selectClass}>
                {availableCetyasForAdd.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                <optgroup label="Tanpa naungan">
                  {UNAFFILIATED_CETYA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </optgroup>
              </select>
            </Field>
            <Field label="HAN">
              <select value={han} onChange={(e) => setHan(e.target.value)} className={selectClass}>
                {availableHansForAdd.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                <option value="">Tidak ada HAN</option>
                {otherHansForAdd.length > 0 && (
                  <optgroup label="HAN di Cetya lain">
                    {otherHansForAdd.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </optgroup>
                )}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="No. HP">
              <input type="tel" placeholder="0812..." value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Bagian">
              <select value={bagian} onChange={(e) => setBagian(e.target.value as UmatBagian | '')} className={selectClass}>
                <option value="">Pilih bagian</option>
                {bagianOptions}
              </select>
            </Field>
            <Field label="Tanggal lahir">
              <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Jenis kelamin">
              <select value={gender} onChange={(e) => setGender(e.target.value as 'L' | 'P')} className={selectClass}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
          </div>

          <Field label="Alamat">
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </Field>

          <Field label="Kontak darurat" hint="Nama dan nomor yang bisa dihubungi">
            <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className={inputClass} />
          </Field>

          <ModalActions>
            <Button variant="ghost" onClick={() => setIsAddUmatModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan umat</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={isAddCetyaModalOpen} onClose={() => setIsAddCetyaModalOpen(false)} title="Tambah Cetya">
        <form onSubmit={handleAddCetya}>
          {cetyaFormFields}
          <ModalActions>
            <Button variant="ghost" onClick={() => setIsAddCetyaModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan Cetya</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal
        open={isEditCetyaModalOpen && !!editingCetya}
        onClose={() => setIsEditCetyaModalOpen(false)}
        title={editingCetya ? `Ubah ${editingCetya.name}` : 'Ubah Cetya'}
      >
        <form onSubmit={handleUpdateCetya}>
          {cetyaFormFields}
          <ModalActions>
            <Button variant="ghost" onClick={() => setIsEditCetyaModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan perubahan</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={isAddHanModalOpen} onClose={() => setIsAddHanModalOpen(false)} title="Tambah HAN">
        <form onSubmit={handleAddHan}>
          {hanFormFields}
          <ModalActions>
            <Button variant="ghost" onClick={() => setIsAddHanModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan HAN</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal
        open={isEditHanModalOpen && !!editingHan}
        onClose={() => setIsEditHanModalOpen(false)}
        title={editingHan ? `Ubah ${editingHan.name}` : 'Ubah HAN'}
      >
        <form onSubmit={handleUpdateHan}>
          {hanFormFields}
          <ModalActions>
            <Button variant="ghost" onClick={() => setIsEditHanModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan perubahan</Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal open={!!selectedUmatDetail} onClose={() => setSelectedUmatDetail(null)} title="Detail umat">
        {selectedUmatDetail && (
          <>
            <p className="text-base font-semibold text-ink">
              {selectedUmatDetail.full_name}
              {selectedUmatDetail.role === 'admin' && <Badge tone="brand" className="ml-2 align-middle">Pengurus</Badge>}
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {([
                ['Sentra', selectedUmatDetail.sentra],
                ['Cetya', selectedUmatDetail.cetya],
                ['HAN', selectedUmatDetail.han],
                ['Bagian', selectedUmatDetail.bagian],
                ['Jenis kelamin', selectedUmatDetail.gender === 'L' ? 'Laki-laki' : selectedUmatDetail.gender === 'P' ? 'Perempuan' : undefined],
                ['Alamat', selectedUmatDetail.address],
                ['Kontak darurat', selectedUmatDetail.emergency_contact]
              ] as [string, string | undefined][]).map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-ink-3">{label}</dt>
                  <dd className={`break-words ${value ? 'text-ink' : 'text-ink-3'}`}>{value || 'Belum diisi'}</dd>
                </div>
              ))}
            </dl>
            <ModalActions>
              <Button
                variant="primary"
                onClick={() => {
                  const target = selectedUmatDetail;
                  setSelectedUmatDetail(null);
                  openEditUmatModal(target);
                }}
              >
                <Edit2 size={14} aria-hidden />
                Ubah data
              </Button>
            </ModalActions>
          </>
        )}
      </Modal>
    </div>
  );
}
