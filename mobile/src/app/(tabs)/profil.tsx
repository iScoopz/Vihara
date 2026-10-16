import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CompactHeader, useScrollY } from '@/components/CollapsingHeader';
import { Field } from '@/components/Field';
import { FocusStatusBar } from '@/components/FocusStatusBar';
import { Icon, type IconName } from '@/components/Icon';
import { Button, PressableScale } from '@/components/Pressables';
import { ConfirmSheet } from '@/components/Sheet';
import { SignIn } from '@/components/SignIn';
import { Skeleton } from '@/components/Skeleton';
import { ErrorState, StateView } from '@/components/StateView';
import { useTabBarSpace } from '@/components/TabBar';
import { Avatar, Badge, Divider, FocalNumber, GoldRule, Panel, Txt } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { useEvents } from '@/context/events';
import { updateMyContact } from '@/lib/api';
import { friendlyDataError } from '@/lib/errors';
import { formatShortDate, initials } from '@/lib/format';
import { enterDown } from '@/lib/motion';
import { radius, seal, sunrise, TAP, useTheme } from '@/theme';

export default function Profil() {
  const { profile } = useAuth();
  if (!profile) return <SignIn />;
  return <ProfileView />;
}

function ProfileView() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const bottomSpace = useTabBarSpace();
  const { profile, isAdmin, signOut, setProfile, refreshProfile } = useAuth();
  const { status, error, events, myRegs, refreshing, reload } = useEvents();
  const { scrollY, onScroll } = useScrollY();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ phone: '', address: '', emergency_contact: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);

  if (!profile) return null;

  const regs = Object.values(myRegs);
  const eventById = new Map(events.map((e) => [e.id, e]));
  const history = regs
    .map((r) => ({ reg: r, event: eventById.get(r.event_id) }))
    .filter((h): h is { reg: typeof h.reg; event: NonNullable<typeof h.event> } => Boolean(h.event))
    .sort((a, b) => +new Date(b.event.event_date) - +new Date(a.event.event_date));
  const attended = regs.filter((r) => r.is_attended).length;

  const startEdit = () => {
    setDraft({ phone: profile.phone ?? '', address: profile.address ?? '', emergency_contact: profile.emergency_contact ?? '' });
    setSaveError(null);
    setSaved(false);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    const fields = { phone: draft.phone.trim() || null, address: draft.address.trim() || null, emergency_contact: draft.emergency_contact.trim() || null };
    try {
      await updateMyContact(profile.id, fields);
      setProfile({ ...profile, ...fields });
      setEditing(false);
      setSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      setSaveError(`Kontak belum tersimpan. ${friendlyDataError(e as { message?: string })}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setSaving(false);
    }
  };

  const naungan = [profile.bagian, profile.han ? `HAN ${profile.han}` : null].filter(Boolean).join(' · ');

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FocusStatusBar style="light" />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: bottomSpace }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              reload();
              refreshProfile();
            }}
            tintColor={c.navInk}
            progressViewOffset={insets.top}
          />
        }
      >
        <LinearGradient colors={sunrise.sky} locations={[0, 0.45, 0.78, 1]} style={{ paddingTop: insets.top + 28, paddingHorizontal: 20, paddingBottom: 64 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Avatar label={initials(profile.full_name)} size={68} />
            <View style={{ flex: 1, gap: 4 }}>
              <GoldRule style={{ marginBottom: 4 }} />
              <Txt variant="title" tone="navInk" accessibilityRole="header">
                {profile.full_name}
              </Txt>
              {naungan ? (
                <Txt variant="small" tone="navInk2">
                  {naungan}
                </Txt>
              ) : null}
              {isAdmin ? (
                <View style={{ marginTop: 4 }}>
                  <View style={{ alignSelf: 'flex-start', borderRadius: radius.control, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: seal.chipBg }}>
                    <Txt variant="caption" weight="600" style={{ color: seal.chipInk }}>
                      Pengurus
                    </Txt>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, marginTop: -40, gap: 20 }}>
          <Panel raised style={{ padding: 18 }}>
            {status === 'loading' ? (
              <View style={{ gap: 10 }}>
                <Skeleton width={90} height={44} />
                <Skeleton width="60%" height={14} />
              </View>
            ) : (
              <>
                <FocalNumber value={regs.length} caption="kegiatan diikuti" />
                <Txt variant="small" tone="ink2" style={{ marginTop: 2 }}>
                  {attended > 0 ? `${attended} di antaranya tercatat hadir.` : 'Kehadiran dicatat pengurus pada hari kegiatan.'}
                </Txt>
              </>
            )}
          </Panel>

          <Section title="Kontak">
            {editing ? (
              <Animated.View entering={reduce ? undefined : FadeIn.duration(180)} style={{ gap: 14 }}>
                <Field label="Nomor HP" icon="phone" value={draft.phone} onChangeText={(t) => setDraft((d) => ({ ...d, phone: t }))} keyboardType="phone-pad" placeholder="08xx xxxx xxxx" autoComplete="tel" />
                <Field label="Alamat" icon="mapPin" value={draft.address} onChangeText={(t) => setDraft((d) => ({ ...d, address: t }))} placeholder="Alamat rumah" multiline style={{ minHeight: 64, textAlignVertical: 'top' }} />
                <Field
                  label="Kontak darurat"
                  icon="users"
                  value={draft.emergency_contact}
                  onChangeText={(t) => setDraft((d) => ({ ...d, emergency_contact: t }))}
                  placeholder="Nama dan nomor HP keluarga"
                  hint="Dihubungi pengurus bila terjadi sesuatu saat kegiatan."
                />
                {saveError ? (
                  <Txt variant="small" tone="danger" accessibilityLiveRegion="polite">
                    {saveError}
                  </Txt>
                ) : null}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button label="Batal" variant="neutral" onPress={() => setEditing(false)} style={{ flex: 1 }} disabled={saving} />
                  <Button label="Simpan" variant="primary" onPress={save} loading={saving} style={{ flex: 1 }} />
                </View>
              </Animated.View>
            ) : (
              <View>
                <InfoRow icon="mail" label="Email" value={profile.email} note="Diatur pengurus" />
                <Divider />
                <InfoRow icon="phone" label="Nomor HP" value={profile.phone} />
                <Divider />
                <InfoRow icon="mapPin" label="Alamat" value={profile.address} />
                <Divider />
                <InfoRow icon="users" label="Kontak darurat" value={profile.emergency_contact} />
                {saved ? (
                  <Txt variant="small" tone="ok" style={{ marginTop: 10 }} accessibilityLiveRegion="polite">
                    Kontak tersimpan.
                  </Txt>
                ) : null}
                <Button label="Ubah kontak" icon="pencil" variant="secondary" onPress={startEdit} style={{ marginTop: 12 }} />
              </View>
            )}
          </Section>

          <Section title="Naungan" note="Sentra, cetya, HAN, dan bagian diubah oleh pengurus.">
            <InfoRow label="Sentra" value={profile.sentra} />
            <Divider />
            <InfoRow label="Cetya" value={profile.cetya} />
            <Divider />
            <InfoRow label="HAN" value={profile.han} />
            <Divider />
            <InfoRow label="Bagian" value={profile.bagian} />
          </Section>

          <View>
            <GoldRule />
            <Txt variant="heading" accessibilityRole="header" style={{ marginBottom: 12 }}>
              Riwayat kegiatan
            </Txt>
            {status === 'loading' ? (
              <View style={{ gap: 10 }}>
                <Skeleton height={64} rounded={radius.panel} />
                <Skeleton height={64} rounded={radius.panel} />
              </View>
            ) : status === 'error' ? (
              <ErrorState message={error} onRetry={reload} />
            ) : history.length === 0 ? (
              <Panel>
                <StateView title="Belum ada riwayat" message="Kegiatan yang Anda daftari akan tercatat di sini." actionLabel="Lihat kegiatan" onAction={() => router.navigate('/kegiatan')} />
              </Panel>
            ) : (
              <Panel>
                {history.map(({ reg, event }, i) => (
                  <Animated.View key={reg.id} entering={enterDown(i, reduce)}>
                    {i > 0 ? <Divider style={{ marginHorizontal: 14 }} /> : null}
                    <PressableScale
                      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
                      pressedScale={0.985}
                      accessibilityLabel={`${event.title}, ${formatShortDate(event.event_date)}. ${reg.is_attended ? 'Hadir' : 'Terdaftar'}${reg.is_paid ? ', lunas' : ''}`}
                      style={{ minHeight: 64, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt variant="label" weight="600" numberOfLines={2}>
                          {event.title}
                        </Txt>
                        <Txt variant="caption" tone="ink3">
                          {formatShortDate(event.event_date)}
                        </Txt>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Badge label={reg.is_attended ? 'Hadir' : 'Terdaftar'} tone={reg.is_attended ? 'brand' : 'neutral'} />
                        {reg.is_paid ? <Badge label="Lunas" tone="ok" /> : null}
                      </View>
                    </PressableScale>
                  </Animated.View>
                ))}
              </Panel>
            )}
          </View>

          <Panel style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={[styles.noteIcon, { backgroundColor: c.goldSoft }]}>
              <Icon name="eye" size={18} color={c.gold} />
            </View>
            <Txt variant="small" tone="ink2" style={{ flex: 1 }}>
              Tampilan terang atau gelap mengikuti pengaturan HP Anda.
            </Txt>
          </Panel>

          <Button label="Keluar" variant="danger" icon="logOut" onPress={() => setConfirmOut(true)} size="lg" />
        </View>
      </Animated.ScrollView>
      <CompactHeader title={profile.full_name} scrollY={scrollY} />

      <ConfirmSheet
        visible={confirmOut}
        title="Keluar dari akun?"
        message="Anda perlu masuk lagi untuk mendaftar kegiatan dan melihat riwayat."
        confirmLabel="Keluar"
        onConfirm={() => {
          setConfirmOut(false);
          signOut();
        }}
        onCancel={() => setConfirmOut(false)}
      />
    </KeyboardAvoidingView>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <View>
      <GoldRule />
      <Txt variant="heading" accessibilityRole="header">
        {title}
      </Txt>
      {note ? (
        <Txt variant="caption" tone="ink3" style={{ marginTop: 2 }}>
          {note}
        </Txt>
      ) : null}
      <Panel style={{ padding: 14, marginTop: 12 }}>{children}</Panel>
    </View>
  );
}

function InfoRow({ icon, label, value, note }: { icon?: IconName; label: string; value?: string | null; note?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ minHeight: TAP, paddingVertical: 10, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }} accessible accessibilityLabel={`${label}: ${value || 'belum diisi'}`}>
      {icon ? (
        <View style={{ paddingTop: 2 }}>
          <Icon name={icon} size={18} color={c.ink3} />
        </View>
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="caption" tone="ink3">
          {label}
          {note ? ` · ${note}` : ''}
        </Txt>
        <Txt variant="body" tone={value ? 'ink' : 'ink3'}>
          {value || 'Belum diisi'}
        </Txt>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noteIcon: { width: 32, height: 32, borderRadius: radius.control, alignItems: 'center', justifyContent: 'center' },
});
