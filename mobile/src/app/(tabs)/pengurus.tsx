import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Linking, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompactHeader, LargeTitle, useScrollY } from '@/components/CollapsingHeader';
import { DateTile, eventStatus } from '@/components/EventCard';
import { SearchBox } from '@/components/Field';
import { Icon } from '@/components/Icon';
import { Button, Chip, PressableScale } from '@/components/Pressables';
import { Segmented } from '@/components/Segmented';
import { ConfirmSheet, Sheet } from '@/components/Sheet';
import { RowSkeleton } from '@/components/Skeleton';
import { ErrorState, StateView } from '@/components/StateView';
import { StatusToggle } from '@/components/StatusToggle';
import { useTabBarSpace } from '@/components/TabBar';
import { Badge, Divider, FocalNumber, Panel, Txt } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { useEvents } from '@/context/events';
import { useAsync } from '@/hooks/useAsync';
import { fetchDirectory, fetchParticipants, setAttendance, setPayment } from '@/lib/api';
import { friendlyDataError } from '@/lib/errors';
import { feeFor, hasPricing, sortForList } from '@/lib/events';
import { formatShortDate, formatTime, rupiah, telNumber, waNumber } from '@/lib/format';
import { enterDown } from '@/lib/motion';
import type { Participant, Profile, ViharaEvent } from '@/lib/types';
import { radius, TAP, useTheme } from '@/theme';

type Segment = 'presensi' | 'umat';

export default function Pengurus() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const { scrollY, onScroll } = useScrollY();
  const [segment, setSegment] = useState<Segment>('presensi');
  const [umatOpened, setUmatOpened] = useState(false);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top + 40 }}>
        <StateView icon="lock" title="Khusus pengurus" message="Halaman ini hanya untuk akun pengurus yang aktif." />
      </View>
    );
  }

  const top = (
    <View style={{ paddingTop: insets.top + 12 }}>
      <LargeTitle title="Pengurus" subtitle="Presensi kegiatan dan data umat." scrollY={scrollY} />
      <Segmented
        label="Bagian halaman pengurus"
        options={[
          { value: 'presensi', label: 'Presensi' },
          { value: 'umat', label: 'Data umat' },
        ]}
        value={segment}
        onChange={(v) => {
          Haptics.selectionAsync().catch(() => {});
          if (v === 'umat') setUmatOpened(true);
          scrollY.set(0);
          setSegment(v);
        }}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      {segment === 'presensi' ? <Presensi top={top} onScroll={onScroll} /> : <Directory top={top} onScroll={onScroll} enabled={umatOpened} />}
      <CompactHeader title={segment === 'presensi' ? 'Presensi' : 'Data umat'} scrollY={scrollY} />
    </View>
  );
}

type ListProps = { top: React.ReactNode; onScroll: ReturnType<typeof useScrollY>['onScroll'] };

function Presensi({ top, onScroll }: ListProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const bottomSpace = useTabBarSpace();
  const { status: evStatus, error: evError, events, reload: reloadEvents } = useEvents();
  const { upcoming, past } = sortForList(events);
  const ordered = [...upcoming, ...past];
  const [chosenId, setChosenId] = useState<string | null>(null);
  const event = ordered.find((e) => e.id === chosenId) ?? ordered[0];
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [confirmUnpay, setConfirmUnpay] = useState<Participant | null>(null);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const parts = useAsync<Participant[]>(event ? `participants-${event.id}` : null, () => fetchParticipants(event!.id));
  const list = parts.data ?? [];

  const q = query.trim().toLowerCase();
  const shown = q
    ? list.filter((p) => (p.profile?.full_name ?? '').toLowerCase().includes(q) || (p.profile?.han ?? '').toLowerCase().includes(q))
    : list;

  const hadir = list.filter((p) => p.is_attended).length;
  const priced = event ? hasPricing(event) : false;
  let target = 0;
  let paidTotal = 0;
  let lunas = 0;
  if (event) {
    for (const p of list) {
      const fee = feeFor(event, p.profile, p);
      target += fee;
      if (p.is_paid) {
        lunas += 1;
        paidTotal += p.amount_paid ?? fee;
      }
    }
  }

  const patch = (id: string, change: Partial<Participant>) => parts.setData((prev) => (prev ? prev.map((p) => (p.id === id ? { ...p, ...change } : p)) : prev));

  const toggleHadir = async (p: Participant) => {
    if (busy[p.id]) return;
    const next = !p.is_attended;
    const before = { is_attended: p.is_attended, attended_at: p.attended_at };
    setToggleError(null);
    setBusy((b) => ({ ...b, [p.id]: true }));
    patch(p.id, { is_attended: next, attended_at: next ? new Date().toISOString() : null });
    Haptics.impactAsync(next ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await setAttendance(p.id, next);
    } catch (e) {
      patch(p.id, before);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setToggleError(`Kehadiran ${p.profile?.full_name ?? ''} belum tersimpan. ${friendlyDataError(e as { message?: string })}`);
    } finally {
      setBusy((b) => ({ ...b, [p.id]: false }));
    }
  };

  const applyLunas = async (p: Participant, next: boolean) => {
    if (!event || busy[p.id]) return;
    const amount = feeFor(event, p.profile, p);
    const before = { is_paid: p.is_paid, paid_at: p.paid_at, amount_paid: p.amount_paid };
    setToggleError(null);
    setBusy((b) => ({ ...b, [p.id]: true }));
    patch(p.id, { is_paid: next, paid_at: next ? new Date().toISOString() : null, amount_paid: next ? amount : 0 });
    Haptics.notificationAsync(next ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    try {
      await setPayment(p.id, next, amount);
    } catch (e) {
      patch(p.id, before);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setToggleError(`Pembayaran ${p.profile?.full_name ?? ''} belum tersimpan. ${friendlyDataError(e as { message?: string })}`);
    } finally {
      setBusy((b) => ({ ...b, [p.id]: false }));
    }
  };

  const header = (
    <View style={{ gap: 16, paddingBottom: 12 }}>
      {top}
      {event ? (
        <PressableScale
          onPress={() => setPicker(true)}
          haptic
          accessibilityLabel={`Kegiatan dipilih: ${event.title}, ${formatShortDate(event.event_date)}. Ketuk untuk mengganti.`}
          style={[styles.picker, { backgroundColor: c.surface, borderColor: c.line, boxShadow: c.shadowPanel }]}
        >
          <DateTile date={event.event_date} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="caption" tone="ink3">
              Kegiatan
            </Txt>
            <Txt variant="label" weight="600" numberOfLines={2}>
              {event.title}
            </Txt>
            <Txt variant="caption" tone="ink2">
              {formatShortDate(event.event_date)}, {formatTime(event.event_date)} WITA
            </Txt>
          </View>
          <View style={[styles.changeBtn, { backgroundColor: c.brandSoft }]}>
            <Txt variant="caption" tone="brandInk" weight="600">
              Ganti
            </Txt>
            <Icon name="chevronDown" size={14} color={c.brandInk} />
          </View>
        </PressableScale>
      ) : null}

      {event && parts.status === 'ready' ? (
        <Panel style={{ padding: 16, gap: 8 }}>
          <FocalNumber value={hadir} caption={`dari ${list.length} peserta sudah hadir`} />
          {priced ? (
            <View style={{ gap: 2 }}>
              <Txt variant="small" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>
                Lunas {lunas} dari {list.length} umat, terkumpul {rupiah(paidTotal)}
              </Txt>
              <Txt variant="small" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>
                Belum lunas {rupiah(Math.max(0, target - paidTotal))} ({list.length - lunas} umat)
              </Txt>
            </View>
          ) : (
            <Txt variant="small" tone="ink3">
              Kegiatan ini tanpa biaya.
            </Txt>
          )}
        </Panel>
      ) : null}

      {event && list.length > 0 ? <SearchBox value={query} onChangeText={setQuery} placeholder="Cari nama atau HAN" label="Cari peserta" /> : null}
      {toggleError ? (
        <View accessibilityLiveRegion="assertive" style={{ padding: 12, borderRadius: radius.control, backgroundColor: c.dangerSoft }}>
          <Txt variant="small" tone="danger">
            {toggleError}
          </Txt>
        </View>
      ) : null}
    </View>
  );

  let empty: React.ReactElement | undefined;
  if (evStatus === 'loading' || (event && parts.status === 'loading')) {
    empty = (
      <View style={{ gap: 12 }}>
        <RowSkeleton />
        <RowSkeleton />
        <RowSkeleton />
      </View>
    );
  } else if (evStatus === 'error') {
    empty = <ErrorState message={evError} onRetry={reloadEvents} />;
  } else if (!event) {
    empty = <StateView title="Belum ada kegiatan" message="Buat kegiatan di web pengurus, lalu kembali ke sini untuk mencatat presensi." />;
  } else if (parts.status === 'error') {
    empty = <ErrorState message={parts.error} onRetry={parts.reload} />;
  } else if (list.length === 0) {
    empty = <StateView icon="users" title="Belum ada peserta" message="Umat yang mendaftar, atau didaftarkan pengurus di web, akan tampil di sini." />;
  } else if (shown.length === 0) {
    empty = <StateView icon="search" title="Tidak ditemukan" message={`Tidak ada peserta yang cocok dengan "${query}".`} actionLabel="Hapus pencarian" onAction={() => setQuery('')} />;
  }

  return (
    <>
      <Animated.FlatList
        data={parts.status === 'ready' ? shown : []}
        keyExtractor={(p) => p.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomSpace }}
        refreshControl={
          <RefreshControl
            refreshing={parts.refreshing}
            onRefresh={() => {
              parts.reload();
              reloadEvents();
            }}
            tintColor={c.brand}
            progressViewOffset={insets.top}
          />
        }
        renderItem={({ item, index }) => {
          const name = item.profile?.full_name ?? 'Umat tidak dikenal';
          const fee = event ? feeFor(event, item.profile, item) : 0;
          const meta = [item.profile?.bagian || 'Inspirasi', item.profile?.han ? `HAN ${item.profile.han}` : null].filter(Boolean).join(' · ');
          return (
            <Animated.View entering={enterDown(index, reduce)} style={{ marginBottom: 12 }}>
              <Panel style={{ padding: 14, gap: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  <Txt variant="label" tone="ink3" style={{ minWidth: 26, fontVariant: ['tabular-nums'] }}>
                    {list.indexOf(item) + 1}.
                  </Txt>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt variant="label" weight="600">
                      {name}
                    </Txt>
                    <Txt variant="caption" tone="ink2">
                      {meta}
                    </Txt>
                    {item.registration_method === 'admin' ? (
                      <Txt variant="caption" tone="ink3">
                        Didaftarkan pengurus
                      </Txt>
                    ) : null}
                  </View>
                  {priced ? (
                    <Txt variant="label" weight="600" style={{ fontVariant: ['tabular-nums'] }}>
                      {fee > 0 ? rupiah(fee) : 'Gratis'}
                    </Txt>
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <StatusToggle kind="hadir" done={item.is_attended} onPress={() => toggleHadir(item)} disabled={busy[item.id]} who={name} />
                  {priced ? (
                    <StatusToggle
                      kind="lunas"
                      done={Boolean(item.is_paid)}
                      onPress={() => (item.is_paid ? setConfirmUnpay(item) : applyLunas(item, true))}
                      disabled={busy[item.id]}
                      who={name}
                    />
                  ) : null}
                </View>
              </Panel>
            </Animated.View>
          );
        }}
      />

      <Sheet visible={picker} onClose={() => setPicker(false)} title="Pilih kegiatan" scroll>
        {ordered.map((e, i) => (
          <PickerRow
            key={e.id}
            event={e}
            selected={e.id === event?.id}
            divider={i > 0}
            onPress={() => {
              setChosenId(e.id);
              setQuery('');
              setToggleError(null);
              setPicker(false);
            }}
          />
        ))}
      </Sheet>

      <ConfirmSheet
        visible={confirmUnpay !== null}
        title="Batalkan status lunas?"
        message={`Pembayaran ${confirmUnpay?.profile?.full_name ?? 'umat ini'} akan dicatat belum lunas dan jumlah terbayar menjadi Rp 0.`}
        confirmLabel="Ya, belum lunas"
        cancelLabel="Tetap lunas"
        onConfirm={() => {
          const p = confirmUnpay;
          setConfirmUnpay(null);
          if (p) applyLunas(p, false);
        }}
        onCancel={() => setConfirmUnpay(null)}
      />
    </>
  );
}

function PickerRow({ event, selected, divider, onPress }: { event: ViharaEvent; selected: boolean; divider: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const st = eventStatus(event, false, undefined);
  return (
    <View>
      {divider ? <Divider /> : null}
      <PressableScale
        onPress={onPress}
        pressedScale={0.985}
        accessibilityLabel={`${event.title}, ${formatShortDate(event.event_date)}${selected ? ', dipilih' : ''}`}
        accessibilityState={{ selected }}
        style={{ minHeight: 60, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Txt variant="label" weight={selected ? '700' : '500'} tone={selected ? 'brandInk' : 'ink'} numberOfLines={2}>
            {event.title}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Txt variant="caption" tone="ink3">
              {formatShortDate(event.event_date)}
            </Txt>
            {st.label === 'Draf' || st.label === 'Selesai' ? <Badge label={st.label} tone={st.tone} /> : null}
          </View>
        </View>
        {selected ? <Icon name="check" size={20} color={c.brand} /> : null}
      </PressableScale>
    </View>
  );
}

type FilterKey = 'sentra' | 'cetya' | 'han' | 'bagian';
const FILTER_LABEL: Record<FilterKey, string> = { sentra: 'Sentra', cetya: 'Cetya', han: 'HAN', bagian: 'Bagian' };

function Directory({ top, onScroll, enabled }: ListProps & { enabled: boolean }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const bottomSpace = useTabBarSpace();
  const dir = useAsync<Profile[]>(enabled ? 'directory' : null, fetchDirectory);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

  const all = dir.data ?? [];

  // Options narrow as filters are chosen: cetya within the sentra, HAN within the cetya.
  const optionsFor = (key: FilterKey) => {
    const pool = all.filter((p) => {
      if (key !== 'sentra' && filters.sentra && p.sentra !== filters.sentra) return false;
      if ((key === 'han' || key === 'bagian') && filters.cetya && p.cetya !== filters.cetya) return false;
      return true;
    });
    return [...new Set(pool.map((p) => p[key]).filter((v): v is NonNullable<typeof v> => Boolean(v)))].sort((a, b) => String(a).localeCompare(String(b), 'id'));
  };

  const q = query.trim().toLowerCase();
  const shown = all.filter((p) => {
    for (const k of Object.keys(filters) as FilterKey[]) {
      if (filters[k] && p[k] !== filters[k]) return false;
    }
    if (!q) return true;
    const digits = q.replace(/\D/g, '');
    if (digits && (p.phone ?? '').replace(/\D/g, '').includes(digits)) return true;
    return p.full_name.toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q);
  });
  const activeCount = Object.values(filters).filter(Boolean).length;

  const setFilter = (key: FilterKey, value: string | undefined) => {
    setFilters((f) => {
      const next = { ...f, [key]: value };
      // A narrower filter that no longer fits the broader one is dropped.
      if (key === 'sentra') {
        delete next.cetya;
        delete next.han;
      }
      if (key === 'cetya') delete next.han;
      return next;
    });
    setOpenFilter(null);
  };

  const header = (
    <View style={{ gap: 14, paddingBottom: 12 }}>
      {top}
      <SearchBox value={query} onChangeText={setQuery} placeholder="Cari nama, nomor HP, atau email" label="Cari umat" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {(Object.keys(FILTER_LABEL) as FilterKey[]).map((k) => (
          <Chip key={k} label={filters[k] ? `${FILTER_LABEL[k]}: ${filters[k]}` : FILTER_LABEL[k]} selected={Boolean(filters[k])} onPress={() => setOpenFilter(k)} />
        ))}
        {activeCount > 0 ? <Button label="Reset filter" variant="ghost" onPress={() => setFilters({})} /> : null}
      </View>
      {dir.status === 'ready' ? (
        <Txt variant="small" tone="ink3" style={{ fontVariant: ['tabular-nums'] }} accessibilityLiveRegion="polite">
          {shown.length} dari {all.length} umat
        </Txt>
      ) : null}
    </View>
  );

  let empty: React.ReactElement | undefined;
  if (dir.status === 'loading' || dir.status === 'idle') {
    empty = (
      <View style={{ gap: 12 }}>
        <RowSkeleton />
        <RowSkeleton />
      </View>
    );
  } else if (dir.status === 'error') {
    empty = <ErrorState message={dir.error} onRetry={dir.reload} />;
  } else if (all.length === 0) {
    empty = <StateView icon="users" title="Data umat kosong" message="Tambahkan umat lewat menu Data Umat di web pengurus." />;
  } else if (shown.length === 0) {
    empty = (
      <StateView
        icon="search"
        title="Tidak ada yang cocok"
        message="Ubah kata pencarian atau kurangi filter."
        actionLabel="Reset pencarian"
        onAction={() => {
          setQuery('');
          setFilters({});
        }}
      />
    );
  }

  return (
    <>
      <Animated.FlatList
        data={dir.status === 'ready' ? shown : []}
        keyExtractor={(p) => p.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        initialNumToRender={12}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomSpace }}
        refreshControl={<RefreshControl refreshing={dir.refreshing} onRefresh={dir.reload} tintColor={c.brand} progressViewOffset={insets.top} />}
        renderItem={({ item, index }) => <UmatCard profile={item} index={index} reduce={reduce} />}
      />
      <Sheet visible={openFilter !== null} onClose={() => setOpenFilter(null)} title={openFilter ? `Pilih ${FILTER_LABEL[openFilter]}` : ''} scroll>
        {openFilter ? (
          <>
            <OptionRow label={`Semua ${FILTER_LABEL[openFilter]}`} selected={!filters[openFilter]} onPress={() => setFilter(openFilter, undefined)} />
            {optionsFor(openFilter).map((o) => (
              <OptionRow key={String(o)} label={String(o)} selected={filters[openFilter] === o} onPress={() => setFilter(openFilter, String(o))} divider />
            ))}
          </>
        ) : null}
      </Sheet>
    </>
  );
}

function OptionRow({ label, selected, onPress, divider }: { label: string; selected: boolean; onPress: () => void; divider?: boolean }) {
  const { c } = useTheme();
  return (
    <View>
      {divider ? <Divider /> : null}
      <PressableScale
        onPress={onPress}
        pressedScale={0.985}
        accessibilityLabel={label}
        accessibilityState={{ selected }}
        style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12 }}
      >
        <Txt variant="body" weight={selected ? '600' : '400'} tone={selected ? 'brandInk' : 'ink'} style={{ flex: 1 }}>
          {label}
        </Txt>
        {selected ? <Icon name="check" size={20} color={c.brand} /> : null}
      </PressableScale>
    </View>
  );
}

function UmatCard({ profile: p, index, reduce }: { profile: Profile; index: number; reduce: boolean }) {
  const { c } = useTheme();
  const meta = [p.bagian, p.han ? `HAN ${p.han}` : null, p.cetya].filter(Boolean).join(' · ');
  const phone = p.phone?.trim();
  return (
    <Animated.View entering={enterDown(index, reduce)} style={{ marginBottom: 12 }}>
      <Panel style={{ padding: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="label" weight="600">
              {p.full_name}
            </Txt>
            {meta ? (
              <Txt variant="caption" tone="ink2">
                {meta}
              </Txt>
            ) : null}
            <Txt variant="caption" tone="ink3">
              {phone || 'Nomor HP belum diisi'}
              {p.sentra ? ` · ${p.sentra}` : ''}
            </Txt>
          </View>
          <View style={{ gap: 4, alignItems: 'flex-end' }}>
            {p.role === 'admin' ? <Badge label="Pengurus" tone="brand" /> : null}
            {p.is_active === false ? <Badge label="Nonaktif" tone="gold" /> : null}
          </View>
        </View>
        {phone ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="Telepon"
              icon="phone"
              variant="secondary"
              style={{ flex: 1 }}
              accessibilityLabel={`Telepon ${p.full_name}`}
              onPress={() => Linking.openURL(`tel:${telNumber(phone)}`).catch(() => {})}
            />
            <Button
              label="WhatsApp"
              icon="message"
              variant="success"
              style={{ flex: 1 }}
              accessibilityLabel={`Kirim WhatsApp ke ${p.full_name}`}
              onPress={() => Linking.openURL(`https://wa.me/${waNumber(phone)}`).catch(() => {})}
            />
          </View>
        ) : null}
      </Panel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  picker: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.panel, borderWidth: StyleSheet.hairlineWidth, minHeight: TAP },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, minHeight: 32, borderRadius: radius.control },
});
