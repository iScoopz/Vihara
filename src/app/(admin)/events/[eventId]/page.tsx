'use client'

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  CalendarDays, 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Receipt, 
  FileText, 
  UserCheck, 
  Layers,
  Printer,
  ListTodo,
  Globe,
  Send,
  FileEdit,
  Users,
  Copy,
  Check,
  CheckCircle2
} from 'lucide-react';
import { 
  getEventDetailPageBundle,
  registerForEvent, 
  cancelRegistration,
  toggleAttendance, 
  addBudgetItem, 
  deleteBudgetItem,
  deleteBudgetItems,
  updateGroupedBudget,
  addSubSectionToOrg,
  updateSubSectionInOrg,
  deleteSubSectionFromOrg,
  addProposalRundown,
  updateProposalRundown,
  deleteProposalRundown,
  addSkenarioKerja,
  updateSkenarioKerja,
  deleteSkenarioKerja,
  togglePublishEvent,
  toggleRegistrationPayment,
  updateRegistrationExtraFees,
  toggleCompleteEvent
} from '@/lib/actions/vihara-actions';
import { ViharaEvent, Profile, EventRegistration, EventProposalRundown, EventSkenarioKerja } from '@/types/database';

import { EventOverviewTab } from '@/components/events/EventOverviewTab';
import { EventPanitiaTab } from '@/components/events/EventPanitiaTab';
import { EventProposalRundownTab } from '@/components/events/EventProposalRundownTab';
import { EventSkenarioKerjaTab } from '@/components/events/EventSkenarioKerjaTab';
import { EventPresensiTab } from '@/components/events/EventPresensiTab';
import { EventRABTab, GroupedBudgetItem } from '@/components/events/EventRABTab';
import { EventLaporanTab } from '@/components/events/EventLaporanTab';
import { EventPdfModal } from '@/components/events/EventPdfModal';
import { EventModals } from '@/components/events/EventModals';
import { EventPricingModal } from '@/components/events/EventPricingModal';

import { useToast } from '@/components/ui/ToastNotification';

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const { showToast } = useToast();

  const [event, setEvent] = useState<ViharaEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bidang' | 'rundown' | 'skenario' | 'rab' | 'registrasi' | 'laporan'>('overview');

  // Modals visibility
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [copiedWa, setCopiedWa] = useState(false);

  const handleCopyWaList = () => {
    if (!event) return;
    const dateStr = new Date(event.event_date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let waText = `*DAFTAR PESERTA EVENT: ${event.title.toUpperCase()}*\n`;
    waText += `📅 Tanggal: ${dateStr}\n`;
    waText += `📍 Lokasi: ${event.location}\n`;
    waText += `👥 Total: ${registrations.length} Umat\n\n`;

    const sortedRegs = [...registrations].sort((a, b) => {
      const nameA = a.profile?.full_name || '';
      const nameB = b.profile?.full_name || '';
      return nameA.localeCompare(nameB);
    });

    sortedRegs.forEach((r, idx) => {
      waText += `${idx + 1}. ${r.profile?.full_name || 'Umat Vihara'}\n`;
    });

    if (navigator.clipboard) {
      navigator.clipboard.writeText(waText.trim());
      setCopiedWa(true);
      setTimeout(() => setCopiedWa(false), 3000);
    }
  };

  // Proposal Rundown Modal State
  const [isProposalRundownModalOpen, setIsProposalRundownModalOpen] = useState(false);
  const [editingProposalRundown, setEditingProposalRundown] = useState<EventProposalRundown | null>(null);
  const [prDate, setPrDate] = useState('');
  const [prStartTime, setPrStartTime] = useState('08:00');
  const [prEndTime, setPrEndTime] = useState('09:30');
  const [prActivity, setPrActivity] = useState('');
  const [prNotes, setPrNotes] = useState('');

  // Skenario Kerja (SK) Modal State
  const [isSkenarioKerjaModalOpen, setIsSkenarioKerjaModalOpen] = useState(false);
  const [editingSkenarioKerja, setEditingSkenarioKerja] = useState<EventSkenarioKerja | null>(null);
  const [skPhaseTag, setSkPhaseTag] = useState('H-1');
  const [skDate, setSkDate] = useState('');
  const [skStartTime, setSkStartTime] = useState('14:00');
  const [skEndTime, setSkEndTime] = useState('17:00');
  const [skExecutorBidangPj, setSkExecutorBidangPj] = useState('');
  const [skActivity, setSkActivity] = useState('');
  const [skInterbidBidangPj, setSkInterbidBidangPj] = useState('');
  const [skNotes, setSkNotes] = useState('');

  // PDF Printable Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfMode, setPdfMode] = useState<'proposal' | 'lpj' | 'peserta'>('proposal');

  // Forms
  const [selectedUmatId, setSelectedUmatId] = useState('');
  const [regMsg, setRegMsg] = useState('');

  // Budget Form
  const [budgetItem, setBudgetItem] = useState('');
  const [budgetType, setBudgetType] = useState<'rab' | 'realisasi' | 'pemasukan'>('pemasukan');
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

  // Edit Budget Modal State
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
  const [editingGroupedBudget, setEditingGroupedBudget] = useState<GroupedBudgetItem | null>(null);
  const [editBudgetName, setEditBudgetName] = useState('');
  const [editRabAmount, setEditRabAmount] = useState('');
  const [editRealisasiAmount, setEditRealisasiAmount] = useState('');
  const [editPemasukanAmount, setEditPemasukanAmount] = useState('');

  const loadData = async () => {
    const bundle = await getEventDetailPageBundle(eventId);
    if (!bundle.event) return;
    setEvent(bundle.event);
    setRegistrations(bundle.registrations);
    setProfiles(bundle.profiles);
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
      showToast(res.error, 'error', 'Gagal Mendaftarkan Umat');
    } else {
      setRegMsg('✓ Umat berhasil didaftarkan oleh Admin');
      showToast('Umat berhasil didaftarkan ke event ini.', 'success', 'Pendaftaran Berhasil');
      setTimeout(() => setRegMsg(''), 3000);
      setIsRegModalOpen(false);
      loadData();
    }
  };

  const handleCancelRegistration = async (regId: string) => {
    await cancelRegistration(regId);
    showToast('Pendaftaran umat telah dibatalkan dari event ini.', 'info', 'Pembatalan Pendaftaran');
    loadData();
  };

  const handleToggleAttendance = async (regId: string) => {
    const res = await toggleAttendance(regId);
    showToast(
      res.is_attended ? 'Presensi kehadiran umat ditandai HADIR.' : 'Presensi kehadiran ditandai ABSEN.',
      'success',
      'Update Presensi'
    );
    loadData();
  };

  const handleTogglePayment = async (regId: string, amount?: number) => {
    await toggleRegistrationPayment(regId, amount);
    loadData();
  };

  const handleToggleExtraFeeForReg = async (regId: string, feeId: string, newSelectedIds: string[], newTotalAmount: number) => {
    await updateRegistrationExtraFees(regId, newSelectedIds, newTotalAmount);
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

  const handleOpenBudgetModal = (initialName?: string, initialType?: 'rab' | 'realisasi' | 'pemasukan') => {
    setBudgetItem(initialName || '');
    setBudgetType(initialType || 'pemasukan');
    setBudgetAmount('');
    setIsBudgetModalOpen(true);
  };

  const handleOpenEditBudgetModal = (item: GroupedBudgetItem) => {
    setEditingGroupedBudget(item);
    setEditBudgetName(item.itemName);
    setEditRabAmount(item.rab > 0 ? String(item.rab) : '');
    setEditRealisasiAmount(item.realisasi > 0 ? String(item.realisasi) : '');
    setEditPemasukanAmount(item.pemasukan > 0 ? String(item.pemasukan) : '');
    setIsEditBudgetModalOpen(true);
  };

  const handleSaveEditBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroupedBudget) return;
    await updateGroupedBudget(event.id, {
      itemName: editBudgetName,
      rabId: editingGroupedBudget.rabId,
      rabAmount: Number(editRabAmount) || 0,
      realisasiId: editingGroupedBudget.realisasiId,
      realisasiAmount: Number(editRealisasiAmount) || 0,
      pemasukanId: editingGroupedBudget.pemasukanId,
      pemasukanAmount: Number(editPemasukanAmount) || 0,
    });
    showToast('Perubahan item keuangan berhasil disimpan.', 'success', 'Item Keuangan Diperbarui');
    setIsEditBudgetModalOpen(false);
    setEditingGroupedBudget(null);
    loadData();
  };

  const handleDeleteBudgetItems = async (ids: string[]) => {
    await deleteBudgetItems(ids, event.id);
    showToast('Item keuangan berhasil dihapus secara total.', 'success', 'Item Dihapus');
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
    const defaultDateStr = event.event_date ? event.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
    if (item) {
      setEditingProposalRundown(item);
      setPrDate(defaultDateStr);
      const times = item.time_slot.split(' - ');
      setPrStartTime(times[0] || '08:00');
      setPrEndTime(times[1] || '09:30');
      setPrActivity(item.activity);
      setPrNotes(item.notes || '');
    } else {
      setEditingProposalRundown(null);
      setPrDate(defaultDateStr);
      setPrStartTime('08:00');
      setPrEndTime('09:30');
      setPrActivity('');
      setPrNotes('');
    }
    setIsProposalRundownModalOpen(true);
  };

  const handleSaveProposalRundown = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = prDate 
      ? new Date(prDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : 'Hari Pelaksanaan';
    const formattedTime = `${prStartTime} - ${prEndTime}`;

    if (editingProposalRundown) {
      await updateProposalRundown(event.id, editingProposalRundown.id, {
        day_date: formattedDate,
        time_slot: formattedTime,
        activity: prActivity,
        notes: prNotes
      });
    } else {
      await addProposalRundown(event.id, {
        day_date: formattedDate,
        time_slot: formattedTime,
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
    const org = event.org_structure;
    const defaultDateStr = event.event_date ? event.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
    const defaultExec = org?.pj_acara_name ? `PJ Acara Utama - ${org.pj_acara_name}` : (org?.ketua_name ? `Ketua Panitia - ${org.ketua_name}` : '');
    const defaultInter = org?.pj_umum_name ? `PJ Bidang Umum Utama - ${org.pj_umum_name}` : '';

    if (item) {
      setEditingSkenarioKerja(item);
      setSkPhaseTag('H-1');
      setSkDate(defaultDateStr);
      const times = item.time_slot.split(' - ');
      setSkStartTime(times[0] || '14:00');
      setSkEndTime(times[1] || '17:00');
      setSkExecutorBidangPj(item.executor_bidang_pj);
      setSkActivity(item.activity);
      setSkInterbidBidangPj(item.interbid_bidang_pj);
      setSkNotes(item.notes || '');
    } else {
      setEditingSkenarioKerja(null);
      setSkPhaseTag('H-1');
      setSkDate(defaultDateStr);
      setSkStartTime('14:00');
      setSkEndTime('17:00');
      setSkExecutorBidangPj(defaultExec);
      setSkActivity('');
      setSkInterbidBidangPj(defaultInter);
      setSkNotes('');
    }
    setIsSkenarioKerjaModalOpen(true);
  };

  const handleSaveSkenarioKerja = async (e: React.FormEvent) => {
    e.preventDefault();
    const org = event.org_structure;
    const formattedDateStr = skDate 
      ? new Date(skDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : '';
    const formattedPhase = `${skPhaseTag} (${formattedDateStr})`;
    const formattedTime = `${skStartTime} - ${skEndTime}`;

    if (editingSkenarioKerja) {
      await updateSkenarioKerja(event.id, editingSkenarioKerja.id, {
        day_phase: formattedPhase,
        time_slot: formattedTime,
        executor_bidang_pj: skExecutorBidangPj || (org?.pj_acara_name ? `PJ Acara Utama - ${org.pj_acara_name}` : 'Bidang Acara'),
        activity: skActivity,
        interbid_bidang_pj: skInterbidBidangPj || (org?.pj_umum_name ? `PJ Bidang Umum Utama - ${org.pj_umum_name}` : 'Bidang Umum'),
        notes: skNotes
      });
    } else {
      await addSkenarioKerja(event.id, {
        day_phase: formattedPhase,
        time_slot: formattedTime,
        executor_bidang_pj: skExecutorBidangPj || (org?.pj_acara_name ? `PJ Acara Utama - ${org.pj_acara_name}` : 'Bidang Acara'),
        activity: skActivity,
        interbid_bidang_pj: skInterbidBidangPj || (org?.pj_umum_name ? `PJ Bidang Umum Utama - ${org.pj_umum_name}` : 'Bidang Umum'),
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

  const handleTogglePublish = async () => {
    if (!event) return;
    await togglePublishEvent(event.id);
    loadData();
  };

  const handleToggleComplete = async () => {
    if (!event) return;
    await toggleCompleteEvent(event.id);
    loadData();
  };

  const isPastEvent = new Date(event.event_date) < new Date();
  const isPublished = event.is_published ?? false;
  const isCompleted = event.is_completed ?? false;

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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {event.title}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
              isCompleted
                ? 'bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                : isPublished
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
            }`}>
              {isCompleted ? '🏁 Event Selesai (Arsip)' : isPublished ? '✓ Diterbitkan (Publik)' : '📝 Draf / Perencanaan'}
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
            type="button"
            onClick={handleCopyWaList}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md border ${
              copiedWa
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 border-emerald-200 dark:border-emerald-800'
            }`}
            title="Salin daftar pendaftar event berbentuk teks siap kirim ke WhatsApp"
          >
            {copiedWa ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedWa ? '✓ Copied List WA!' : 'Salin List WA'}</span>
          </button>

          <button
            onClick={handleToggleComplete}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-md border ${
              isCompleted
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 hover:bg-amber-200 border-amber-300 dark:border-amber-800'
                : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>{isCompleted ? 'Buka Kembali Event' : 'Tandai Event Selesai'}</span>
          </button>

          {/* Top Actions Buttons (Scrollable on Mobile) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto scrollbar-none pb-1 w-full sm:w-auto">
            <button
              onClick={handleTogglePublish}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border shrink-0 ${
                isPublished
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-800'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700 shadow'
              }`}
            >
              {isPublished ? <FileEdit size={14} /> : <Globe size={14} />}
              <span>{isPublished ? 'Kembalikan ke Draf' : 'Terbitkan Event ke Umat'}</span>
            </button>

            <button
              onClick={() => {
                setPdfMode('peserta');
                setIsPdfModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-emerald-200 dark:border-emerald-800 shrink-0"
            >
              <Users size={14} />
              <span>Cetak List Peserta</span>
            </button>

            {(event.is_complex ?? true) && (
              <>
                <button
                  onClick={() => {
                    setPdfMode('proposal');
                    setIsPdfModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 hover:bg-purple-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-purple-200 dark:border-purple-800 shrink-0"
                >
                  <Printer size={14} />
                  <span>Cetak Proposal Event</span>
                </button>

                <button
                  onClick={() => {
                    setPdfMode('lpj');
                    setIsPdfModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 hover:bg-amber-200 text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-amber-200 dark:border-amber-800 shrink-0"
                >
                  <FileText size={14} />
                  <span>Cetak LPJ Event</span>
                </button>
              </>
            )}
          </div>
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

        {(event.is_complex ?? true) && (
          <>
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
          </>
        )}

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

        {(event.is_complex ?? true) && (
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
        )}

        <button
          onClick={() => setActiveTab('laporan')}
          className={`pb-3 px-3 font-extrabold text-xs transition flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'laporan'
              ? 'border-purple-600 text-purple-700 dark:text-purple-300'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText size={16} />
          <span>Cetak Report</span>
        </button>
      </div>

      {/* TAB CONTENT COMPONENTS */}
      {activeTab === 'overview' && (
        <EventOverviewTab event={event} registrations={registrations} />
      )}

      {activeTab === 'bidang' && (
        <EventPanitiaTab 
          event={event}
          onOpenAddSubModal={openAddSubModal}
          onOpenEditSubModal={openEditSubModal}
          onDeleteSubSection={handleDeleteSubSection}
        />
      )}

      {activeTab === 'rundown' && (
        <EventProposalRundownTab
          event={event}
          onOpenProposalRundownModal={openProposalRundownModal}
          onDeleteProposalRundown={handleDeleteProposalRundown}
        />
      )}

      {activeTab === 'skenario' && (
        <EventSkenarioKerjaTab
          event={event}
          onOpenSkenarioKerjaModal={openSkenarioKerjaModal}
          onDeleteSkenarioKerja={handleDeleteSkenarioKerja}
        />
      )}

      {activeTab === 'registrasi' && (
        <EventPresensiTab
          event={event}
          registrations={registrations}
          onOpenRegModal={() => setIsRegModalOpen(true)}
          onToggleAttendance={handleToggleAttendance}
          onTogglePayment={handleTogglePayment}
          onToggleExtraFeeForReg={handleToggleExtraFeeForReg}
          onOpenPricingModal={() => setIsPricingModalOpen(true)}
          onCancelRegistration={handleCancelRegistration}
        />
      )}

      {activeTab === 'rab' && (
        <EventRABTab
          event={event}
          registrations={registrations}
          onOpenBudgetModal={handleOpenBudgetModal}
          onOpenEditBudgetModal={handleOpenEditBudgetModal}
          onDeleteBudgetItems={handleDeleteBudgetItems}
        />
      )}

      {activeTab === 'laporan' && (
        <EventLaporanTab
          event={event}
          onOpenPdfModal={(mode) => {
            setPdfMode(mode);
            setIsPdfModalOpen(true);
          }}
        />
      )}

      {/* MODALS CONTAINER */}
      <EventModals
        event={event}
        profiles={profiles}
        
        isProposalRundownModalOpen={isProposalRundownModalOpen}
        editingProposalRundown={editingProposalRundown}
        prDate={prDate}
        setPrDate={setPrDate}
        prStartTime={prStartTime}
        setPrStartTime={setPrStartTime}
        prEndTime={prEndTime}
        setPrEndTime={setPrEndTime}
        prActivity={prActivity}
        setPrActivity={setPrActivity}
        prNotes={prNotes}
        setPrNotes={setPrNotes}
        onSaveProposalRundown={handleSaveProposalRundown}
        onCloseProposalRundownModal={() => setIsProposalRundownModalOpen(false)}

        isSkenarioKerjaModalOpen={isSkenarioKerjaModalOpen}
        editingSkenarioKerja={editingSkenarioKerja}
        skPhaseTag={skPhaseTag}
        setSkPhaseTag={setSkPhaseTag}
        skDate={skDate}
        setSkDate={setSkDate}
        skStartTime={skStartTime}
        setSkStartTime={setSkStartTime}
        skEndTime={skEndTime}
        setSkEndTime={setSkEndTime}
        skExecutorBidangPj={skExecutorBidangPj}
        setSkExecutorBidangPj={setSkExecutorBidangPj}
        skActivity={skActivity}
        setSkActivity={setSkActivity}
        skInterbidBidangPj={skInterbidBidangPj}
        setSkInterbidBidangPj={setSkInterbidBidangPj}
        skNotes={skNotes}
        setSkNotes={setSkNotes}
        onSaveSkenarioKerja={handleSaveSkenarioKerja}
        onCloseSkenarioKerjaModal={() => setIsSkenarioKerjaModalOpen(false)}

        isAddSubModalOpen={isAddSubModalOpen}
        subSectionType={subSectionType}
        subRoleName={subRoleName}
        setSubRoleName={setSubRoleName}
        subPicName={subPicName}
        setSubPicName={setSubPicName}
        onAddSubSection={handleAddSubSection}
        onCloseAddSubModal={() => setIsAddSubModalOpen(false)}

        isEditSubModalOpen={isEditSubModalOpen}
        editSubRoleName={editSubRoleName}
        setEditSubRoleName={setEditSubRoleName}
        editSubPicName={editSubPicName}
        setEditSubPicName={setEditSubPicName}
        onUpdateSubSection={handleUpdateSubSection}
        onCloseEditSubModal={() => setIsEditSubModalOpen(false)}

        isRegModalOpen={isRegModalOpen}
        selectedUmatId={selectedUmatId}
        setSelectedUmatId={setSelectedUmatId}
        registeredProfileIds={registrations.map(r => r.profile_id)}
        regMsg={regMsg}
        onAdminRegister={handleAdminRegister}
        onCloseRegModal={() => setIsRegModalOpen(false)}

        isBudgetModalOpen={isBudgetModalOpen}
        budgetItem={budgetItem}
        setBudgetItem={setBudgetItem}
        budgetType={budgetType}
        setBudgetType={setBudgetType}
        budgetAmount={budgetAmount}
        setBudgetAmount={setBudgetAmount}
        onAddBudget={handleAddBudget}
        onCloseBudgetModal={() => setIsBudgetModalOpen(false)}

        isEditBudgetModalOpen={isEditBudgetModalOpen}
        editBudgetName={editBudgetName}
        setEditBudgetName={setEditBudgetName}
        editRabAmount={editRabAmount}
        setEditRabAmount={setEditRabAmount}
        editRealisasiAmount={editRealisasiAmount}
        setEditRealisasiAmount={setEditRealisasiAmount}
        editPemasukanAmount={editPemasukanAmount}
        setEditPemasukanAmount={setEditPemasukanAmount}
        onSaveEditBudget={handleSaveEditBudget}
        onCloseEditBudgetModal={() => setIsEditBudgetModalOpen(false)}
      />

      {/* PRINTABLE PDF MODAL */}
      {isPdfModalOpen && (
        <EventPdfModal
          event={event}
          registrations={registrations}
          pdfMode={pdfMode}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {/* EVENT PRICING & EXTRA FEES MODAL */}
      <EventPricingModal
        isOpen={isPricingModalOpen}
        event={event}
        onClose={() => setIsPricingModalOpen(false)}
        onSaved={loadData}
      />
    </div>
  );
}
