'use client'

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Receipt, 
  CheckCircle2, 
  FileText, 
  UserCheck, 
  PlusCircle,
  Crown,
  Layers,
  Plus,
  Trash2,
  FileSpreadsheet,
  Printer,
  Edit2,
  X,
  ListTodo
} from 'lucide-react';
import { 
  getEventById, 
  getRegistrationsForEvent, 
  registerForEvent, 
  toggleAttendance, 
  addBudgetItem, 
  getProfiles,
  addSubSectionToOrg,
  updateSubSectionInOrg,
  deleteSubSectionFromOrg,
  addProposalRundown,
  updateProposalRundown,
  deleteProposalRundown,
  addSkenarioKerja,
  updateSkenarioKerja,
  deleteSkenarioKerja
} from '@/lib/actions/vihara-actions';
import { ViharaEvent, Profile, EventRegistration, EventProposalRundown, EventSkenarioKerja } from '@/types/database';
import { exportRABToExcel, exportSkenarioKerjaToExcel } from '@/lib/export-utils';

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [event, setEvent] = useState<ViharaEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bidang' | 'rundown' | 'skenario' | 'rab' | 'registrasi' | 'laporan'>('overview');

  // Modals
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);

  // Proposal Rundown Modal State
  const [isProposalRundownModalOpen, setIsProposalRundownModalOpen] = useState(false);
  const [editingProposalRundown, setEditingProposalRundown] = useState<EventProposalRundown | null>(null);
  const [prDayDate, setPrDayDate] = useState('');
  const [prTimeSlot, setPrTimeSlot] = useState('');
  const [prActivity, setPrActivity] = useState('');
  const [prNotes, setPrNotes] = useState('');

  // Skenario Kerja (SK) Modal State
  const [isSkenarioKerjaModalOpen, setIsSkenarioKerjaModalOpen] = useState(false);
  const [editingSkenarioKerja, setEditingSkenarioKerja] = useState<EventSkenarioKerja | null>(null);
  const [skDayPhase, setSkDayPhase] = useState('');
  const [skTimeSlot, setSkTimeSlot] = useState('');
  const [skExecutorBidangPj, setSkExecutorBidangPj] = useState('');
  const [skActivity, setSkActivity] = useState('');
  const [skInterbidBidangPj, setSkInterbidBidangPj] = useState('');
  const [skNotes, setSkNotes] = useState('');

  // PDF Printable Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfMode, setPdfMode] = useState<'proposal' | 'lpj'>('proposal');

  // Forms
  const [selectedUmatId, setSelectedUmatId] = useState('');
  const [regMsg, setRegMsg] = useState('');

  // Budget Form
  const [budgetItem, setBudgetItem] = useState('');
  const [budgetType, setBudgetType] = useState<'rab' | 'realisasi'>('rab');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Sub-Section Form
  const [subSectionType, setSubSectionType] = useState<'sub_acara' | 'sub_umum'>('sub_acara');
  const [subRoleName, setSubRoleName] = useState('');
  const [subPicName, setSubPicName] = useState('');

  // Edit Sub-Section Form State
  const [isEditSubModalOpen, setIsEditSubModalOpen] = useState(false);
  const [editSubId, setEditSubId] = useState('');
  const [editSubType, setEditSubType] = useState<'sub_acara' | 'sub_umum'>('sub_acara');
  const [editSubRoleName, setEditSubRoleName] = useState('');
  const [editSubPicName, setEditSubPicName] = useState('');

  const loadData = async () => {
    const ev = await getEventById(eventId);
    if (!ev) return;
    setEvent(ev);
    const regs = await getRegistrationsForEvent(eventId);
    setRegistrations(regs);
    const profs = await getProfiles();
    setProfiles(profs);
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  if (!event) {
    return <div className="p-8 text-center text-slate-500">Memuat detail event...</div>;
  }

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUmatId) return;

    const res = await registerForEvent(event.id, selectedUmatId, 'p1');

    if (res.error) {
      setRegMsg(res.error);
    } else {
      setRegMsg('✓ Umat berhasil didaftarkan oleh Admin');
      setTimeout(() => setRegMsg(''), 3000);
      setIsRegModalOpen(false);
      loadData();
    }
  };

  const handleToggleAttendance = async (regId: string) => {
    await toggleAttendance(regId);
    loadData();
  };

  const openAddSubModal = (type: 'sub_acara' | 'sub_umum') => {
    setSubSectionType(type);
    setSubRoleName('');
    setSubPicName(type === 'sub_acara' ? (event.org_structure?.pj_acara_name || '') : (event.org_structure?.pj_umum_name || ''));
    setIsAddSubModalOpen(true);
  };

  const handleAddSubSection = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSubSectionToOrg(event.id, subSectionType, subRoleName, subPicName);
    setIsAddSubModalOpen(false);
    setSubRoleName('');
    setSubPicName('');
    loadData();
  };

  const handleDeleteSubSection = async (type: 'sub_acara' | 'sub_umum', subId: string) => {
    await deleteSubSectionFromOrg(event.id, type, subId);
    loadData();
  };

  const openEditSubModal = (type: 'sub_acara' | 'sub_umum', sub: { id: string; role_name: string; pic_name: string }) => {
    setEditSubType(type);
    setEditSubId(sub.id);
    setEditSubRoleName(sub.role_name);
    setEditSubPicName(sub.pic_name);
    setIsEditSubModalOpen(true);
  };

  const handleUpdateSubSection = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSubSectionInOrg(event.id, editSubType, editSubId, editSubRoleName, editSubPicName);
    setIsEditSubModalOpen(false);
    loadData();
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    await addBudgetItem({
      event_id: event.id,
      item_name: budgetItem,
      budget_type: budgetType,
      amount: parseFloat(budgetAmount) || 0
    });

    setIsBudgetModalOpen(false);
    setBudgetItem('');
    setBudgetAmount('');
    loadData();
  };

  // Proposal Rundown Handlers
  const openProposalRundownModal = (item?: EventProposalRundown) => {
    if (item) {
      setEditingProposalRundown(item);
      setPrDayDate(item.day_date);
      setPrTimeSlot(item.time_slot);
      setPrActivity(item.activity);
      setPrNotes(item.notes || '');
    } else {
      setEditingProposalRundown(null);
      setPrDayDate('Sabtu, 1 Agustus 2026');
      setPrTimeSlot('08:00 - 09:00');
      setPrActivity('');
      setPrNotes('');
    }
    setIsProposalRundownModalOpen(true);
  };

  const handleSaveProposalRundown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProposalRundown) {
      await updateProposalRundown(event.id, editingProposalRundown.id, {
        day_date: prDayDate,
        time_slot: prTimeSlot,
        activity: prActivity,
        notes: prNotes
      });
    } else {
      await addProposalRundown(event.id, {
        day_date: prDayDate,
        time_slot: prTimeSlot,
        activity: prActivity,
        notes: prNotes
      });
    }
    setIsProposalRundownModalOpen(false);
    loadData();
  };

  const handleDeleteProposalRundown = async (itemId: string) => {
    await deleteProposalRundown(event.id, itemId);
    loadData();
  };

  // Skenario Kerja Handlers
  const openSkenarioKerjaModal = (item?: EventSkenarioKerja) => {
    if (item) {
      setEditingSkenarioKerja(item);
      setSkDayPhase(item.day_phase);
      setSkTimeSlot(item.time_slot);
      setSkExecutorBidangPj(item.executor_bidang_pj);
      setSkActivity(item.activity);
      setSkInterbidBidangPj(item.interbid_bidang_pj);
      setSkNotes(item.notes || '');
    } else {
      setEditingSkenarioKerja(null);
      setSkDayPhase('H-1 (Jumat, 31 Juli 2026)');
      setSkTimeSlot('14:00 - 16:00');
      setSkExecutorBidangPj(event.org_structure?.pj_acara_name ? `Bidang Acara - ${event.org_structure.pj_acara_name}` : 'Bidang Acara');
      setSkActivity('');
      setSkInterbidBidangPj(event.org_structure?.pj_umum_name ? `Bidang Umum - ${event.org_structure.pj_umum_name}` : 'Bidang Umum');
      setSkNotes('');
    }
    setIsSkenarioKerjaModalOpen(true);
  };

  const handleSaveSkenarioKerja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkenarioKerja) {
      await updateSkenarioKerja(event.id, editingSkenarioKerja.id, {
        day_phase: skDayPhase,
        time_slot: skTimeSlot,
        executor_bidang_pj: skExecutorBidangPj,
        activity: skActivity,
        interbid_bidang_pj: skInterbidBidangPj,
        notes: skNotes
      });
    } else {
      await addSkenarioKerja(event.id, {
        day_phase: skDayPhase,
        time_slot: skTimeSlot,
        executor_bidang_pj: skExecutorBidangPj,
        activity: skActivity,
        interbid_bidang_pj: skInterbidBidangPj,
        notes: skNotes
      });
    }
    setIsSkenarioKerjaModalOpen(false);
    loadData();
  };

  const handleDeleteSkenarioKerja = async (itemId: string) => {
    await deleteSkenarioKerja(event.id, itemId);
    loadData();
  };

  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];
  const totalRAB = rabItems.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRealisasi = realisasiItems.reduce((acc, curr) => acc + curr.amount, 0);

  const isPastEvent = new Date(event.event_date) < new Date();
  const org = event.org_structure;

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/60 pb-5">
        <div className="space-y-1">
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline mb-1"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Event</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {event.title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
              isPastEvent
                ? 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            }`}>
              {isPastEvent ? 'Selesai' : 'Mendatang'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
            <span className="flex items-center gap-1">
              <CalendarDays size={14} className="text-purple-600" />
              {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-purple-600" />
              {event.location}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setPdfMode('proposal');
              setIsPdfModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 hover:bg-purple-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-purple-200 dark:border-purple-800"
          >
            <Printer size={14} />
            <span>Cetak Proposal Event</span>
          </button>

          <button
            onClick={() => {
              setPdfMode('lpj');
              setIsPdfModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 hover:bg-amber-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-amber-200 dark:border-amber-800"
          >
            <FileText size={14} />
            <span>Cetak LPJ Event</span>
          </button>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex border-b border-purple-100 dark:border-purple-900/60 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CalendarDays size={16} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('bidang')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'bidang'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Layers size={16} />
          <span>Panitia & Struktur Organisasi</span>
        </button>

        <button
          onClick={() => setActiveTab('rundown')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'rundown'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Clock size={16} />
          <span>Rundown Proposal ({event.proposal_rundowns?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('skenario')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'skenario'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ListTodo size={16} />
          <span>Skenario Kerja SK ({event.skenario_kerja?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('registrasi')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'registrasi'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <UserCheck size={16} />
          <span>Presensi Umat ({registrations.length}/{event.quota || 100})</span>
        </button>

        <button
          onClick={() => setActiveTab('rab')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'rab'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Receipt size={16} />
          <span>RAB & Realisasi</span>
        </button>

        <button
          onClick={() => setActiveTab('laporan')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'laporan'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText size={16} />
          <span>Laporan Event & Export</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              Informasi Event
            </h3>
            <p className="leading-relaxed">{event.description}</p>
            
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/60 space-y-2 border border-purple-100 dark:border-purple-900/60">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Catatan & Ketentuan:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                <li>Umat diimbau berbusana rapi dan bersahaja.</li>
                <li>Harap hadir 15 menit sebelum pembacaan Paritta dimulai.</li>
                <li>Pendaftaran dapat dilakukan mandiri via Portal Umat atau di lokasi via Admin.</li>
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              Status Kuota Event
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kapasitas Maksimal:</span>
                <strong className="text-slate-900 dark:text-white">{event.quota || 100} Umat</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Terdaftar Saat Ini:</span>
                <strong className="text-purple-700 dark:text-purple-300">{registrations.length} Umat</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Hadir Presensi:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {registrations.filter(r => r.is_attended).length} Umat
                </strong>
              </div>

              <div className="w-full bg-slate-100 dark:bg-purple-950 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="gradient-mnsbdi h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (registrations.length / (event.quota || 100)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PANITIA & STRUKTUR ORGANISASI */}
      {activeTab === 'bidang' && (
        <div className="space-y-6 print:hidden">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              Struktur Kepanitiaan Event
            </h3>

            {/* LEVEL 1, 2, 3: INTI */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Ketua Panitia Pelaksana
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{org?.ketua_name || event.pic_name || 'Upasaka Hendra Kurniawan'}</h4>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Sekretaris Panitia
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{org?.sekretaris_name || 'Suryani Dewi'}</h4>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Bendahara Panitia
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{org?.bendahara_name || 'Budi Santoso'}</h4>
              </div>
            </div>

            {/* LEVEL 4: PJ ACARA & SUB-BAGIAN ACARA */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                    Penanggung Jawab Utama Acara & Ritual
                  </span>
                  <h4 className="text-lg font-black text-purple-950 dark:text-white mt-1">
                    PJ Acara: {org?.pj_acara_name || 'Suryani Dewi'}
                  </h4>
                </div>
                
                <button
                  onClick={() => openAddSubModal('sub_acara')}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Sub-Bagian Acara</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {org?.sub_acara && org.sub_acara.length > 0 ? (
                  org.sub_acara.map(sub => (
                    <div key={sub.id} className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 space-y-1 relative group">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-purple-950 dark:text-purple-100 block pr-4">{sub.role_name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditSubModal('sub_acara', sub)}
                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 p-1 rounded transition cursor-pointer"
                            title="Edit PJ & Sub-Bagian Ini"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubSection('sub_acara', sub.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                            title="Hapus Sub-Bagian Ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-bold">PJ: <strong className="text-slate-900 dark:text-white">{sub.pic_name}</strong></p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-3">Belum ada sub-bagian acara tambahan.</p>
                )}
              </div>
            </div>

            {/* LEVEL 4: PJ BIDANG UMUM & SUB-BAGIAN UMUM */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    Penanggung Jawab Utama Logistik & Umum
                  </span>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    PJ Bidang Umum: {org?.pj_umum_name || 'Budi Santoso'}
                  </h4>
                </div>

                <button
                  onClick={() => openAddSubModal('sub_umum')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Sub-Bagian Umum</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {org?.sub_umum && org.sub_umum.length > 0 ? (
                  org.sub_umum.map(sub => (
                    <div key={sub.id} className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1 relative group">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-slate-900 dark:text-white block pr-4">{sub.role_name}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditSubModal('sub_umum', sub)}
                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 p-1 rounded transition cursor-pointer"
                            title="Edit PJ & Sub-Bagian Ini"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubSection('sub_umum', sub.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded transition cursor-pointer"
                            title="Hapus Sub-Bagian Ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-bold">PJ: <strong className="text-slate-900 dark:text-white">{sub.pic_name}</strong></p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-3">Belum ada sub-bagian umum tambahan.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RUNDOWN PROPOSAL */}
      {activeTab === 'rundown' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
          <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Rundown Acara (Khusus Proposal Event)
              </h3>
              <p className="text-xs text-slate-500">Jadwal acara resmi yang otomatis dicetak masuk ke dalam Dokumen Proposal Event.</p>
            </div>

            <button
              onClick={() => openProposalRundownModal()}
              className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Rundown Proposal</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                  <th className="pb-3 w-10 text-center">No</th>
                  <th className="pb-3">Hari / Tanggal</th>
                  <th className="pb-3 text-center">Waktu / Jam</th>
                  <th className="pb-3">Nama Agenda / Kegiatan</th>
                  <th className="pb-3">Keterangan</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
                {event.proposal_rundowns && event.proposal_rundowns.length > 0 ? (
                  event.proposal_rundowns.map((pr, index) => (
                    <tr key={pr.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                      <td className="py-3 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{pr.day_date}</td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-extrabold text-[11px]">
                          {pr.time_slot}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-purple-950 dark:text-purple-100">{pr.activity}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{pr.notes || '-'}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openProposalRundownModal(pr)}
                            className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 rounded cursor-pointer"
                            title="Edit Rundown Ini"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProposalRundown(pr.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                            title="Hapus Rundown Ini"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs italic">
                      Belum ada rundown acara proposal. Klik tombol "Tambah Rundown Proposal" di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SKENARIO KERJA (SK OPERASIONAL LAPANGAN + EXPORT EXCEL) */}
      {activeTab === 'skenario' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <ListTodo className="text-amber-500" size={18} />
                <span>Matriks Skenario Kerja (SK Operasional Lapangan)</span>
              </h3>
              <p className="text-xs text-slate-500">Alur kerja detail persiapan tim dari H-2, H-1, hingga Hari-H beserta Interbid Bidang/PJ Pelaksana & Tujuan.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportSkenarioKerjaToExcel(event.title, event.skenario_kerja || [])}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
              >
                <FileSpreadsheet size={14} />
                <span>Export SK ke Excel (.xls)</span>
              </button>

              <button
                onClick={() => openSkenarioKerjaModal()}
                className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah Agenda SK</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                  <th className="pb-3 w-10 text-center">No</th>
                  <th className="pb-3">Hari / Tanggal / Tahap</th>
                  <th className="pb-3 text-center">Waktu / Jam</th>
                  <th className="pb-3">Bidang & PJ Pelaksana</th>
                  <th className="pb-3">Detail Persiapan / Kegiatan</th>
                  <th className="pb-3">Interbid (Bidang & PJ Tujuan)</th>
                  <th className="pb-3">Notes Lapangan</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
                {event.skenario_kerja && event.skenario_kerja.length > 0 ? (
                  event.skenario_kerja.map((sk, index) => (
                    <tr key={sk.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                      <td className="py-3 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-black text-[11px]">
                          {sk.day_phase}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-extrabold text-[11px]">
                          {sk.time_slot}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">{sk.executor_bidang_pj}</td>
                      <td className="py-3 font-extrabold text-purple-950 dark:text-purple-100">{sk.activity}</td>
                      <td className="py-3 font-bold text-sky-700 dark:text-sky-400">{sk.interbid_bidang_pj}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{sk.notes || '-'}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openSkenarioKerjaModal(sk)}
                            className="p-1 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950 rounded cursor-pointer"
                            title="Edit Agenda SK"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSkenarioKerja(sk.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                            title="Hapus Agenda SK"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400 text-xs italic">
                      Belum ada agenda skenario kerja. Klik "Tambah Agenda SK" di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PRESENSI UMAT */}
      {activeTab === 'registrasi' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
          <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Daftar Umat Terdaftar & Presensi Kehadiran
              </h3>
              <p className="text-xs text-slate-500">Tabel presensi umat terdaftar pada event ini.</p>
            </div>

            <button
              onClick={() => setIsRegModalOpen(true)}
              className="px-3.5 py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Daftarkan Umat (Admin)</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                  <th className="pb-3 w-10 text-center">No</th>
                  <th className="pb-3">Nama Lengkap Umat</th>
                  <th className="pb-3">Cetya & HAN</th>
                  <th className="pb-3 text-center">Metode Pendaftaran</th>
                  <th className="pb-3 text-center">Status Presensi</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
                {registrations.length > 0 ? (
                  registrations.map((reg, index) => (
                    <tr key={reg.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                      <td className="py-3 text-center font-bold text-slate-500">{index + 1}</td>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {reg.profile?.full_name || 'Umat Vihara'}
                      </td>
                      <td className="py-3 text-slate-500">
                        {reg.profile?.cetya || '-'} / {reg.profile?.han || '-'}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          reg.registration_method === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {reg.registration_method === 'admin' ? 'By Admin' : 'Mandiri'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center justify-center gap-1 w-fit mx-auto ${
                          reg.is_attended
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                        }`}>
                          <CheckCircle2 size={12} />
                          <span>{reg.is_attended ? 'Hadir Presensi' : 'Belum Presensi'}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleAttendance(reg.id)}
                          className={`px-3 py-1 rounded-lg font-extrabold text-[11px] cursor-pointer transition ${
                            reg.is_attended
                              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                          }`}
                        >
                          {reg.is_attended ? 'Batalkan Presensi' : 'Tandai Hadir'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs italic">
                      Belum ada umat yang mendaftar pada event ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: RAB & REALISASI */}
      {activeTab === 'rab' && (
        <div className="space-y-6 print:hidden">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100 dark:border-purple-900/60 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Rencana Anggaran Biaya (RAB) vs Realisasi
                </h3>
                <p className="text-xs text-slate-500">Kelola item pengeluaran RAB dan pencatatan realisasi dana event.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportRABToExcel(event.title, event.budgets || [])}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1 shadow cursor-pointer"
                >
                  <FileSpreadsheet size={14} />
                  <span>Export RAB Excel</span>
                </button>

                <button
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Item Keuangan</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900">
                <span className="text-slate-500 font-bold block mb-1">Total Target RAB (Rencana):</span>
                <strong className="text-lg font-black text-purple-950 dark:text-purple-200">
                  Rp {totalRAB.toLocaleString('id-ID')}
                </strong>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900">
                <span className="text-slate-500 font-bold block mb-1">Total Realisasi (Aktual):</span>
                <strong className="text-lg font-black text-amber-950 dark:text-amber-200">
                  Rp {totalRealisasi.toLocaleString('id-ID')}
                </strong>
              </div>

              <div className={`p-4 rounded-xl border ${
                totalRAB - totalRealisasi >= 0 
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 text-emerald-900 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 text-rose-900 dark:text-rose-300'
              }`}>
                <span className="font-bold block mb-1">Selisih Anggaran:</span>
                <strong className="text-lg font-black">
                  Rp {(totalRAB - totalRealisasi).toLocaleString('id-ID')}
                </strong>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-purple-100 dark:border-purple-900/60 text-slate-400 font-extrabold">
                    <th className="pb-3 w-10 text-center">No</th>
                    <th className="pb-3">Nama Item Pengeluaran</th>
                    <th className="pb-3 text-center">Jenis Record</th>
                    <th className="pb-3 text-right">Jumlah (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-50 dark:divide-purple-900/40">
                  {event.budgets && event.budgets.length > 0 ? (
                    event.budgets.map((b, i) => (
                      <tr key={b.id} className="hover:bg-purple-50/50 dark:hover:bg-purple-950/40">
                        <td className="py-3 text-center font-bold text-slate-500">{i + 1}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{b.item_name}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            b.budget_type === 'rab'
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {b.budget_type === 'rab' ? 'Anggaran RAB' : 'Realisasi'}
                          </span>
                        </td>
                        <td className="py-3 text-right font-black text-slate-900 dark:text-white">
                          Rp {b.amount.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400 text-xs italic">
                        Belum ada item anggaran keuangan yang dimasukkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: LAPORAN EVENT & EXPORT */}
      {activeTab === 'laporan' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4 print:hidden">
          <h3 className="text-base font-black text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
            Pusat Cetak & Export Laporan Event
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Gunakan tombol di bawah untuk mencetak Proposal Event, Laporan Pertanggungjawaban (LPJ), atau mengunduh data dalam format Excel.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <button
              onClick={() => {
                setPdfMode('proposal');
                setIsPdfModalOpen(true);
              }}
              className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-left space-y-2 hover:border-purple-500 cursor-pointer transition"
            >
              <Printer className="text-purple-600" size={24} />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Cetak Proposal Event (PDF)</h4>
              <p className="text-[11px] text-slate-500">Mencetak dokumen proposal lengkap beserta Struktur Panitia, Rundown Proposal, dan RAB.</p>
            </button>

            <button
              onClick={() => exportSkenarioKerjaToExcel(event.title, event.skenario_kerja || [])}
              className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-left space-y-2 hover:border-emerald-500 cursor-pointer transition"
            >
              <FileSpreadsheet className="text-emerald-600" size={24} />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Export Skenario Kerja (Excel)</h4>
              <p className="text-[11px] text-slate-500">Mengunduh file Excel (.xls) berdesain rapi khas MNSBDI untuk alur operasional tim lapangan.</p>
            </button>

            <button
              onClick={() => {
                setPdfMode('lpj');
                setIsPdfModalOpen(true);
              }}
              className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-left space-y-2 hover:border-amber-500 cursor-pointer transition"
            >
              <FileText className="text-amber-600" size={24} />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Cetak LPJ Event (PDF)</h4>
              <p className="text-[11px] text-slate-500">Mencetak Laporan Pertanggungjawaban LENGKAP dengan Rekap Presensi Umat & Perbandingan Realisasi Biaya.</p>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal Add/Edit Proposal Rundown */}
      {isProposalRundownModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" />
              <span>{editingProposalRundown ? 'Edit Rundown Proposal' : 'Tambah Rundown Proposal'}</span>
            </h3>

            <form onSubmit={handleSaveProposalRundown} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hari / Tanggal</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Sabtu, 1 Agustus 2026"
                  value={prDayDate}
                  onChange={(e) => setPrDayDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Waktu / Jam</label>
                <input
                  type="text"
                  required
                  placeholder="misal: 08:00 - 09:30"
                  value={prTimeSlot}
                  onChange={(e) => setPrTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Agenda / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Pembacaan Paritta Gongyo bersama"
                  value={prActivity}
                  onChange={(e) => setPrActivity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Keterangan / Notes</label>
                <input
                  type="text"
                  placeholder="misal: Dilaksanakan di Altar Utama"
                  value={prNotes}
                  onChange={(e) => setPrNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsProposalRundownModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Rundown</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Skenario Kerja (SK) */}
      {isSkenarioKerjaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <ListTodo size={18} className="text-amber-500" />
              <span>{editingSkenarioKerja ? 'Edit Agenda Skenario Kerja' : 'Tambah Agenda Skenario Kerja (SK)'}</span>
            </h3>

            <form onSubmit={handleSaveSkenarioKerja} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hari / Tanggal / Tahap</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: H-1 (Jumat, 31 Juli 2026)"
                    value={skDayPhase}
                    onChange={(e) => setSkDayPhase(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold text-amber-900 dark:text-amber-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Waktu / Jam</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: 14:00 - 17:00"
                    value={skTimeSlot}
                    onChange={(e) => setSkTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bidang & PJ Pelaksana</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Bidang Acara - Suryani Dewi"
                  value={skExecutorBidangPj}
                  onChange={(e) => setSkExecutorBidangPj(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detail Persiapan / Kegiatan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="misal: Pemasangan Dekorasi Altar, Sound Check & Pembagian Konsumsi"
                  value={skActivity}
                  onChange={(e) => setSkActivity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Interbid (Bidang & PJ Tujuan)</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Bidang Umum & Logistik - Budi Santoso"
                  value={skInterbidBidangPj}
                  onChange={(e) => setSkInterbidBidangPj(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-bold text-sky-800 dark:text-sky-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan / Notes Lapangan</label>
                <input
                  type="text"
                  placeholder="misal: Pastikan 4 mic wireless terisi baterai & disinfeksi"
                  value={skNotes}
                  onChange={(e) => setSkNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsSkenarioKerjaModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Skenario Kerja</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Sub-Section */}
      {isAddSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              {subSectionType === 'sub_acara' ? 'Tambah Sub-Bagian di bawah PJ Acara' : 'Tambah Sub-Bagian di bawah PJ Bidang Umum'}
            </h3>
            
            <form onSubmit={handleAddSubSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Seksi / Sub-Bagian</label>
                <input
                  type="text"
                  required
                  placeholder={subSectionType === 'sub_acara' ? 'misal: Seksi Ritual Gongyo & Altar' : 'misal: Seksi Transportasi & Akomodasi'}
                  value={subRoleName}
                  onChange={(e) => setSubRoleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PJ Sub-Bagian)</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Penanggung Jawab"
                  value={subPicName}
                  onChange={(e) => setSubPicName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsAddSubModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Sub-Bagian</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Sub-Section */}
      {isEditSubModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3 flex items-center gap-2">
              <Edit2 size={18} className="text-amber-500" />
              <span>Edit Sub-Bagian & Penanggung Jawab</span>
            </h3>
            
            <form onSubmit={handleUpdateSubSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Seksi / Sub-Bagian</label>
                <input
                  type="text"
                  required
                  value={editSubRoleName}
                  onChange={(e) => setEditSubRoleName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Penanggung Jawab (PJ Sub-Bagian)</label>
                <input
                  type="text"
                  required
                  value={editSubPicName}
                  onChange={(e) => setEditSubPicName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600 font-extrabold text-purple-950 dark:text-purple-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsEditSubModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin Hybrid Registration */}
      {isRegModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              Pendaftaran Umat oleh Admin
            </h3>
            
            <form onSubmit={handleAdminRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Umat dari Master Data</label>
                <select
                  required
                  value={selectedUmatId}
                  onChange={(e) => setSelectedUmatId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="">-- Pilih Nama Umat --</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.cetya || 'Sentra Makassar'})</option>
                  ))}
                </select>
              </div>

              {regMsg && (
                <p className="text-xs font-bold text-rose-500">{regMsg}</p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsRegModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Daftarkan Umat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Budget */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-[#160e29] border border-purple-200 dark:border-purple-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">
              Tambah Item Keuangan Event
            </h3>
            
            <form onSubmit={handleAddBudget} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Item Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Konsumsi Umat, Dekorasi Altar, Sound System"
                  value={budgetItem}
                  onChange={(e) => setBudgetItem(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jenis Record</label>
                <select
                  value={budgetType}
                  onChange={(e: any) => setBudgetType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="rab">Anggaran Rencana (RAB)</option>
                  <option value="realisasi">Realisasi Aktual Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="misal: 1500000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PDF PRINTABLE MODAL VIEW (PROPOSAL & LPJ) */}
      {/* ========================================================================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Modal Controls (Hidden when printed) */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-purple-800 flex justify-between items-center text-white print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold">
                <Printer size={16} className="text-purple-400" />
                <span>Dokumen Siap Cetak: <strong className="text-amber-300 uppercase">{pdfMode === 'proposal' ? 'Proposal Event' : 'LPJ Event'}</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="gradient-mnsbdi px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Cetak / Download PDF</span>
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PRINT PAPER CONTAINER (A4 FORMATTED FOR PRINT) */}
            <div className="bg-white text-slate-900 p-8 md:p-12 rounded-2xl shadow-2xl space-y-6 print:p-0 print:shadow-none print:bg-transparent">
              
              {/* KOP SURAT OFFISIAL MNSBDI */}
              <div className="text-center border-b-4 border-double border-purple-950 pb-4 space-y-1">
                <h2 className="text-lg font-black text-purple-950 tracking-wider uppercase">
                  MAJELIS NICHREN SHOSHU BUDDHA DHARMA INDONESIA (MNSBDI)
                </h2>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  SENTRA MAKASSAR — PANITIA PELAKSANA EVENT
                </h3>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Alamat Sekretariat: Jl. Sulawesi No. 88, Makassar — Email: info@mnsbdi-makassar.or.id
                </p>
              </div>

              {/* DOKUMEN TITLE */}
              <div className="text-center space-y-1">
                <h3 className="text-base font-black uppercase tracking-wide text-purple-950 border-b-2 border-purple-900 inline-block pb-0.5">
                  {pdfMode === 'proposal' ? 'PROPOSAL PELAKSANAAN EVENT' : 'LAPORAN PERTANGGUNGJAWABAN (LPJ) EVENT'}
                </h3>
                <p className="text-sm font-extrabold text-slate-800">{event.title}</p>
                <p className="text-xs text-slate-500 font-semibold">
                  Tanggal Kegiatan: {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} | Lokasi: {event.location}
                </p>
              </div>

              {/* DOKUMEN CONTENT */}
              <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
                
                {/* SECTION 1: STRUKTUR KEPANITIAAN */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                    I. Susunan Panitia Pelaksana Event
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Ketua Panitia</span>
                      <strong className="text-slate-900 font-extrabold">{org?.ketua_name}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Sekretaris</span>
                      <strong className="text-slate-900 font-extrabold">{org?.sekretaris_name}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Bendahara</span>
                      <strong className="text-slate-900 font-extrabold">{org?.bendahara_name}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="p-4 rounded-xl border-2 border-purple-300 bg-purple-50/80 space-y-2">
                      <div className="border-b border-purple-300 pb-1.5 flex justify-between items-center">
                        <span className="font-black text-purple-950 uppercase text-xs">PJ Acara Utama</span>
                        <strong className="text-purple-950 font-black text-sm">{org?.pj_acara_name}</strong>
                      </div>
                      <p className="text-[10px] font-black text-purple-900 uppercase tracking-wider">Sub-Bagian Acara:</p>
                      <div className="space-y-1.5">
                        {org?.sub_acara && org.sub_acara.length > 0 ? (
                          org.sub_acara.map(s => (
                            <div key={s.id} className="bg-white p-2 rounded-lg border border-purple-200 shadow-sm flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900">• {s.role_name}</span>
                              <span className="font-extrabold text-purple-950 bg-purple-100 px-2 py-0.5 rounded text-[11px]">PJ: {s.pic_name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-xs italic">- Belum ada sub-bagian -</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/80 space-y-2">
                      <div className="border-b border-amber-300 pb-1.5 flex justify-between items-center">
                        <span className="font-black text-amber-950 uppercase text-xs">PJ Bidang Umum Utama</span>
                        <strong className="text-amber-950 font-black text-sm">{org?.pj_umum_name}</strong>
                      </div>
                      <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Sub-Bagian Umum & Logistik:</p>
                      <div className="space-y-1.5">
                        {org?.sub_umum && org.sub_umum.length > 0 ? (
                          org.sub_umum.map(s => (
                            <div key={s.id} className="bg-white p-2 rounded-lg border border-amber-200 shadow-sm flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-900">• {s.role_name}</span>
                              <span className="font-extrabold text-amber-950 bg-amber-100 px-2 py-0.5 rounded text-[11px]">PJ: {s.pic_name}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 text-xs italic">- Belum ada sub-bagian -</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: RUNDOWN ACARA PROPOSAL */}
                <div className="space-y-3 print-avoid-break">
                  <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                    II. Susunan Rundown Acara
                  </h4>
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-purple-900 text-white font-bold">
                        <th className="p-2 border border-slate-300 text-center w-10">No</th>
                        <th className="p-2 border border-slate-300">Hari / Tanggal</th>
                        <th className="p-2 border border-slate-300 text-center">Waktu / Jam</th>
                        <th className="p-2 border border-slate-300">Nama Agenda / Kegiatan</th>
                        <th className="p-2 border border-slate-300">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.proposal_rundowns && event.proposal_rundowns.length > 0 ? (
                        event.proposal_rundowns.map((pr, i) => (
                          <tr key={pr.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="p-2 border border-slate-300 text-center">{i + 1}</td>
                            <td className="p-2 border border-slate-300 font-bold">{pr.day_date}</td>
                            <td className="p-2 border border-slate-300 text-center font-semibold text-purple-900">{pr.time_slot}</td>
                            <td className="p-2 border border-slate-300 font-bold text-slate-900">{pr.activity}</td>
                            <td className="p-2 border border-slate-300 text-slate-600">{pr.notes || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-3 text-center text-slate-400 italic">Belum ada rundown acara yang ditambahkan.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* SECTION 3: REKAPITULASI PRESENSI (HANYA PADA LPJ) */}
                {pdfMode === 'lpj' && (
                  <div className="space-y-2 print-avoid-break">
                    <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                      III. Rekapitulasi Presensi Kehadiran Umat
                    </h4>
                    <div className="grid grid-cols-3 gap-3 text-xs text-center">
                      <div className="p-3 rounded-xl border bg-slate-50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Target Kuota</p>
                        <p className="font-bold text-slate-900 text-sm">{event.quota || 100} Umat</p>
                      </div>
                      <div className="p-3 rounded-xl border bg-slate-50">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Total Terdaftar</p>
                        <p className="font-bold text-slate-900 text-sm">{registrations.length} Umat</p>
                      </div>
                      <div className="p-3 rounded-xl border bg-emerald-50 border-emerald-200">
                        <p className="text-[10px] text-emerald-800 font-bold uppercase">Total Hadir Presensi</p>
                        <p className="font-extrabold text-emerald-900 text-sm">{registrations.filter(r => r.is_attended).length} Umat</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 4: KEUANGAN (RAB VS REALISASI) */}
                <div className="space-y-3 print-avoid-break">
                  <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                    {pdfMode === 'proposal' ? 'III. Rencana Anggaran Biaya (RAB)' : 'IV. Perbandingan Realisasi Keuangan vs RAB'}
                  </h4>

                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-purple-900 text-white font-bold">
                        <th className="p-2.5 border border-slate-300 text-center w-10">No</th>
                        <th className="p-2.5 border border-slate-300">Nama Item Pengeluaran</th>
                        <th className="p-2.5 border border-slate-300 text-right">Rencana RAB (Rp)</th>
                        {pdfMode === 'lpj' && <th className="p-2.5 border border-slate-300 text-right">Realisasi (Rp)</th>}
                        {pdfMode === 'lpj' && <th className="p-2.5 border border-slate-300 text-right">Selisih (Rp)</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rabItems.map((b, i) => {
                        const realisasi = realisasiItems.find(r => r.item_name === b.item_name)?.amount || 0;
                        const variance = b.amount - realisasi;
                        return (
                          <tr key={b.id} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                            <td className="p-2 border border-slate-300 text-center">{i + 1}</td>
                            <td className="p-2 border border-slate-300 font-bold">{b.item_name}</td>
                            <td className="p-2 border border-slate-300 text-right font-semibold">Rp {b.amount.toLocaleString('id-ID')}</td>
                            {pdfMode === 'lpj' && <td className="p-2 border border-slate-300 text-right font-semibold text-amber-900">Rp {realisasi.toLocaleString('id-ID')}</td>}
                            {pdfMode === 'lpj' && (
                              <td className={`p-2 border border-slate-300 text-right font-bold ${variance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                Rp {variance.toLocaleString('id-ID')}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-purple-100 font-extrabold">
                        <td colSpan={2} className="p-2.5 border border-slate-300 text-right">TOTAL KESELURUHAN</td>
                        <td className="p-2.5 border border-slate-300 text-right text-purple-950">Rp {totalRAB.toLocaleString('id-ID')}</td>
                        {pdfMode === 'lpj' && <td className="p-2.5 border border-slate-300 text-right text-amber-950">Rp {totalRealisasi.toLocaleString('id-ID')}</td>}
                        {pdfMode === 'lpj' && (
                          <td className={`p-2.5 border border-slate-300 text-right ${totalRAB - totalRealisasi >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                            Rp {(totalRAB - totalRealisasi).toLocaleString('id-ID')}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* SIGNATURE BLOCK */}
                <div className="pt-8 grid grid-cols-2 text-center text-xs print-avoid-break">
                  <div>
                    <p className="text-slate-500">Mengetahui / Menyetujui,</p>
                    <p className="font-extrabold text-slate-900 mt-1">Ketua Panitia Pelaksana</p>
                    <div className="h-16 flex items-end justify-center">
                      <span className="font-black text-purple-950 underline">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-500">Makassar, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-extrabold text-slate-900 mt-1">Sekretaris Panitia</p>
                    <div className="h-16 flex items-end justify-center">
                      <span className="font-black text-purple-950 underline">{org?.sekretaris_name || 'Suryani Dewi'}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
