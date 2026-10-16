'use client'

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
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
  updateCoreCommittee,
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
import { ViharaEvent, Profile, EventRegistration, EventProposalRundown, EventSkenarioKerja, CoreCommittee } from '@/types/database';

import { EventOverviewTab } from '@/components/events/EventOverviewTab';
import { EventPanitiaTab } from '@/components/events/EventPanitiaTab';
import { EventProposalRundownTab } from '@/components/events/EventProposalRundownTab';
import { EventSkenarioKerjaTab } from '@/components/events/EventSkenarioKerjaTab';
import { EventPresensiTab } from '@/components/events/EventPresensiTab';
import { EventBelumDaftarTab } from '@/components/events/EventBelumDaftarTab';
import { EventRABTab, GroupedBudgetItem } from '@/components/events/EventRABTab';
import { EventLaporanTab } from '@/components/events/EventLaporanTab';
import { EventPdfModal } from '@/components/events/EventPdfModal';
import { EventModals } from '@/components/events/EventModals';
import { EventPricingModal } from '@/components/events/EventPricingModal';

import { useToast } from '@/components/ui/ToastNotification';
import { Badge, Button, Panel, RowActions, StateMessage } from '@/components/ui/kit';

type TabId = 'overview' | 'bidang' | 'rundown' | 'skenario' | 'rab' | 'registrasi' | 'belum' | 'laporan';

export default function EventDetailPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;
  const { showToast } = useToast();

  const [event, setEvent] = useState<ViharaEvent | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  // Modals visibility
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
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
    if (!bundle.event) {
      setLoadState(prev => (prev === 'ready' ? prev : 'missing'));
      return;
    }
    setEvent(bundle.event);
    setRegistrations(bundle.registrations);
    setProfiles(bundle.profiles);
    setLoadState('ready');
  };

  const initialLoad = async () => {
    setLoadState('loading');
    try {
      await loadData();
    } catch {
      setLoadState('error');
    }
  };

  useEffect(() => {
    initialLoad();
  }, [eventId]);

  const unregisteredCount = useMemo(() => {
    const registeredIds = new Set(registrations.map(r => r.profile_id));
    return profiles.filter(p => p.is_active !== false && !registeredIds.has(p.id)).length;
  }, [profiles, registrations]);

  if (!event) {
    return (
      <div className="space-y-4">
        <Link href="/events" className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft size={14} aria-hidden />
          Daftar event
        </Link>
        <Panel>
          {loadState === 'error' ? (
            <StateMessage
              kind="error"
              title="Detail event gagal dimuat."
              description="Periksa koneksi lalu coba lagi."
              action={<Button size="sm" onClick={initialLoad}>Coba lagi</Button>}
            />
          ) : loadState === 'missing' ? (
            <StateMessage kind="empty" title="Event tidak ditemukan." description="Event ini mungkin sudah dihapus." />
          ) : (
            <StateMessage kind="loading" title="Memuat detail event..." />
          )}
        </Panel>
      </div>
    );
  }

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUmatId) return;

    let adminId: string | undefined;
    try {
      adminId = JSON.parse(localStorage.getItem('vihara_admin_profile') || '{}').id;
    } catch {}
    const res = await registerForEvent(event.id, selectedUmatId, adminId);

    if (res.error) {
      setRegMsg(res.error);
      showToast(res.error, 'error', 'Gagal Mendaftarkan Umat');
    } else {
      setRegMsg('Umat berhasil didaftarkan.');
      showToast('Umat berhasil didaftarkan ke event ini.', 'success', 'Pendaftaran Berhasil');
      setTimeout(() => setRegMsg(''), 3000);
      setIsRegModalOpen(false);
      loadData();
    }
  };

  // Registers from the "Belum Daftar" tab; the row moves to the participant list on success.
  const handleQuickRegister = async (profile: Profile) => {
    let adminId: string | undefined;
    try {
      adminId = JSON.parse(localStorage.getItem('vihara_admin_profile') || '{}').id;
    } catch {}
    const res = await registerForEvent(event.id, profile.id, adminId);
    if (res.error || !res.registration) {
      showToast(res.error || 'Pendaftaran gagal.', 'error', 'Gagal mendaftarkan');
      return false;
    }
    const registration = res.registration;
    setRegistrations(prev => [...prev, { ...registration, profile }]);
    showToast(`${profile.full_name} didaftarkan.`, 'success', 'Terdaftar');
    return true;
  };

  const handleCancelRegistration = async (regId: string) => {
    const oldRegs = [...registrations];
    setRegistrations(prev => prev.filter(r => r.id !== regId));
    showToast('Pendaftaran umat telah dibatalkan dari event ini.', 'info', 'Pembatalan Pendaftaran');

    try {
      await cancelRegistration(regId);
    } catch (e) {
      setRegistrations(oldRegs);
      showToast('Gagal membatalkan pendaftaran.', 'error', 'Galat');
    }
  };

  const handleToggleAttendance = async (regId: string) => {
    let nextAttended = false;
    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        nextAttended = !r.is_attended;
        return {
          ...r,
          is_attended: nextAttended,
          attended_at: nextAttended ? new Date().toISOString() : undefined
        };
      }
      return r;
    }));

    showToast(
      nextAttended ? 'Status peserta ditandai HADIR.' : 'Status peserta ditandai BELUM HADIR.',
      'success',
      'Status Kehadiran'
    );

    try {
      await toggleAttendance(regId);
    } catch (e) {
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, is_attended: !r.is_attended } : r));
      showToast('Gagal memperbarui status kehadiran.', 'error', 'Galat');
    }
  };

  const handleTogglePayment = async (regId: string, amount?: number) => {
    let nextPaid = false;
    let oldPaid = false;
    let oldAmount = 0;

    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        oldPaid = Boolean(r.is_paid);
        oldAmount = r.amount_paid || 0;
        nextPaid = !oldPaid;
        return {
          ...r,
          is_paid: nextPaid,
          paid_at: nextPaid ? new Date().toISOString() : undefined,
          amount_paid: nextPaid ? (amount ?? oldAmount) : 0
        };
      }
      return r;
    }));

    showToast(
      nextPaid ? 'Status pembayaran ditandai LUNAS.' : 'Status pembayaran diubah menjadi BELUM LUNAS.',
      'success',
      'Status Pelunasan'
    );

    try {
      await toggleRegistrationPayment(regId, amount);
    } catch (e) {
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, is_paid: oldPaid, amount_paid: oldAmount } : r));
      showToast('Gagal memperbarui status pelunasan.', 'error', 'Galat');
    }
  };

  const handleToggleExtraFeeForReg = async (regId: string, feeId: string, newSelectedIds: string[], newTotalAmount: number) => {
    const oldRegs = [...registrations];
    setRegistrations(prev => prev.map(r => {
      if (r.id === regId) {
        return {
          ...r,
          selected_extra_fee_ids: newSelectedIds,
          amount_paid: r.is_paid ? newTotalAmount : r.amount_paid
        };
      }
      return r;
    }));

    try {
      await updateRegistrationExtraFees(regId, newSelectedIds, newTotalAmount);
    } catch (e) {
      setRegistrations(oldRegs);
      showToast('Gagal memperbarui biaya tambahan.', 'error', 'Galat');
    }
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

  const handleSaveCore = async (core: CoreCommittee) => {
    if (!event) return false;
    const res = await updateCoreCommittee(event.id, core);
    if (res.error || !res.org_structure) {
      showToast(res.error || 'Panitia inti belum tersimpan.', 'error', 'Gagal menyimpan');
      return false;
    }
    const nextOrg = res.org_structure;
    setEvent(prev => (prev ? { ...prev, org_structure: nextOrg } : prev));
    showToast('Susunan panitia inti diperbarui.', 'success', 'Tersimpan');
    return true;
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
    const nextPublished = !event.is_published;
    setEvent(prev => prev ? { ...prev, is_published: nextPublished } : null);
    showToast(
      nextPublished ? 'Event berhasil diterbitkan untuk Umat.' : 'Event dikembalikan ke status Draf.',
      'success',
      'Status Publikasi'
    );
    try {
      await togglePublishEvent(event.id);
    } catch (e) {
      setEvent(prev => prev ? { ...prev, is_published: !nextPublished } : null);
      showToast('Gagal mengubah status publikasi.', 'error', 'Galat');
    }
  };

  const handleToggleComplete = async () => {
    if (!event) return;
    const nextCompleted = !event.is_completed;
    setEvent(prev => prev ? { ...prev, is_completed: nextCompleted } : null);
    showToast(
      nextCompleted ? 'Event ditandai Selesai dan diarsipkan.' : 'Event dibuka kembali ke status Aktif.',
      'success',
      'Status Event'
    );
    try {
      await toggleCompleteEvent(event.id);
    } catch (e) {
      setEvent(prev => prev ? { ...prev, is_completed: !nextCompleted } : null);
      showToast('Gagal mengubah status event.', 'error', 'Galat');
    }
  };

  const isPublished = event.is_published ?? false;
  const isCompleted = event.is_completed ?? false;
  const isComplex = event.is_complex ?? true;

  const openPdf = (mode: 'proposal' | 'lpj' | 'peserta') => {
    setPdfMode(mode);
    setIsPdfModalOpen(true);
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'overview', label: 'Ringkasan' },
    ...(isComplex
      ? [
          { id: 'bidang' as const, label: 'Panitia' },
          { id: 'rundown' as const, label: 'Susunan acara', count: event.proposal_rundowns?.length || 0 },
          { id: 'skenario' as const, label: 'Jadwal tim', count: event.skenario_kerja?.length || 0 }
        ]
      : []),
    { id: 'registrasi', label: 'Peserta', count: registrations.length },
    { id: 'belum', label: 'Belum daftar', count: unregisteredCount },
    ...(isComplex ? [{ id: 'rab' as const, label: 'Keuangan' }] : []),
    { id: 'laporan', label: 'Dokumen' }
  ];

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const index = tabs.findIndex(t => t.id === activeTab);
    const next = tabs[(index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    setActiveTab(next.id);
    const nextTab = document.getElementById(`event-tab-${next.id}`);
    nextTab?.focus();
    nextTab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Link href="/events" className="inline-flex items-center gap-1 min-h-[44px] sm:min-h-0 text-sm text-ink-2 hover:text-ink">
          <ArrowLeft size={14} aria-hidden />
          Daftar event
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <span className="block w-8 h-[3px] rounded-full bg-gold-line" aria-hidden />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-display text-[28px] sm:text-[34px] leading-[1.1] font-semibold text-ink break-words">{event.title}</h1>
              {isCompleted ? (
                <Badge tone="neutral">Selesai</Badge>
              ) : isPublished ? (
                <Badge tone="ok">Diterbitkan</Badge>
              ) : (
                <Badge tone="gold">Draf</Badge>
              )}
            </div>
            <p className="text-sm text-ink-2">
              {new Date(event.event_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {event.location ? <> · {event.location}</> : null}
            </p>
          </div>

          {/* Phones: one wide primary action, the rest in the sheet. */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="primary" onClick={handleTogglePublish} className="flex-1">
              {isPublished ? 'Kembalikan ke draf' : 'Terbitkan'}
            </Button>
            <RowActions
              title={event.title}
              label="Aksi event lainnya"
              actions={[
                { label: isCompleted ? 'Buka kembali' : 'Tandai selesai', onSelect: handleToggleComplete },
                { label: 'Cetak peserta', icon: <Printer size={16} />, onSelect: () => openPdf('peserta') },
                { label: 'Cetak proposal', icon: <Printer size={16} />, onSelect: () => openPdf('proposal'), hidden: !isComplex },
                { label: 'Cetak LPJ', icon: <Printer size={16} />, onSelect: () => openPdf('lpj'), hidden: !isComplex }
              ]}
            />
          </div>

          <div className="hidden md:flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={handleTogglePublish}>
              {isPublished ? 'Kembalikan ke draf' : 'Terbitkan'}
            </Button>
            <Button variant={isCompleted ? 'secondary' : 'gold'} onClick={handleToggleComplete}>
              {isCompleted ? 'Buka kembali' : 'Tandai selesai'}
            </Button>
            <div role="group" aria-label="Cetak dokumen" className="flex flex-wrap items-center gap-2">
              <Button onClick={() => openPdf('peserta')}>
                <Printer size={14} aria-hidden />
                Cetak peserta
              </Button>
              {isComplex && (
                <>
                  <Button onClick={() => openPdf('proposal')}>Cetak proposal</Button>
                  <Button onClick={() => openPdf('lpj')}>Cetak LPJ</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Bagian event"
        onKeyDown={handleTabKeyDown}
        className="flex relative overflow-x-auto overflow-y-hidden border-b border-line"
      >
        {tabs.map(tab => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`event-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="event-tabpanel"
              tabIndex={selected ? 0 : -1}
              onClick={e => {
                setActiveTab(tab.id);
                e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
              }}
              className={`shrink-0 min-h-[44px] px-3 -mb-px border-b-2 text-sm whitespace-nowrap cursor-pointer ${
                selected ? 'border-brand text-ink font-semibold' : 'border-transparent text-ink-2 font-medium hover:text-ink'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && <span className="ml-1.5 text-xs tabular-nums text-ink-3">{tab.count}</span>}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="event-tabpanel" aria-labelledby={`event-tab-${activeTab}`}>
      {activeTab === 'overview' && (
        <EventOverviewTab event={event} registrations={registrations} />
      )}

      {activeTab === 'bidang' && (
        <EventPanitiaTab 
          event={event}
          profiles={profiles}
          onSaveCore={handleSaveCore}
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

      {activeTab === 'belum' && (
        <EventBelumDaftarTab
          event={event}
          profiles={profiles}
          registrations={registrations}
          onRegister={handleQuickRegister}
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
          registrations={registrations}
          onOpenPdfModal={openPdf}
        />
      )}
      </div>

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

      {isPdfModalOpen && (
        <EventPdfModal
          event={event}
          registrations={registrations}
          pdfMode={pdfMode}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      <EventPricingModal
        isOpen={isPricingModalOpen}
        event={event}
        onClose={() => setIsPricingModalOpen(false)}
        onSaved={(pricing, fees) =>
          setEvent(prev => (prev ? { ...prev, pricing_per_bagian: pricing, extra_fees: fees } : prev))
        }
      />
    </div>
  );
}
