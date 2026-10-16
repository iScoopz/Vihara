import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn, SlideInLeft, SlideInRight, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompactHeader, LargeTitle, useScrollY } from '@/components/CollapsingHeader';
import { EventCard } from '@/components/EventCard';
import { Button, IconButton } from '@/components/Pressables';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState, StateView } from '@/components/StateView';
import { useTabBarSpace } from '@/components/TabBar';
import { GoldRule, Panel, Txt } from '@/components/ui';
import { useEvents } from '@/context/events';
import { dayKey, keyOf, MONTHS, WEEKDAYS, WEEKDAYS_SHORT, witaParts } from '@/lib/format';
import { enterDown } from '@/lib/motion';
import type { ViharaEvent } from '@/lib/types';
import { fonts, radius, useTheme } from '@/theme';

// Weeks start on Monday, as on Indonesian wall calendars.
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_MS = 86400000;

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

/** Each event is listed on every WITA day it spans. */
function indexByDay(events: ViharaEvent[]) {
  const map = new Map<string, ViharaEvent[]>();
  for (const e of events) {
    const start = new Date(e.event_date).getTime();
    const end = e.end_date ? Math.max(start, new Date(e.end_date).getTime()) : start;
    const keys = new Set<string>([dayKey(start)]);
    for (let t = start + DAY_MS; t < end + DAY_MS && keys.size < 31; t += DAY_MS) {
      const k = dayKey(Math.min(t, end));
      keys.add(k);
    }
    for (const k of keys) {
      const list = map.get(k);
      if (list) list.push(e);
      else map.set(k, [e]);
    }
  }
  for (const list of map.values()) list.sort((a, b) => +new Date(a.event_date) - +new Date(b.event_date));
  return map;
}

export default function Kalender() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const bottomSpace = useTabBarSpace();
  const { status, error, events, counts, myRegs, refreshing, reload } = useEvents();
  const { scrollY, onScroll } = useScrollY();

  const today = witaParts(Date.now());
  const todayKey = keyOf(today.year, today.month, today.day);
  const [cursor, setCursor] = useState({ year: today.year, month: today.month });
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selected, setSelected] = useState(todayKey);

  const byDay = indexByDay(events);

  const shift = (delta: 1 | -1) => {
    Haptics.selectionAsync().catch(() => {});
    setDirection(delta);
    setCursor(({ year, month }) => {
      const m = month + delta;
      if (m < 0) return { year: year - 1, month: 11 };
      if (m > 11) return { year: year + 1, month: 0 };
      return { year, month: m };
    });
  };

  const goToday = () => {
    setDirection(today.year * 12 + today.month >= cursor.year * 12 + cursor.month ? 1 : -1);
    setCursor({ year: today.year, month: today.month });
    setSelected(todayKey);
  };

  const swipe = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .failOffsetY([-14, 14])
    .runOnJS(true)
    .onEnd((e) => {
      if (e.translationX < -50) shift(1);
      else if (e.translationX > 50) shift(-1);
    });

  const firstWeekday = new Date(Date.UTC(cursor.year, cursor.month, 1)).getUTCDay();
  const leading = WEEK_ORDER.indexOf(firstWeekday);
  const total = daysInMonth(cursor.year, cursor.month);
  const cells: (number | null)[] = [...Array(leading).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEvents = byDay.get(selected) ?? [];
  const [sy, sm, sd] = selected.split('-').map(Number);
  const selectedWeekday = new Date(Date.UTC(sy, sm - 1, sd)).getUTCDay();
  const isCurrentMonth = cursor.year === today.year && cursor.month === today.month;
  const monthEntering = reduce ? FadeIn.duration(120) : (direction === 1 ? SlideInRight : SlideInLeft).springify().damping(22).stiffness(200);

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: bottomSpace }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={c.brand} progressViewOffset={insets.top} />}
      >
        <LargeTitle title="Kalender" subtitle="Ketuk tanggal untuk melihat kegiatannya." scrollY={scrollY} />

        <Panel style={{ paddingVertical: 12, paddingHorizontal: 6, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, paddingHorizontal: 6 }}>
            <IconButton icon="chevronLeft" onPress={() => shift(-1)} accessibilityLabel="Bulan sebelumnya" />
            <View style={{ flex: 1, alignItems: 'center' }} accessibilityLiveRegion="polite">
              <Text
                maxFontSizeMultiplier={1.4}
                accessibilityRole="header"
                style={{ fontFamily: fonts.display, fontSize: 21, color: c.ink, textAlign: 'center' }}
              >
                {MONTHS[cursor.month]} {cursor.year}
              </Text>
            </View>
            <IconButton icon="chevronRight" onPress={() => shift(1)} accessibilityLabel="Bulan berikutnya" />
          </View>

          <View style={{ flexDirection: 'row' }} aria-hidden>
            {WEEK_ORDER.map((d) => (
              <Text key={d} maxFontSizeMultiplier={1.3} style={{ flex: 1, textAlign: 'center', color: d === 0 ? c.danger : c.ink3, fontSize: 12.5, fontWeight: '600', paddingVertical: 6 }}>
                {WEEKDAYS_SHORT[d]}
              </Text>
            ))}
          </View>

          <GestureDetector gesture={swipe}>
            <Animated.View key={`${cursor.year}-${cursor.month}`} entering={monthEntering} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cells.map((day, idx) => {
                if (day === null) return <View key={`b${idx}`} style={styles.cell} />;
                const k = keyOf(cursor.year, cursor.month, day);
                const list = byDay.get(k) ?? [];
                const isSel = k === selected;
                const isToday = k === todayKey;
                const weekday = new Date(Date.UTC(cursor.year, cursor.month, day)).getUTCDay();
                return (
                  <Pressable
                    key={k}
                    onPress={() => {
                      Haptics.selectionAsync().catch(() => {});
                      setSelected(k);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${WEEKDAYS[weekday]} ${day} ${MONTHS[cursor.month]}${isToday ? ', hari ini' : ''}, ${list.length ? `${list.length} kegiatan` : 'tidak ada kegiatan'}`}
                    accessibilityState={{ selected: isSel }}
                    style={styles.cell}
                  >
                    <View
                      style={[
                        styles.day,
                        isSel && { backgroundColor: c.brand },
                        !isSel && isToday && { borderWidth: 2, borderColor: c.brand },
                        !isSel && !isToday && list.length > 0 && { backgroundColor: c.brandSoft },
                      ]}
                    >
                      <Text
                        maxFontSizeMultiplier={1.25}
                        style={{
                          fontSize: 16,
                          fontWeight: isSel || isToday ? '700' : '500',
                          color: isSel ? c.onBrand : list.length ? c.brandInk : c.ink,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {day}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 3, height: 6, marginTop: 2 }}>
                        {list.slice(0, 3).map((e) => (
                          <View
                            key={e.id}
                            style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: isSel ? c.onBrand : myRegs[e.id] ? c.ok : c.brand }}
                          />
                        ))}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </Animated.View>
          </GestureDetector>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, flexWrap: 'wrap', gap: 8, paddingHorizontal: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap', flexShrink: 1 }}>
              <Legend color={c.brand} label="Ada kegiatan" />
              <Legend color={c.ok} label="Anda terdaftar" />
            </View>
            {!isCurrentMonth || selected !== todayKey ? <Button label="Hari ini" variant="ghost" onPress={goToday} /> : null}
          </View>
        </Panel>

        <View style={{ marginTop: 24 }}>
          <GoldRule />
          <Txt variant="heading" accessibilityRole="header" style={{ marginBottom: 12 }}>
            {WEEKDAYS[selectedWeekday]}, {sd} {MONTHS[sm - 1]}
          </Txt>
          {status === 'loading' ? (
            <View style={{ gap: 10 }}>
              <Skeleton height={92} rounded={radius.panel} />
              <Skeleton height={92} rounded={radius.panel} />
            </View>
          ) : status === 'error' ? (
            <ErrorState message={error} onRetry={reload} />
          ) : selectedEvents.length === 0 ? (
            <StateView title="Tidak ada kegiatan" message="Belum ada kegiatan terjadwal pada tanggal ini. Tanggal yang berwarna ungu memiliki kegiatan." />
          ) : (
            <View style={{ gap: 12 }}>
              {selectedEvents.map((e, i) => (
                <Animated.View key={`${selected}-${e.id}`} entering={enterDown(i, reduce)}>
                  <EventCard event={e} registered={Boolean(myRegs[e.id])} count={counts?.[e.id]} />
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
      <CompactHeader title="Kalender" scrollY={scrollY} />
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Txt variant="caption" tone="ink2">
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: { width: `${100 / 7}%`, minHeight: 50, padding: 2, alignItems: 'center', justifyContent: 'center' },
  day: { width: '100%', maxWidth: 48, minHeight: 46, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 },
});
