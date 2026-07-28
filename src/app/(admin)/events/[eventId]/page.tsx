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
  X
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
  deleteSubSectionFromOrg
} from '@/lib/actions/vihara-actions';
import { ViharaEvent, Profile, EventRegistration } from '@/types/database';
import { exportRABToExcel } from '@/lib/export-utils';

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  const [event, setEvent] = useState<ViharaEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bidang' | 'rab' | 'registrasi' | 'laporan'>('overview');

  // Modals
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);

  // PDF Printable Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfMode, setPdfMode] = useState<'proposal' | 'lpj'>('proposal');

  // Forms
  const [selectedUmatId, setSelectedUmatId] = useState('');
  const [regMsg, setRegMsg] = useState('');

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

  const openPdfReportModal = (mode: 'proposal' | 'lpj') => {
    setPdfMode(mode);
    setIsPdfModalOpen(true);
  };

  const handleExportExcel = () => {
    exportRABToExcel(event.title, event.budgets || []);
  };

  const rabItems = event.budgets?.filter(b => b.budget_type === 'rab') || [];
  const realisasiItems = event.budgets?.filter(b => b.budget_type === 'realisasi') || [];
  const totalRAB = rabItems.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalRealisasi = realisasiItems.reduce((sum, i) => sum + Number(i.amount), 0);

  const org = event.org_structure;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Event</span>
        </Link>

        <div className="flex items-center gap-2">
          {event.is_complex && (
            <span className="text-xs bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full shadow">
              EVENT SKALA BESAR
            </span>
          )}
          <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            {event.category || 'Gongyo'}
          </span>
        </div>
      </div>

      {/* Main Banner Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-2xl space-y-4 border border-purple-700/50 print:hidden">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">{event.title}</h1>
          <p className="text-sm text-purple-200 leading-relaxed max-w-3xl">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-purple-700/50 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <Clock size={16} />
            <span>
              {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {event.end_date ? ` - ${new Date(event.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-purple-200 font-semibold">
            <Users size={16} />
            <span>Ketua: {org?.ketua_name || event.pic_name || 'Upasaka Hendra'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-purple-100 dark:border-purple-900/60 gap-4 overflow-x-auto print:hidden">
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

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Pendaftar Terdaftar:</span>
                <span className="text-purple-700 dark:text-purple-300 font-extrabold">{registrations.length} / {event.quota || 100} Umat</span>
              </div>
              <div className="w-full bg-purple-100 dark:bg-purple-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="gradient-mnsbdi h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((registrations.length / (event.quota || 100)) * 100))}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-purple-100 dark:border-purple-900/60 space-y-2 text-xs">
              <p className="text-slate-500 font-semibold">Total RAB: <strong className="text-purple-900 dark:text-purple-200">Rp {totalRAB.toLocaleString('id-ID')}</strong></p>
              <p className="text-slate-500 font-semibold">Total Realisasi: <strong className="text-emerald-600 dark:text-emerald-400">Rp {totalRealisasi.toLocaleString('id-ID')}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PANITIA & STRUKTUR ORGANISASI HIERARKI EXACT */}
      {activeTab === 'bidang' && (
        <div className="space-y-6 print:hidden">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="text-amber-500" size={20} />
                <span>Hierarki Kepanitiaan Event</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ketua ➔ Sekben & VIP ➔ PJ Acara & PJ Bidang Umum dengan Sub-Bagian Fleksibel</p>
            </div>
          </div>

          {/* ORGANIZATIONAL HIERARCHY TREE LAYOUT */}
          <div className="space-y-6">
            {/* LEVEL 1: KETUA PANITIA */}
            <div className="flex justify-center">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-900 text-white shadow-xl max-w-sm w-full text-center border border-purple-600">
                <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full inline-block mb-1 shadow">
                  Ketua Panitia Utama
                </span>
                <h4 className="text-lg font-black">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</h4>
                <p className="text-xs text-purple-200">Penanggung Jawab Keseluruhan Event</p>
              </div>
            </div>

            {/* LEVEL 2: SEKBEN & VIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sekben Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-2">
                <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 uppercase tracking-wider block border-b border-purple-100 dark:border-purple-900/60 pb-1">
                  Sekretariat & Keuangan (Sekben)
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950">
                    <p className="text-[10px] text-slate-400 font-semibold">Sekretaris</p>
                    <p className="font-bold text-slate-900 dark:text-white">{org?.sekretaris_name || 'Suryani Dewi'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950">
                    <p className="text-[10px] text-slate-400 font-semibold">Bendahara</p>
                    <p className="font-bold text-slate-900 dark:text-white">{org?.bendahara_name || 'Budi Santoso'}</p>
                  </div>
                </div>
              </div>

              {/* VIP Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-2">
                <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block border-b border-purple-100 dark:border-purple-900/60 pb-1">
                  VIP
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs pt-1">
                  {org?.vip_list && org.vip_list.length > 0 ? (
                    org.vip_list.map((vip, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                        👑 {vip}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">Tidak ada tamu VIP khusus.</span>
                  )}
                </div>
              </div>
            </div>

            {/* LEVEL 3: PJ ACARA & SUB-BAGIAN ACARA */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-purple-100 dark:border-purple-900/60 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200">
                    Penanggung Jawab Utama Acara
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

      {/* TAB PRESENSI UMAT */}
      {activeTab === 'registrasi' && (
        <div className="space-y-4 print:hidden">
          <div className="flex justify-between items-center bg-white dark:bg-[#160e29] p-4 rounded-2xl border border-purple-100 dark:border-purple-900/60 shadow-sm">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Presensi Kehadiran Umat</h4>
              <p className="text-xs text-slate-500">Pendaftaran mandiri oleh umat atau oleh admin di lokasi</p>
            </div>
            <button
              onClick={() => setIsRegModalOpen(true)}
              className="gradient-mnsbdi text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Daftarkan Umat (Admin)</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-purple-50 dark:bg-purple-950/60 border-b border-purple-100 dark:border-purple-900/60 text-purple-950 dark:text-purple-200 uppercase font-bold">
                  <th className="p-4">Nama Umat</th>
                  <th className="p-4">Metode Pendaftaran</th>
                  <th className="p-4">Status Kehadiran</th>
                  <th className="p-4 text-center">Tandai Presensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-900/60">
                {registrations.map(reg => (
                  <tr key={reg.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/40">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {reg.profile?.full_name || 'Umat Terdaftar'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded font-mono text-[10px] font-extrabold ${
                        reg.registration_method === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {reg.registration_method === 'admin' ? 'ADMIN REGISTERED' : 'SELF REGISTERED'}
                      </span>
                    </td>
                    <td className="p-4">
                      {reg.is_attended ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Hadir ({reg.attended_at ? new Date(reg.attended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''})
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">Belum Hadir</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleAttendance(reg.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                          reg.is_attended
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        }`}
                      >
                        {reg.is_attended ? 'Batalkan Presensi' : 'Tandai Hadir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB BUDGET (RAB vs REALISASI) */}
      {activeTab === 'rab' && (
        <div className="space-y-4 print:hidden">
          <div className="flex justify-between items-center bg-white dark:bg-[#160e29] p-4 rounded-2xl border border-purple-100 dark:border-purple-900/60 shadow-sm">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">RAB & Realisasi Pengeluaran</h4>
              <p className="text-xs text-slate-500">RAB: Rp {totalRAB.toLocaleString('id-ID')} | Realisasi: Rp {totalRealisasi.toLocaleString('id-ID')}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
              >
                <FileSpreadsheet size={16} />
                <span>Export Excel (.csv)</span>
              </button>

              <button
                onClick={() => setIsBudgetModalOpen(true)}
                className="gradient-mnsbdi text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <PlusCircle size={14} />
                <span>Tambah Item Anggaran</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 space-y-3 shadow-sm">
              <h5 className="font-extrabold text-purple-700 dark:text-purple-300 text-xs uppercase tracking-wider border-b border-purple-100 dark:border-purple-900/60 pb-2">
                Rencana Anggaran Biaya (RAB)
              </h5>
              {rabItems.map(b => (
                <div key={b.id} className="flex justify-between text-xs p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{b.item_name}</span>
                  <span className="font-mono font-extrabold text-purple-900 dark:text-purple-200">Rp {Number(b.amount).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 space-y-3 shadow-sm">
              <h5 className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs uppercase tracking-wider border-b border-purple-100 dark:border-purple-900/60 pb-2">
                Pengeluaran Realisasi
              </h5>
              {realisasiItems.map(b => (
                <div key={b.id} className="flex justify-between text-xs p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{b.item_name}</span>
                  <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-300">Rp {Number(b.amount).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB LAPORAN EVENT & EXPORT */}
      {activeTab === 'laporan' && (
        <div className="space-y-6 print:hidden">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#160e29] border border-purple-100 dark:border-purple-900/60 space-y-4 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 dark:border-purple-900/60 pb-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Pusat Laporan & Export Dokumen Event
                </h4>
                <p className="text-xs text-slate-500">Cetak dokumen PDF proposal perencanaan, laporan pertanggungjawaban (LPJ), dan export data keuangan ke Excel</p>
              </div>

              <button
                onClick={handleExportExcel}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-2 shadow cursor-pointer shrink-0 transition"
              >
                <FileSpreadsheet size={16} />
                <span>Export Excel (.csv)</span>
              </button>
            </div>

            {/* EXPORT OPTIONS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: PDF Laporan Perencanaan (Sebelum Realisasi / Proposal) */}
              <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-200">
                    Dokumen Perencanaan
                  </span>
                  <Printer size={18} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-sm">PDF Laporan Perencanaan (Proposal Event)</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                    Mencakup Rincian Event, Hierarki Kepanitiaan (Ketua, Sekben, PJ Acara, PJ Umum, Sub-Bagian, VIP), dan Rencana Anggaran Biaya (RAB).
                  </p>
                </div>
                <button
                  onClick={() => openPdfReportModal('proposal')}
                  className="w-full py-2 rounded-xl gradient-mnsbdi text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Preview & Cetak PDF Proposal</span>
                </button>
              </div>

              {/* Option 2: PDF Laporan Pertanggungjawaban (Setelah Realisasi / LPJ) */}
              <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    Dokumen Pasca-Event
                  </span>
                  <Printer size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-900 dark:text-white text-sm">PDF Laporan Pertanggungjawaban (LPJ)</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                    Mencakup Rincian Event, Rekapitulasi Presensi Kehadiran Umat, Perbandingan RAB vs Realisasi, Selisih Anggaran, dan Kolom Tanda Tangan.
                  </p>
                </div>
                <button
                  onClick={() => openPdfReportModal('lpj')}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Preview & Cetak PDF LPJ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE PDF REPORT MODAL TEMPLATE (BULLETPROOF VISIBILITY IN ALL BROWSERS) */}
      {isPdfModalOpen && (
        <div id="printable-pdf-document-wrapper" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden relative border border-purple-200">
            {/* STICKY TOOLBAR AT THE TOP OF MODAL (ALWAYS VISIBLE & ACCESSIBLE) */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-purple-100 px-6 py-3 flex justify-between items-center shadow-sm print:hidden">
              <span className="text-xs font-black text-purple-950 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                Pratinjau Dokumen Cetak PDF • {pdfMode === 'proposal' ? 'Laporan Perencanaan Proposal' : 'Laporan Pertanggungjawaban (LPJ)'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow cursor-pointer transition"
                >
                  <Printer size={16} />
                  <span>Cetak / Save PDF</span>
                </button>

                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer flex items-center gap-1 text-xs"
                  title="Tutup Pratinjau Dokumen"
                >
                  <X size={18} />
                  <span>Tutup</span>
                </button>
              </div>
            </div>

            {/* PRINTABLE DOCUMENT BODY (SPACIOUS ELEGANT A4 FORMAT) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              <div id="printable-pdf-document" className="space-y-6 text-slate-900 font-sans p-2">
                {/* KOP DOKUMEN MNSBDI */}
                <div className="border-b-4 border-purple-900 pb-4 flex justify-between items-center print-avoid-break">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-mnsbdi flex items-center justify-center text-white font-black text-2xl shadow">
                      🪷
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-purple-950 tracking-wide uppercase">SISTEM INFORMASI VIHARA MNSBDI</h2>
                      <p className="text-xs font-bold text-slate-600">Majelis Nichiren Shoshu Buddha Dharma Indonesia</p>
                      <p className="text-[10px] text-slate-400">Sekretariat Utama • Dokumen Resmi Terverifikasi</p>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1">
                    <span className="inline-block px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow">
                      {pdfMode === 'proposal' ? 'PROPOSAL PERENCANAAN' : 'LAPORAN PERTANGGUNGJAWABAN'}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-500">Tgl Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* JUDUL LAPORAN */}
                <div className="text-center space-y-1 py-2.5 bg-purple-50 rounded-xl border border-purple-200 print-avoid-break">
                  <h3 className="text-lg font-black text-purple-950">{event.title}</h3>
                  <p className="text-xs text-slate-600">Kategori: <strong>{event.category}</strong> • Lokasi: <strong>{event.location}</strong></p>
                  <p className="text-xs text-slate-600">
                    Pelaksanaan: <strong>{new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                  </p>
                </div>

                {/* SECTION 1: HIERARKI STRUKTUR KEPANITIAAN & SUB-BAGIAN (HIGH-CONTRAST VISIBILITY) */}
                <div className="space-y-3 print-avoid-break">
                  <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                    I. Struktur Kepanitiaan & Pengorganisasian
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/70">
                      <p className="text-[10px] font-extrabold text-purple-900 uppercase">Ketua Panitia Utama</p>
                      <p className="font-extrabold text-purple-950 text-base">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/70">
                      <p className="text-[10px] font-extrabold text-purple-900 uppercase">Sekretaris & Bendahara (Sekben)</p>
                      <p className="font-bold text-slate-900">Sekretaris: <strong>{org?.sekretaris_name}</strong> | Bendahara: <strong>{org?.bendahara_name}</strong></p>
                    </div>
                  </div>

                  {/* SUB-BAGIAN ACARA & UMUM CARDS (EXTREMELY CLEAR TO READ) */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
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

                {/* SECTION 2: REKAPITULASI PRESENSI (HANYA PADA LPJ) */}
                {pdfMode === 'lpj' && (
                  <div className="space-y-2 print-avoid-break">
                    <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                      II. Rekapitulasi Presensi Kehadiran Umat
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

                {/* SECTION 3: KEUANGAN (RAB VS REALISASI) */}
                <div className="space-y-3 print-avoid-break">
                  <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-200 pb-1">
                    {pdfMode === 'proposal' ? 'II. Rencana Anggaran Biaya (RAB)' : 'III. Perbandingan Realisasi Keuangan vs RAB'}
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
                        const realItem = realisasiItems.find(r => r.item_name === b.item_name);
                        const realAmount = realItem ? Number(realItem.amount) : 0;
                        const selisih = Number(b.amount) - realAmount;

                        return (
                          <tr key={b.id} className="border-b border-slate-200">
                            <td className="p-2 border border-slate-300 text-center font-mono">{i + 1}</td>
                            <td className="p-2 border border-slate-300 font-semibold">{b.item_name}</td>
                            <td className="p-2 border border-slate-300 text-right font-mono font-bold text-purple-900">
                              Rp {Number(b.amount).toLocaleString('id-ID')}
                            </td>
                            {pdfMode === 'lpj' && (
                              <td className="p-2 border border-slate-300 text-right font-mono font-bold text-emerald-800">
                                Rp {realAmount.toLocaleString('id-ID')}
                              </td>
                            )}
                            {pdfMode === 'lpj' && (
                              <td className={`p-2 border border-slate-300 text-right font-mono font-bold ${selisih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                Rp {selisih.toLocaleString('id-ID')}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-purple-50 font-black text-xs">
                        <td colSpan={2} className="p-2.5 border border-slate-300 text-purple-950">TOTAL KESELURUHAN</td>
                        <td className="p-2.5 border border-slate-300 text-right font-mono text-purple-950">
                          Rp {totalRAB.toLocaleString('id-ID')}
                        </td>
                        {pdfMode === 'lpj' && (
                          <td className="p-2.5 border border-slate-300 text-right font-mono text-emerald-900">
                            Rp {totalRealisasi.toLocaleString('id-ID')}
                          </td>
                        )}
                        {pdfMode === 'lpj' && (
                          <td className="p-2.5 border border-slate-300 text-right font-mono text-purple-950">
                            Rp {(totalRAB - totalRealisasi).toLocaleString('id-ID')}
                          </td>
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* KANTONG TANDA TANGAN PENGESAHAN */}
                <div className="pt-8 border-t space-y-2 print-avoid-break signature-block">
                  <p className="text-xs text-center font-bold text-slate-500">Lembar Pengesahan Resmi Vihara MNSBDI</p>
                  <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4">
                    <div className="space-y-12">
                      <p className="font-bold">Sekretaris Panitia,</p>
                      <p className="font-extrabold text-purple-950 underline">{org?.sekretaris_name || 'Suryani Dewi'}</p>
                    </div>
                    <div className="space-y-12">
                      <p className="font-bold">Ketua Panitia Utama,</p>
                      <p className="font-extrabold text-purple-950 underline">{org?.ketua_name || 'Upasaka Hendra Kurniawan'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM CLOSE BUTTON FOR CONVENIENCE */}
              <div className="pt-4 border-t flex justify-end print:hidden">
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-xs transition cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Sub-Section Direct */}
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
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">Daftarkan Umat (Mode Admin)</h3>
            {regMsg && <div className="text-xs p-2 rounded bg-amber-100 text-amber-900 font-bold">{regMsg}</div>}
            
            <form onSubmit={handleAdminRegister} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Umat</label>
                <select
                  required
                  value={selectedUmatId}
                  onChange={(e) => setSelectedUmatId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="">-- Pilih Umat --</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.han || 'Umat'})</option>
                  ))}
                </select>
              </div>

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
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white border-b border-purple-100 dark:border-purple-900/60 pb-3">Tambah Item Anggaran</h3>
            <form onSubmit={handleAddBudget} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Item</label>
                <input
                  type="text"
                  required
                  placeholder="Konsumsi Sangha / Bunga Altar"
                  value={budgetItem}
                  onChange={(e) => setBudgetItem(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tipe Anggaran</label>
                <select
                  value={budgetType}
                  onChange={(e: any) => setBudgetType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                >
                  <option value="rab">RAB (Rencana)</option>
                  <option value="realisasi">Realisasi (Pengeluaran Aktual)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="1500000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100 dark:border-purple-900/60">
                <button type="button" onClick={() => setIsBudgetModalOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-500 cursor-pointer">Batal</button>
                <button type="submit" className="gradient-mnsbdi text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer">Simpan Anggaran</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
