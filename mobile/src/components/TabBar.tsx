import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';

const META: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Beranda', icon: 'home' },
  kegiatan: { label: 'Kegiatan', icon: 'list' },
  kalender: { label: 'Kalender', icon: 'calendar' },
  profil: { label: 'Profil', icon: 'user' },
  pengurus: { label: 'Pengurus', icon: 'clipboard' },
};

export const TAB_BAR_HEIGHT = 64;

/** Space a scrolling screen leaves at the bottom so its last item clears the floating tab bar. */
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 16;
}

const SPRING = { damping: 20, stiffness: 260, mass: 0.7 };

export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const visible = state.routes.filter((r) => !descriptors[r.key]?.options.hidden);
  const focusedKey = state.routes[state.index]?.key;
  const activeIndex = Math.max(0, visible.findIndex((r) => r.key === focusedKey));

  const [rowWidth, setRowWidth] = useState(0);
  // The row has 6pt padding on each side; items share the rest equally.
  const itemWidth = visible.length > 0 && rowWidth > 12 ? (rowWidth - 12) / visible.length : 0;
  const x = useSharedValue(0);
  const w = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    if (itemWidth === 0) return;
    const target = activeIndex * itemWidth;
    w.set(itemWidth);
    // First placement (or a resize) jumps; later tab changes glide.
    if (!placed.current || reduce) {
      placed.current = true;
      x.set(target);
    } else {
      x.set(withSpring(target, SPRING));
    }
  }, [activeIndex, itemWidth, reduce, w, x]);

  const pill = useAnimatedStyle(() => ({ width: w.get(), transform: [{ translateX: x.get() }] }));

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {Platform.OS === 'ios' ? (
        <BlurView tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'} intensity={90} style={StyleSheet.absoluteFill} />
      ) : (
        // Android blur needs a blur target and web blur is costly on low-end phones: use a near-opaque surface instead.
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface, opacity: 0.97 }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { bottom: undefined, height: StyleSheet.hairlineWidth, backgroundColor: c.line }]} />

      <View role="tablist" style={styles.row} onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}>
        {itemWidth > 0 ? (
          <Animated.View pointerEvents="none" style={[styles.pillTrack, pill]}>
            <View style={[styles.pill, { backgroundColor: c.brandSoft }]} />
          </Animated.View>
        ) : null}
        {visible.map((route, i) => {
          const focused = i === activeIndex;
          const meta = META[route.name] ?? { label: route.name, icon: 'home' as IconName };
          const color = focused ? c.brandInk : c.ink3;
          const onPress = () => {
            Haptics.selectionAsync().catch(() => {});
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Pressable
              key={route.key}
              role="tab"
              accessibilityRole="tab"
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}
            >
              <Icon name={meta.icon} size={22} color={color} strokeWidth={focused ? 2.2 : 1.9} />
              <Text maxFontSizeMultiplier={1.25} numberOfLines={1} style={{ color, fontSize: 11.5, fontWeight: focused ? '700' : '500', marginTop: 3 }}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  row: { flexDirection: 'row', height: TAB_BAR_HEIGHT, paddingHorizontal: 6 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  pillTrack: { position: 'absolute', top: 8, bottom: 8, left: 6, alignItems: 'center' },
  pill: { width: '86%', maxWidth: 84, height: '100%', borderRadius: radius.panel },
});
