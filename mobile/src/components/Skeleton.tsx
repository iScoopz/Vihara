import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

/** A grey block with a light sweep; the sweep runs only while something is loading. */
export function Skeleton({ width = '100%', height = 14, style, rounded = radius.control }: { width?: DimensionValue; height?: number; style?: StyleProp<ViewStyle>; rounded?: number }) {
  const { c, isDark } = useTheme();
  const reduce = useReducedMotion();
  const [w, setW] = useState(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduce || w === 0) return;
    x.set(0);
    x.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, false));
    return () => cancelAnimation(x);
  }, [reduce, w, x]);

  const sweep = useAnimatedStyle(() => ({ transform: [{ translateX: -w + x.get() * w * 2 }] }));

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[{ width, height, borderRadius: rounded, backgroundColor: c.surface2, overflow: 'hidden' }, style]}
      aria-hidden
    >
      {!reduce && w > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
          <LinearGradient
            colors={['transparent', isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}

/** Placeholder shaped like an event card, so the list does not jump when data arrives. */
export function EventCardSkeleton() {
  const { c } = useTheme();
  return (
    <View
      accessibilityLabel="Memuat kegiatan"
      style={{ flexDirection: 'row', gap: 14, padding: 14, borderRadius: radius.panel, backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line }}
    >
      <Skeleton width={60} height={68} rounded={radius.panel} />
      <View style={{ flex: 1, gap: 10, paddingTop: 4 }}>
        <Skeleton width="75%" height={16} />
        <Skeleton width="55%" height={12} />
        <Skeleton width={90} height={20} />
      </View>
    </View>
  );
}

export function RowSkeleton() {
  const { c } = useTheme();
  return (
    <View
      accessibilityLabel="Memuat data"
      style={{ gap: 10, padding: 14, borderRadius: radius.panel, backgroundColor: c.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: c.line }}
    >
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={12} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Skeleton width="48%" height={44} />
        <Skeleton width="48%" height={44} />
      </View>
    </View>
  );
}
