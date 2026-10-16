import { Newsreader_600SemiBold } from '@expo-google-fonts/newsreader/600SemiBold';
import { Newsreader_700Bold } from '@expo-google-fonts/newsreader/700Bold';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/context/auth';
import { EventsProvider } from '@/context/events';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 400, fade: true });

function Navigation() {
  const { c, isDark } = useTheme();
  const { initializing } = useAuth();
  const [fontsLoaded, fontError] = useFonts({ Newsreader_600SemiBold, Newsreader_700Bold });
  const ready = (fontsLoaded || Boolean(fontError)) && !initializing;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.canvas).catch(() => {});
  }, [c.canvas]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, background: c.canvas, card: c.surface, text: c.ink, border: c.line, primary: c.brand },
  };

  if (!ready) return null;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.canvas } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[id]" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <EventsProvider>
            <Navigation />
          </EventsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
