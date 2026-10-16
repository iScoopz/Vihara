import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

import { Icon } from './Icon';
import { PressableScale } from './Pressables';

type Props = {
  kind: 'hadir' | 'lunas';
  done: boolean;
  onPress: () => void;
  disabled?: boolean;
  /** Spoken name of the person, so the control is clear out of context. */
  who: string;
};

/**
 * DESIGN.md toggle rule: not done = soft colour with "Tandai ...", done = solid with a check,
 * so the unfinished rows stand out in a long list. Purple for attendance, green for money.
 */
export function StatusToggle({ kind, done, onPress, disabled, who }: Props) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const p = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    p.set(reduce ? withTiming(done ? 1 : 0, { duration: 0 }) : withSpring(done ? 1 : 0, { damping: 16, stiffness: 240 }));
  }, [done, p, reduce]);

  const soft = kind === 'hadir' ? c.brandSoft : c.okSoft;
  const solid = kind === 'hadir' ? c.brand : c.ok;
  const softInk = kind === 'hadir' ? c.brandInk : c.ok;
  const solidInk = kind === 'hadir' ? c.onBrand : c.onOk;

  const bg = useAnimatedStyle(() => ({ backgroundColor: interpolateColor(p.get(), [0, 1], [soft, solid]) }));
  const check = useAnimatedStyle(() => ({
    width: 18 * p.get(),
    marginRight: 6 * p.get(),
    opacity: p.get(),
    transform: [{ scale: 0.4 + 0.6 * p.get() }],
  }));

  const label = done ? (kind === 'hadir' ? 'Hadir' : 'Lunas') : kind === 'hadir' ? 'Tandai hadir' : 'Tandai lunas';
  const spoken = done
    ? `${who} ${kind === 'hadir' ? 'sudah hadir' : 'sudah lunas'}. Ketuk untuk membatalkan.`
    : `Tandai ${who} ${kind === 'hadir' ? 'hadir' : 'lunas'}`;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      pressedScale={0.95}
      accessibilityRole="switch"
      accessibilityLabel={spoken}
      accessibilityState={{ checked: done, disabled: Boolean(disabled) }}
      style={{ flex: 1, borderRadius: radius.control, opacity: disabled ? 0.6 : 1 }}
    >
      <Animated.View style={[{ minHeight: 48, borderRadius: radius.control, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }, bg]}>
        <Animated.View style={[{ overflow: 'hidden', alignItems: 'center' }, check]}>
          <Icon name="check" size={18} color={solidInk} strokeWidth={2.6} />
        </Animated.View>
        <View>
          <Text maxFontSizeMultiplier={1.4} style={{ color: done ? solidInk : softInk, fontWeight: '600', fontSize: 15 }}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </PressableScale>
  );
}
