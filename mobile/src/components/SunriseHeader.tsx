import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { sunrise, useTheme } from '@/theme';

type Props = { scrollY: SharedValue<number>; height: number; children: ReactNode };

/**
 * Nichiren means "sun lotus". As the page scrolls, the gold sun rises behind aubergine horizons
 * that move at different speeds, and the greeting lags and fades. Static under reduced motion.
 */
export function SunriseHeader({ scrollY, height, children }: Props) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const reduce = useReducedMotion();
  const sunSize = Math.min(width * 0.86, 420);

  // One sunrise when the screen first opens: the sun climbs from below the horizon.
  const dawn = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) {
      dawn.set(1);
      return;
    }
    dawn.set(withDelay(150, withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) })));
  }, [dawn, reduce]);

  const sunStyle = useAnimatedStyle(() => {
    const s = reduce ? 0 : Math.max(0, Math.min(scrollY.get(), height));
    const rise = interpolate(dawn.get(), [0, 1], [sunSize * 0.32, 0]);
    return { transform: [{ translateY: rise - s * 0.45 }], opacity: interpolate(dawn.get(), [0, 0.3, 1], [0.4, 0.85, 1]) };
  });
  const farStyle = useAnimatedStyle(() => {
    const s = reduce ? 0 : Math.max(0, Math.min(scrollY.get(), height));
    return { transform: [{ translateY: s * 0.12 }] };
  });
  const midStyle = useAnimatedStyle(() => {
    const s = reduce ? 0 : Math.max(0, Math.min(scrollY.get(), height));
    return { transform: [{ translateY: s * 0.06 }] };
  });
  const contentStyle = useAnimatedStyle(() => {
    if (reduce) return {};
    const y = scrollY.get();
    const s = Math.max(0, Math.min(y, height));
    return {
      opacity: interpolate(s, [0, height * 0.4], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: s * 0.22 + Math.min(0, y) * 0.3 }],
    };
  });
  // Pulling down past the top stretches the sky instead of showing a gap.
  const skyStyle = useAnimatedStyle(() => {
    const y = scrollY.get();
    return { transform: [{ translateY: Math.min(0, y) }], height: height + Math.max(0, -y) };
  });

  return (
    <View style={{ height, backgroundColor: c.nav }}>
      <Animated.View style={[styles.sky, skyStyle]}>
        <LinearGradient colors={sunrise.sky} locations={[0, 0.45, 0.78, 1]} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]} pointerEvents="none">
      <Animated.View style={[styles.sun, { width: sunSize, height: sunSize, left: (width - sunSize) / 2, bottom: height * 0.1 - sunSize / 2 }, sunStyle]}>
        <Svg width={sunSize} height={sunSize} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="srGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={sunrise.glow} stopOpacity="0.5" />
              <Stop offset="0.55" stopColor={sunrise.glow} stopOpacity="0.12" />
              <Stop offset="1" stopColor={sunrise.glow} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="srSun" cx="50%" cy="40%" r="60%">
              <Stop offset="0" stopColor={sunrise.sunCore} />
              <Stop offset="0.45" stopColor={sunrise.sunMid} />
              <Stop offset="1" stopColor={sunrise.sunEdge} />
            </RadialGradient>
          </Defs>
          <Circle cx="50" cy="50" r="50" fill="url(#srGlow)" />
          <Circle cx="50" cy="50" r="27" fill="url(#srSun)" />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.layer, { bottom: height * 0.1, height: height * 0.34 }, farStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <Path fill={sunrise.far} d="M0 190 C 180 130, 330 150, 480 170 S 820 110, 980 140 S 1270 190, 1440 150 L1440 320 L0 320 Z" />
        </Svg>
      </Animated.View>
      <Animated.View style={[styles.layer, { bottom: height * 0.02, height: height * 0.3 }, midStyle]}>
        <Svg width="100%" height="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <Path fill={sunrise.mid} d="M0 210 C 220 160, 400 200, 620 185 S 980 150, 1180 190 S 1360 215, 1440 200 L1440 320 L0 320 Z" />
        </Svg>
      </Animated.View>
      <View style={[styles.layer, { bottom: -1, height: height * 0.22 }]}>
        <Svg width="100%" height="100%" viewBox="0 0 1440 240" preserveAspectRatio="none">
          <Path fill={sunrise.near} d="M0 150 C 260 110, 520 160, 760 140 S 1180 100, 1440 135 L1440 240 L0 240 Z" />
          {/* The scene settles into the paper canvas with a soft curve. */}
          <Path fill={c.canvas} d="M0 214 C 360 196, 1080 196, 1440 214 L1440 240 L0 240 Z" />
        </Svg>
      </View>
      </View>

      <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sky: { position: 'absolute', left: 0, right: 0, top: 0 },
  sun: { position: 'absolute' },
  layer: { position: 'absolute', left: 0, right: 0 },
});
