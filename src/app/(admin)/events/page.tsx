'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { getEvents, toggleCompleteEvent } from '@/lib/actions/vihara-actions';
import { ViharaEvent, EventCategory } from '@/types/database';
import { Badge, Button, PageHeader, Panel, StateMessage, buttonClass, inputClass, selectClass } from '@/components/ui/kit';

export default function AdminEventsListPage() {
  const [events, setEvents] = useState<ViharaEvent[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  async function loadData() {
    setLoadState('loading');
    try {
      const data = await getEvents();
      setEvents(data);
      setLoadState('ready');
    } catch {
      setLoadState('error');
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleCompleteCard = async (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, is_completed: !ev.is_completed } : ev));
    try {
      await toggleCompleteEvent(eventId);
    } catch {
      setEvents(prev => prev.map(ev => ev.id === eventId ? { ...ev, is_completed: !ev.is_completed } : ev));
    }
  };

  const categories: EventCategory[] = ['Gongyo', 'Kensyu', 'Pertemuan'];

  const activeEventsList = events.filter(e => !e.is_completed);
  const historyEventsList = events.filter(e => e.is_completed);

  const targetList = activeTab === 'active' ? activeEventsList : historyEventsList;

  const filteredEvents = targetList.filter(ev => {
    const matchSearch = ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        ev.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || ev.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const hasFilter = searchTerm !== '' || selectedCategory !== 'all';

  const tabs = [
    { id: 'active' as const, label: 'Aktif', count: activeEventsList.length },
    { id: 'history' as const, label: 'Riwayat selesai', count: historyEventsList.length }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader
        title="Event"
        description="Gongyo, Kensyu, dan pertemuan beserta arsip kegiatan yang sudah selesai."
        actions={
          <Link href="/events/new" className={buttonClass('primary')}>
            <Plus size={15} aria-hidden />
            Buat event
          </Link>
        }
      />

      <div role="tablist" aria-label="Status event" className="flex relative overflow-x-auto overflow-y-hidden border-b border-line">
        {tabs.map(tab => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 min-h-[44px] px-3 -mb-px border-b-2 text-sm whitespace-nowrap cursor-pointer ${
                selected ? 'border-brand text-ink font-semibold' : 'border-transparent text-ink-2 font-medium hover:text-ink'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs tabular-nums text-ink-3">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_14rem] gap-2">
        <label className="relative">
          <span className="sr-only">Cari event</span>
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input
            type="search"
            placeholder="Cari judul atau lokasi"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-9`}
          />
        </label>
        <select
          aria-label="Filter kategori"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={selectClass}
        >
          <option value="all">Semua kategori ({targetList.length})</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat} ({targetList.filter(e => e.category === cat).length})
            </option>
          ))}
        </select>
      </div>

      <Panel>
        {loadState === 'loading' ? (
          <StateMessage kind="loading" title="Memuat daftar event..." />
        ) : loadState === 'error' ? (
          <StateMessage
            kind="error"
            title="Daftar event gagal dimuat."
            description="Periksa koneksi lalu coba lagi."
            action={<Button size="sm" onClick={loadData}>Coba lagi</Button>}
          />
        ) : filteredEvents.length === 0 ? (
          <StateMessage
            kind="empty"
            title={
              hasFilter
                ? 'Tidak ada event yang cocok dengan pencarian ini.'
                : activeTab === 'history'
                  ? 'Belum ada event yang selesai.'
                  : 'Belum ada event aktif.'
            }
            description={
              !hasFilter && activeTab === 'history'
                ? 'Event yang ditandai selesai akan tersimpan di sini.'
                : undefined
            }
            action={
              hasFilter ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Reset filter
                </Button>
              ) : activeTab === 'active' ? (
                <Link href="/events/new" className={buttonClass('primary', 'sm')}>Buat event</Link>
              ) : undefined
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {filteredEvents.map((ev) => {
              const regCount = ev.registrations_count || 0;
              const isComplex = ev.is_complex ?? true;

              return (
                <li key={ev.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-surface-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link href={`/events/${ev.id}`} className="text-sm font-semibold text-ink hover:underline break-words">
                        {ev.title}
                      </Link>
                      {ev.is_completed ? (
                        <Badge tone="neutral">Selesai</Badge>
                      ) : ev.is_published ? (
                        <Badge tone="ok">Diterbitkan</Badge>
                      ) : (
                        <Badge tone="gold">Draf</Badge>
                      )}
                    </div>
                    <p className="text-xs text-ink-2">
                      {new Date(ev.event_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                      {ev.location && <> · {ev.location}</>}
                    </p>
                    <p className="text-xs text-ink-3">
                      {ev.category || 'Tanpa kategori'} · {isComplex ? 'Kompleks' : 'Rutin'} ·{' '}
                      <span className="tabular-nums text-ink-2">{regCount}</span>
                      {ev.quota ? <span className="tabular-nums"> / {ev.quota}</span> : null} pendaftar
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/events/${ev.id}`} className={buttonClass('secondary', 'sm')}>
                      Buka
                    </Link>
                    <Button size="sm" variant="ghost" onClick={(e) => handleToggleCompleteCard(ev.id, e)}>
                      {ev.is_completed ? 'Aktifkan lagi' : 'Tandai selesai'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
