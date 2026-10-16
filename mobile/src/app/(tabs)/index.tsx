import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScrollY } from '@/components/CollapsingHeader';
import { DateTile, eventStatus } from '@/components/EventCard';
import { FocusStatusBar } from '@/components/FocusStatusBar';
import { Icon, type IconName } from '@/components/Icon';
import { LogoMark } from '@/components/LogoMark';
import { PressableScale } from '@/components/Pressables';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState, StateView } from '@/components/StateView';
import { SunriseHeader } from '@/components/SunriseHeader';
import { useTabBarSpace } from '@/components/TabBar';
import { Badge, GoldRule, Panel, Txt } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { useEvents } from '@/context/events';
import { sortForList } from '@/lib/events';
import { firstName, formatTime, greeting, MONTHS, WEEKDAYS, witaParts } from '@/lib/format';
import { enterDown, enterRight } from '@/lib/motion';
import type { ViharaEvent } from '@/lib/types';
import { fonts, radius, TAP, useTheme } from '@/theme';

export default function Beranda() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const bottomSpace = useTabBarSpace();
  const { profile, isAdmin } = useAuth();
  const { status, error, events, counts, myRegs, refreshing, reload } = useEvents();
  const { scrollY, onScroll } = useScrollY();

  const published = events.filter((e) => e.is_published);
  const { upcoming } = sortForList(published);
  const next = upcoming[0];
  const later = upcoming.slice(1, 7);
  const heroHeight = insets.top + 320;

  const actions: { label: string; icon: IconName; href: '/kalender' | '/profil' | '/pengurus' | '/kegiatan'; hint: string }[] = [
    { label: 'Kalender', icon: 'calendar', href: '/kalender', hint: 'Kegiatan per tanggal' },
    profile
      ? { label: 'Profil', icon: 'user', href: '/profil', hint: 'Riwayat dan kontak' }
      : { label: 'Masuk', icon: 'logIn', href: '/profil', hint: 'Untuk mendaftar kegiatan' },
    isAdmin
      ? { label: 'Presensi', icon: 'clipboard', href: '/pengurus', hint: 'Hadir dan lunas' }
      : { label: 'Semua kegiatan', icon: 'list', href: '/kegiatan', hint: 'Daftar lengkap' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <FocusStatusBar style="light" />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={c.navInk} progressViewOffset={insets.top} />}
      >
        <SunriseHeader scrollY={scrollY} height={heroHeight}>
          <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 26 }}>
              <LogoMark size={38} />
              <Txt variant="label" tone="navInk2" weight="600">
                Vihara MNSBDI
              </Txt>
            </View>
            <GoldRule />
            <Txt variant="display" tone="navInk" accessibilityRole="header">
              {greeting()}
              {profile ? `,\n${firstName(profile.full_name)}` : ''}
            </Txt>
            <Txt variant="body" tone="navInk2" style={{ marginTop: 8, maxWidth: 340 }}>
              {profile ? 'Kegiatan vihara, pendaftaran, dan riwayat Anda di satu tempat.' : 'Lihat jadwal kegiatan vihara dan daftar langsung dari HP Anda.'}
            </Txt>
          </View>
        </SunriseHeader>

        <View style={{ paddingHorizontal: 16, marginTop: -28, gap: 28 }}>
          {status === 'loading' ? (
            <Panel raised style={{ padding: 18, gap: 12 }}>
              <Skeleton width={120} height={14} />
              <Skeleton width={160} height={44} />
              <Skeleton width="80%" height={18} />
              <Skeleton width="60%" height={14} />
            </Panel>
          ) : status === 'error' ? (
            <Panel raised>
              <ErrorState message={error} onRetry={reload} />
            </Panel>
          ) : next ? (
            <NextEventCard event={next} registered={Boolean(myRegs[next.id])} count={counts?.[next.id]} />
          ) : (
            <Panel raised>
              <StateView title="Belum ada kegiatan terjadwal" message="Kegiatan yang sudah diterbitkan pengurus akan muncul di sini. Tarik ke bawah untuk memuat ulang." />
            </Panel>
          )}

          {status === 'ready' && later.length > 0 ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
                <View>
                  <GoldRule />
                  <Txt variant="heading" accessibilityRole="header">
                    Akan datang
                  </Txt>
                </View>
                <PressableScale
                  onPress={() => router.navigate('/kegiatan')}
                  accessibilityRole="link"
                  accessibilityLabel="Lihat semua kegiatan"
                  style={{ minHeight: TAP, justifyContent: 'center', paddingHorizontal: 6 }}
                >
                  <Txt variant="small" tone="brandInk" weight="600">
                    Lihat semua
                  </Txt>
                </PressableScale>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }} style={{ marginHorizontal: -16, paddingLeft: 16 }}>
                {later.map((ev, i) => (
                  <Animated.View key={ev.id} entering={enterRight(i, reduce)}>
                    <MiniEventCard event={ev} registered={Boolean(myRegs[ev.id])} />
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View>
            <GoldRule />
            <Txt variant="heading" accessibilityRole="header" style={{ marginBottom: 12 }}>
              Pintasan
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {actions.map((a, i) => (
                <Animated.View key={a.label} entering={enterDown(i, reduce)} style={{ flexGrow: 1, flexBasis: 150 }}>
                  <PressableScale
                    onPress={() => router.navigate(a.href)}
                    haptic
                    accessibilityRole="link"
                    accessibilityLabel={`${a.label}. ${a.hint}`}
                    style={[styles.action, { backgroundColor: c.surface, borderColor: c.line, boxShadow: c.shadowPanel }]}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: c.brandSoft }]}>
                      <Icon name={a.icon} size={20} color={c.brandInk} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt variant="label" weight="600">
                        {a.label}
                      </Txt>
                      <Txt variant="caption" tone="ink3">
                        {a.hint}
                      </Txt>
                    </View>
                  </PressableScale>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function NextEventCard({ event, registered, count }: { event: ViharaEvent; registered: boolean; count?: number }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const p = witaParts(event.event_date);
  const status = eventStatus(event, registered, count);
  return (
    <Animated.View entering={enterDown(0, reduce)}>
      <PressableScale
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
        accessibilityLabel={`Kegiatan terdekat: ${event.title}, ${WEEKDAYS[p.weekday]} ${p.day} ${MONTHS[p.month]}, pukul ${formatTime(event.event_date)} WITA, ${event.location}. ${status.label}`}
        accessibilityHint="Buka detail kegiatan"
        pressedScale={0.985}
        style={{
          backgroundColor: c.surface,
          borderRadius: radius.modal,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
          boxShadow: c.shadowRaised,
          padding: 18,
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <Txt variant="small" tone="ink2" weight="600">
            Kegiatan terdekat
          </Txt>
          <Badge label={status.label} tone={status.tone} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <Txt maxFontSizeMultiplier={1.3} style={{ fontFamily: fonts.displayBold, fontSize: 64, lineHeight: 66, color: c.brand, fontVariant: ['tabular-nums'] }}>
            {p.day}
          </Txt>
          <View style={{ paddingBottom: 8, flex: 1 }}>
            <Txt variant="heading" style={{ fontSize: 22 }}>
              {MONTHS[p.month]} {p.year}
            </Txt>
            <Txt variant="small" tone="ink2">
              {WEEKDAYS[p.weekday]}, {formatTime(event.event_date)} WITA
            </Txt>
          </View>
        </View>
        <View style={{ gap: 6 }}>
          <Txt variant="label" weight="600" style={{ fontSize: 18, lineHeight: 24 }}>
            {event.title}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Icon name="mapPin" size={15} color={c.ink3} />
            <Txt variant="small" tone="ink2" style={{ flex: 1 }}>
              {event.location}
            </Txt>
          </View>
          {typeof count === 'number' ? (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Icon name="users" size={15} color={c.ink3} />
              <Txt variant="small" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>
                {count} peserta terdaftar{event.quota ? ` dari kuota ${event.quota}` : ''}
              </Txt>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
          <Txt variant="small" tone="brandInk" weight="600">
            {registered ? 'Lihat pendaftaran' : 'Lihat dan daftar'}
          </Txt>
          <Icon name="chevronRight" size={16} color={c.brandInk} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

function MiniEventCard({ event, registered }: { event: ViharaEvent; registered: boolean }) {
  const { c } = useTheme();
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      accessibilityLabel={`${event.title}, pukul ${formatTime(event.event_date)} WITA${registered ? ', Anda terdaftar' : ''}`}
      accessibilityHint="Buka detail kegiatan"
      style={{
        width: 220,
        minHeight: 168,
        padding: 14,
        gap: 12,
        borderRadius: radius.panel,
        backgroundColor: c.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
        boxShadow: c.shadowPanel,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <DateTile date={event.event_date} />
        {registered ? <Badge label="Terdaftar" tone="ok" /> : null}
      </View>
      <View style={{ gap: 4 }}>
        <Txt variant="label" weight="600" numberOfLines={2}>
          {event.title}
        </Txt>
        <Txt variant="caption" tone="ink2" numberOfLines={1}>
          {formatTime(event.event_date)} WITA · {event.location}
        </Txt>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  action: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.panel,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionIcon: { width: 40, height: 40, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center' },
});
