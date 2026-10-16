import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useReducedMotion, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

import { GoldRule, Txt } from './ui';

const COLLAPSE_AT = 56;

export function useScrollY() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });
  return { scrollY, onScroll };
}

/**
 * The large page title scrolls away with the content; as it leaves, a compact bar with the same
 * title fades in at the top, so the user always knows where they are.
 */
export function CompactHeader({ title, scrollY, leftInset = 16 }: { title: string; scrollY: SharedValue<number>; leftInset?: number }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bar = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [COLLAPSE_AT - 24, COLLAPSE_AT + 8], [0, 1], Extrapolation.CLAMP),
  }));
  const label = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.get(), [COLLAPSE_AT - 24, COLLAPSE_AT + 8], [6, 0], Extrapolation.CLAMP) }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.compact, { paddingTop: insets.top, height: insets.top + 52 }, bar]}>
      {Platform.OS === 'ios' ? (
        <BlurView tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'} intensity={80} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.surface, opacity: 0.97 }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { top: undefined, height: StyleSheet.hairlineWidth, backgroundColor: c.line }]} />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: leftInset, paddingRight: 16 }}>
        <Animated.View style={[{ flex: 1 }, label]}>
          <Txt variant="heading" numberOfLines={1} maxFontSizeMultiplier={1.2} aria-hidden>
            {title}
          </Txt>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

export function LargeTitle({ title, subtitle, scrollY, right }: { title: string; subtitle?: string; scrollY: SharedValue<number>; right?: ReactNode }) {
  const reduce = useReducedMotion();
  const fade = useAnimatedStyle(() => {
    if (reduce) return {};
    const y = scrollY.get();
    return {
      opacity: interpolate(y, [0, COLLAPSE_AT], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(y, [-80, 0, COLLAPSE_AT], [8, 0, -10], Extrapolation.CLAMP) }],
    };
  });
  return (
    <Animated.View style={[{ paddingTop: 8, paddingBottom: 14, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }, fade]}>
      <View style={{ flex: 1 }}>
        <GoldRule />
        <Txt variant="title" accessibilityRole="header">
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="small" tone="ink2" style={{ marginTop: 4 }}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  compact: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, overflow: 'hidden' },
});
