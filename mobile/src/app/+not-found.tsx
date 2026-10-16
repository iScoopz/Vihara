import { router } from 'expo-router';
import { View } from 'react-native';

import { StateView } from '@/components/StateView';
import { useTheme } from '@/theme';

export default function NotFound() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: c.canvas }}>
      <StateView title="Halaman tidak ditemukan" message="Tautan ini tidak mengarah ke halaman yang ada di aplikasi." actionLabel="Ke beranda" onAction={() => router.replace('/')} />
    </View>
  );
}
