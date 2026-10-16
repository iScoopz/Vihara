import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type TextInputInstance } from 'react-native';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/auth';
import { WEB_BASE } from '@/lib/supabase';
import { radius, sunrise, useTheme } from '@/theme';

import { Field } from './Field';
import { FocusStatusBar } from './FocusStatusBar';
import { Icon } from './Icon';
import { LogoMark } from './LogoMark';
import { Button } from './Pressables';
import { useTabBarSpace } from './TabBar';
import { GoldRule, Panel, Txt } from './ui';

export function SignIn() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const bottomSpace = useTabBarSpace();
  const { signIn, sendPasswordReset, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
  const passwordRef = useRef<TextInputInstance>(null);

  const message = error ?? notice;

  const submit = async () => {
    const next: typeof fieldError = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Isi email yang terdaftar, misalnya nama@email.com.';
    if (!password) next.password = 'Isi kata sandi Anda.';
    setFieldError(next);
    setInfo(null);
    clearNotice();
    if (next.email || next.password) return;
    setBusy(true);
    setError(null);
    const res = await signIn(email, password);
    setBusy(false);
    if (res.error) setError(res.error);
  };

  const forgot = async () => {
    setError(null);
    setInfo(null);
    clearNotice();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFieldError({ email: 'Isi email Anda dulu, lalu ketuk "Lupa kata sandi" lagi.' });
      return;
    }
    setFieldError({});
    setBusy(true);
    const res = await sendPasswordReset(email);
    setBusy(false);
    if (res.error) setError(res.error);
    else setInfo(`Tautan untuk mengatur ulang kata sandi sudah dikirim ke ${email.trim()}. Buka email itu di HP ini.`);
  };

  const activate = () => {
    WebBrowser.openBrowserAsync(`${WEB_BASE}/login/aktivasi`).catch(() => {});
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FocusStatusBar style="light" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: bottomSpace }}>
        <LinearGradient colors={sunrise.sky} locations={[0, 0.45, 0.78, 1]} style={{ paddingTop: insets.top + 36, paddingBottom: 72, paddingHorizontal: 24, alignItems: 'center' }}>
          <Animated.View entering={reduce ? undefined : FadeInDown.springify().damping(18)} style={{ alignItems: 'center' }}>
            <LogoMark size={84} />
            <GoldRule style={{ marginTop: 18 }} />
            <Txt variant="title" tone="navInk" style={{ textAlign: 'center' }} accessibilityRole="header">
              Masuk ke Vihara MNSBDI
            </Txt>
            <Txt variant="small" tone="navInk2" style={{ textAlign: 'center', marginTop: 6, maxWidth: 300 }}>
              Untuk mendaftar kegiatan dan melihat riwayat Anda.
            </Txt>
          </Animated.View>
        </LinearGradient>

        <Animated.View entering={reduce ? undefined : FadeInDown.delay(120).springify().damping(18)} style={{ marginTop: -44, paddingHorizontal: 16 }}>
          <Panel raised style={{ padding: 20, gap: 16 }}>
            <Field
              label="Email"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="nama@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={fieldError.email}
            />
            <Field
              ref={passwordRef}
              label="Kata sandi"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Kata sandi Anda"
              secureToggle
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={submit}
              error={fieldError.password}
            />

            {message ? (
              <View accessibilityLiveRegion="assertive" style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.control, backgroundColor: c.dangerSoft }}>
                <Icon name="x" size={18} color={c.danger} />
                <Txt variant="small" tone="danger" style={{ flex: 1 }}>
                  {message}
                </Txt>
              </View>
            ) : null}
            {info ? (
              <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.control, backgroundColor: c.okSoft }}>
                <Icon name="check" size={18} color={c.ok} />
                <Txt variant="small" tone="ok" style={{ flex: 1 }}>
                  {info}
                </Txt>
              </View>
            ) : null}

            <Button label="Masuk" variant="primary" size="lg" icon="logIn" onPress={submit} loading={busy} />
            <Button label="Lupa kata sandi" variant="ghost" onPress={forgot} disabled={busy} accessibilityHint="Mengirim tautan atur ulang kata sandi ke email di atas" />
          </Panel>

          <Panel style={{ padding: 18, marginTop: 16, gap: 10 }}>
            <Txt variant="label" weight="600">
              Belum punya kata sandi?
            </Txt>
            <Txt variant="small" tone="ink2">
              Aktifkan akun dengan email yang sudah dicatat pengurus di Data Umat. Halaman aktivasi dibuka di browser.
            </Txt>
            <Button label="Aktifkan akun" variant="secondary" icon="external" onPress={activate} accessibilityHint="Membuka halaman aktivasi di browser" />
          </Panel>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
