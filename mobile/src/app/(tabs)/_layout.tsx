import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/TabBar';
import { useAuth } from '@/context/auth';

export default function TabsLayout() {
  const { isAdmin } = useAuth();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="kegiatan" options={{ title: 'Kegiatan' }} />
      <Tabs.Screen name="kalender" options={{ title: 'Kalender' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
      {/* Pengurus only: the tab is hidden (and redirects away) for everyone else. */}
      <Tabs.Screen name="pengurus" options={{ title: 'Pengurus', hidden: !isAdmin }} />
    </Tabs>
  );
}
