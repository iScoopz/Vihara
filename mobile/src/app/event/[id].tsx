import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, FadeIn, FadeInDown, interpolate, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompactHeader, useScrollY } from '@/components/CollapsingHeader';
import { DateTile, eventStatus } from '@/components/EventCard';
import { FocusStatusBar } from '@/components/FocusStatusBar';
import { Icon, type IconName } from '@/components/Icon';
import { Button, IconButton } from '@/components/Pressables';
import { ConfirmSheet } from '@/components/Sheet';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState, StateView } from '@/components/StateView';
import { Badge, Divider, GoldRule, Panel, Txt } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { useEvents } from '@/context/events';
import { canSelfRegister, feeFor, hasPricing, isFinished, isFull } from '@/lib/events';
import { formatLongDate, formatTime, formatTimeRange, rupiah } from '@/lib/format';
import { radius, sunrise, useTheme } from '@/theme';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const { profile } = useAuth();
  const { status, error, events, counts, myRegs, register, cancel, pending, reload } = useEvents();
  const { scrollY, onScroll } = useScrollY();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  const event = events.find((e) => e.id === id);
  const reg = event ? myRegs[event.id] : undefined;
  const count = event ? counts?.[event.id] : undefined;

  const heroStyle = useAnimatedStyle(() => {
    if (reduce) return {};
    const y = scrollY.get();
    return {
      transform: [{ translateY: y < 0 ? y * 0.5 : y * 0.35 }, { scale: y < 0 ? 1 + -y / 600 : 1 }],
      opacity: interpolate(y, [0, 220], [1, 0.35], Extrapolation.CLAMP),
    };
  });

  const back = () => (router.canGoBack() ? router.back() : router.replace('/kegiatan'));

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas, paddingTop: insets.top + 8, paddingHorizontal: 16 }}>
        <IconButton icon="arrowLeft" onPress={back} accessibilityLabel="Kembali" />
        {status === 'loading' ? (
          <View style={{ gap: 12, marginTop: 24 }}>
            <Skeleton height={28} width="70%" />
            <Skeleton height={16} width="50%" />
            <Skeleton height={120} rounded={radius.panel} />
          </View>
        ) : status === 'error' ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <StateView title="Kegiatan tidak ditemukan" message="Kegiatan ini mungkin sudah dihapus atau belum diterbitkan." actionLabel="Kembali ke daftar" onAction={() => router.replace('/kegiatan')} />
        )}
      </View>
    );
  }

  const finished = isFinished(event);
  const full = isFull(event, count);
  const open = canSelfRegister(event);
  const st = eventStatus(event, Boolean(reg), count);
  const busy = Boolean(pending[event.id]);
  const locked = Boolean(reg && (reg.is_attended || reg.is_paid));
  const myFee = profile && hasPricing(event) ? feeFor(event, profile, reg) : null;

  const doRegister = async () => {
    setActionError(null);
    const res = await register(event);
    if (res.error) setActionError(res.error);
    else setJustRegistered(true);
  };

  const doCancel = async () => {
    setConfirmCancel(false);
    setActionError(null);
    setJustRegistered(false);
    const res = await cancel(event);
    if (res.error) setActionError(res.error);
  };

  let action: React.ReactNode;
  if (!profile) {
    action = finished ? null : <Button label="Masuk untuk mendaftar" variant="primary" size="lg" icon="logIn" onPress={() => router.navigate('/profil')} />;
  } else if (reg) {
    action = locked ? (
      <Txt variant="small" tone="ink2" style={{ textAlign: 'center' }}>
        {reg.is_attended ? 'Kehadiran Anda sudah dicatat.' : 'Pembayaran Anda sudah dicatat.'} Hubungi pengurus untuk perubahan.
      </Txt>
    ) : finished ? null : (
      <Button label="Batalkan pendaftaran" variant="danger" size="lg" onPress={() => setConfirmCancel(true)} loading={busy} />
    );
  } else if (open && !full) {
    action = <Button label="Daftar" variant="primary" size="lg" onPress={doRegister} loading={busy} accessibilityHint="Mendaftarkan Anda ke kegiatan ini" />;
  } else {
    action = (
      <Txt variant="small" tone="ink2" style={{ textAlign: 'center' }}>
        {finished ? 'Kegiatan ini sudah selesai.' : full ? 'Kuota peserta sudah penuh.' : 'Pendaftaran belum dibuka.'}
      </Txt>
    );
  }

  const facts: { icon: IconName; label: string; value: string }[] = [
    { icon: 'calendar', label: 'Tanggal', value: formatLongDate(event.event_date) },
    { icon: 'clock', label: 'Waktu', value: formatTimeRange(event.event_date, event.end_date) },
    { icon: 'mapPin', label: 'Lokasi', value: event.location },
  ];
  if (typeof count === 'number') {
    facts.push({ icon: 'users', label: 'Peserta', value: `${count} terdaftar${event.quota ? ` dari kuota ${event.quota}` : ''}` });
  }
  if (myFee !== null) {
    facts.push({ icon: 'wallet', label: `Biaya untuk Anda (${profile?.bagian || 'Inspirasi'})`, value: myFee > 0 ? rupiah(myFee) : 'Gratis' });
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <FocusStatusBar style="light" />
      <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}>
        <View style={{ overflow: 'hidden' }}>
          <Animated.View style={heroStyle}>
            <LinearGradient colors={sunrise.sky} locations={[0, 0.45, 0.78, 1]} style={{ paddingTop: insets.top + 64, paddingHorizontal: 20, paddingBottom: 56 }}>
              <Animated.View entering={reduce ? undefined : FadeInDown.springify().damping(18)} style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-end' }}>
                <DateTile date={event.event_date} size="lg" />
                <View style={{ flex: 1, gap: 2, paddingBottom: 4 }}>
                  {event.category ? (
                    <Txt variant="small" tone="navInk2" weight="600">
                      {event.category}
                    </Txt>
                  ) : null}
                  <Txt variant="body" tone="navInk">
                    {formatTime(event.event_date)} WITA
                  </Txt>
                </View>
              </Animated.View>
              <Animated.View entering={reduce ? undefined : FadeInDown.delay(80).springify().damping(18)}>
                <GoldRule style={{ marginTop: 20 }} />
                <Txt variant="title" tone="navInk" accessibilityRole="header">
                  {event.title}
                </Txt>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -28, gap: 20 }}>
          <Animated.View entering={reduce ? undefined : FadeInDown.delay(140).springify().damping(18)}>
            <Panel raised style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <Badge label={st.label} tone={st.tone} />
                {reg?.is_attended ? <Badge label="Hadir" tone="brand" /> : null}
                {reg?.is_paid ? <Badge label="Lunas" tone="ok" /> : null}
              </View>
              {facts.map((f, i) => (
                <View key={f.label}>
                  {i > 0 ? <Divider /> : null}
                  <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 12 }} accessible accessibilityLabel={`${f.label}: ${f.value}`}>
                    <View style={[styles.factIcon, { backgroundColor: c.brandSoft }]}>
                      <Icon name={f.icon} size={18} color={c.brandInk} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt variant="caption" tone="ink3">
                        {f.label}
                      </Txt>
                      <Txt variant="body" style={{ fontVariant: ['tabular-nums'] }}>
                        {f.value}
                      </Txt>
                    </View>
                  </View>
                </View>
              ))}
            </Panel>
          </Animated.View>

          {hasText(event.description) ? (
            <View>
              <GoldRule />
              <Txt variant="heading" accessibilityRole="header" style={{ marginBottom: 8 }}>
                Tentang kegiatan
              </Txt>
              <Txt variant="body" tone="ink2">
                {event.description}
              </Txt>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      <View style={[styles.topBar, { top: insets.top + 6 }]}>
        <IconButton icon="arrowLeft" onPress={back} accessibilityLabel="Kembali" />
      </View>
      <CompactHeader title={event.title} scrollY={scrollY} leftInset={68} />

      {action ? (
        <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: c.surface, borderTopColor: c.line, boxShadow: c.shadowRaised }]}>
          {actionError ? (
            <Animated.View entering={FadeIn.duration(160)}>
              <Txt variant="small" tone="danger" style={{ marginBottom: 8 }} accessibilityLiveRegion="assertive">
                {actionError}
              </Txt>
            </Animated.View>
          ) : justRegistered && reg ? (
            <Animated.View entering={FadeIn.duration(160)}>
              <Txt variant="small" tone="ok" weight="600" style={{ marginBottom: 8 }} accessibilityLiveRegion="polite">
                Anda terdaftar. Sampai jumpa di vihara.
              </Txt>
            </Animated.View>
          ) : null}
          {action}
        </View>
      ) : null}

      <ConfirmSheet
        visible={confirmCancel}
        title="Batalkan pendaftaran?"
        message={`Nama Anda akan dihapus dari daftar peserta "${event.title}". Anda bisa mendaftar lagi selama pendaftaran masih dibuka.`}
        confirmLabel="Ya, batalkan"
        cancelLabel="Tidak"
        onConfirm={doCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </View>
  );
}

/** The web stores "-" when a description was left empty. */
function hasText(value?: string | null) {
  return Boolean(value && value.trim() && value.trim() !== "-");
}

const styles = StyleSheet.create({
  factIcon: { width: 34, height: 34, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center' },
  topBar: { position: 'absolute', left: 12, zIndex: 20 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
});
