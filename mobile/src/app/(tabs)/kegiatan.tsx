import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import Animated, { LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompactHeader, LargeTitle, useScrollY } from '@/components/CollapsingHeader';
import { EventCard } from '@/components/EventCard';
import { Chip } from '@/components/Pressables';
import { EventCardSkeleton } from '@/components/Skeleton';
import { ErrorState, StateView } from '@/components/StateView';
import { useTabBarSpace } from '@/components/TabBar';
import { Txt } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { useEvents } from '@/context/events';
import { CATEGORIES, sortForList } from '@/lib/events';
import { enterDown } from '@/lib/motion';
import type { ViharaEvent } from '@/lib/types';
import { useTheme } from '@/theme';

type Filter = 'Semua' | (typeof CATEGORIES)[number];
const FILTERS: Filter[] = ['Semua', ...CATEGORIES];

type Row = { type: 'section'; key: string; title: string } | { type: 'event'; key: string; event: ViharaEvent; index: number };

export default function Kegiatan() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const bottomSpace = useTabBarSpace();
  const { isAdmin } = useAuth();
  const { status, error, events, counts, myRegs, refreshing, reload } = useEvents();
  const { scrollY, onScroll } = useScrollY();
  const [filter, setFilter] = useState<Filter>('Semua');

  const filtered = filter === 'Semua' ? events : events.filter((e) => e.category === filter);
  const { upcoming, past } = sortForList(filtered);

  const rows: Row[] = [];
  let i = 0;
  if (upcoming.length) {
    rows.push({ type: 'section', key: 's-up', title: 'Akan datang' });
    for (const e of upcoming) rows.push({ type: 'event', key: e.id, event: e, index: i++ });
  }
  if (past.length) {
    rows.push({ type: 'section', key: 's-past', title: 'Sudah lewat' });
    for (const e of past) rows.push({ type: 'event', key: e.id, event: e, index: i++ });
  }

  const countFor = (f: Filter) => (f === 'Semua' ? events.length : events.filter((e) => e.category === f).length);

  const header = (
    <View style={{ paddingTop: insets.top + 12 }}>
      <LargeTitle
        title="Kegiatan"
        subtitle={isAdmin ? 'Semua kegiatan, termasuk draf yang belum terbit.' : 'Gongyo, pertemuan, dan kensyu di vihara.'}
        scrollY={scrollY}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} count={status === 'ready' ? countFor(f) : undefined} />
        ))}
      </ScrollView>
    </View>
  );

  const empty =
    status === 'loading' ? (
      <View style={{ gap: 12 }}>
        {[0, 1, 2, 3].map((k) => (
          <EventCardSkeleton key={k} />
        ))}
      </View>
    ) : status === 'error' ? (
      <ErrorState message={error} onRetry={reload} />
    ) : filter === 'Semua' ? (
      <StateView title="Belum ada kegiatan" message="Kegiatan yang diterbitkan pengurus akan tampil di sini. Tarik ke bawah untuk memuat ulang." />
    ) : (
      <StateView
        title={`Tidak ada kegiatan ${filter}`}
        message="Coba kategori lain, atau lihat semua kegiatan."
        actionLabel="Tampilkan semua"
        onAction={() => setFilter('Semua')}
        icon="filter"
      />
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <Animated.FlatList
        data={status === 'ready' ? rows : []}
        keyExtractor={(r) => r.key}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomSpace }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={c.brand} progressViewOffset={insets.top} />}
        renderItem={({ item }) =>
          item.type === 'section' ? (
            <Txt variant="small" tone="ink3" weight="600" style={{ marginTop: item.key === 's-up' ? 0 : 18, marginBottom: 10 }} accessibilityRole="header">
              {item.title}
            </Txt>
          ) : (
            <Animated.View entering={enterDown(item.index, reduce)} layout={reduce ? undefined : LinearTransition.springify().damping(20)} style={{ marginBottom: 12 }}>
              <EventCard event={item.event} registered={Boolean(myRegs[item.event.id])} count={counts?.[item.event.id]} />
            </Animated.View>
          )
        }
      />
      <CompactHeader title="Kegiatan" scrollY={scrollY} />
    </View>
  );
}
