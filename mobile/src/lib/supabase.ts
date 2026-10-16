import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';

type Extra = { supabaseUrl?: string; supabaseAnonKey?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const SUPABASE_URL = extra.supabaseUrl ?? '';
const SUPABASE_ANON_KEY = extra.supabaseAnonKey ?? '';

export const isConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

// The anon key is public by design; every rule that matters lives in Row Level Security.
export const supabase = createClient(SUPABASE_URL || 'https://invalid.local', SUPABASE_ANON_KEY || 'missing', {
  auth: {
    // During static web export there is no window, so AsyncStorage must not be touched.
    storage: Platform.OS === 'web' && typeof window === 'undefined' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Token refresh only while the app is in the foreground, as Supabase recommends for React Native.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

export const WEB_BASE = 'https://vihara.jhordychris.workers.dev';
