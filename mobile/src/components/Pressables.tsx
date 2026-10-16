import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { radius, seal, TAP, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, stiffness: 320, mass: 0.6 };

type ScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far the element sinks while pressed. */
  pressedScale?: number;
  haptic?: boolean;
  accessibilityLabel: string;
};

/** Pressable that sinks slightly under the finger, so taps feel physical. */
export function PressableScale({ children, style, pressedScale = 0.97, haptic, onPressIn, onPressOut, onPress, disabled, ...rest }: ScaleProps) {
  const reduce = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPressIn={(e) => {
        if (!reduce) scale.set(withSpring(pressedScale, SPRING));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, SPRING));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      style={[style, animated]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'gold' | 'danger' | 'neutral' | 'ghost' | 'onDark';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  size?: 'md' | 'lg';
};

/** Button colours carry meaning (DESIGN.md "Warna tombol"). */
export function Button({ label, onPress, variant = 'secondary', icon, loading, disabled, style, accessibilityLabel, accessibilityHint, size = 'md' }: ButtonProps) {
  const { c } = useTheme();
  const look: Record<ButtonVariant, { bg: string; fg: string; border?: string; shadow?: string }> = {
    primary: { bg: c.brand, fg: c.onBrand, shadow: c.shadowButton },
    secondary: { bg: c.brandSoft, fg: c.brandInk },
    success: { bg: c.okSoft, fg: c.ok },
    gold: { bg: c.goldSoft, fg: c.gold },
    danger: { bg: c.dangerSoft, fg: c.danger },
    neutral: { bg: c.surface, fg: c.ink, border: c.lineStrong, shadow: c.shadowButton },
    ghost: { bg: 'transparent', fg: c.brandInk },
    onDark: { bg: c.goldLine, fg: seal.onGold, shadow: c.shadowButton },
  };
  const l = look[variant];
  const inactive = disabled || loading;
  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      haptic
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(inactive), busy: Boolean(loading) }}
      style={[
        {
          minHeight: size === 'lg' ? 52 : TAP,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: radius.control,
          backgroundColor: l.bg,
          borderWidth: l.border ? 1 : 0,
          borderColor: l.border,
          boxShadow: l.shadow,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={l.fg} /> : icon ? <Icon name={icon} size={18} color={l.fg} /> : null}
      <Text maxFontSizeMultiplier={1.5} style={{ color: l.fg, fontSize: size === 'lg' ? 16.5 : 15.5, fontWeight: '600', textAlign: 'center', flexShrink: 1 }}>
        {label}
      </Text>
    </PressableScale>
  );
}

export function Chip({ label, selected, onPress, count }: { label: string; selected: boolean; onPress: () => void; count?: number }) {
  const { c } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      haptic
      accessibilityRole="button"
      accessibilityLabel={count !== undefined ? `${label}, ${count} kegiatan` : label}
      accessibilityState={{ selected }}
      style={{
        minHeight: TAP,
        paddingHorizontal: 14,
        borderRadius: radius.control,
        backgroundColor: selected ? c.brand : c.surface,
        borderWidth: 1,
        borderColor: selected ? c.brand : c.line,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Text maxFontSizeMultiplier={1.5} style={{ color: selected ? c.onBrand : c.ink2, fontSize: 14.5, fontWeight: '600' }}>
        {label}
      </Text>
      {count !== undefined ? (
        <View style={{ minWidth: 20, paddingHorizontal: 5, borderRadius: 6, backgroundColor: selected ? 'rgba(255,255,255,0.2)' : c.surface2 }}>
          <Text maxFontSizeMultiplier={1.4} style={{ color: selected ? c.onBrand : c.ink3, fontSize: 12, fontWeight: '600', textAlign: 'center', fontVariant: ['tabular-nums'] }}>
            {count}
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

/** Round 44pt icon button used in headers and the calendar. */
export function IconButton({ icon, onPress, accessibilityLabel, tone = 'surface' }: { icon: IconName; onPress: () => void; accessibilityLabel: string; tone?: 'surface' | 'dark' }) {
  const { c } = useTheme();
  const dark = tone === 'dark';
  return (
    <PressableScale
      onPress={onPress}
      haptic
      pressedScale={0.92}
      accessibilityLabel={accessibilityLabel}
      style={{
        width: TAP,
        height: TAP,
        borderRadius: radius.control,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: dark ? 'rgba(255,255,255,0.12)' : c.surface,
        borderWidth: dark ? 0 : 1,
        borderColor: c.line,
      }}
    >
      <Icon name={icon} size={20} color={dark ? c.navInk : c.ink} />
    </PressableScale>
  );
}
