import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

/** Two or three mutually exclusive views; the raised thumb slides to the chosen one. */
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segW = width > 0 ? (width - 8) / options.length : 0;
  const x = useSharedValue(0);

  useEffect(() => {
    x.set(reduce ? withTiming(index * segW, { duration: 0 }) : withSpring(index * segW, { damping: 20, stiffness: 260 }));
  }, [index, segW, reduce, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', padding: 4, borderRadius: radius.control + 2, backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line }}
    >
      {segW > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[{ position: 'absolute', top: 4, bottom: 4, left: 4, width: segW, borderRadius: radius.control, backgroundColor: c.surface, boxShadow: c.shadowPanel }, thumb]}
        />
      ) : null}
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
            style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}
          >
            <Text maxFontSizeMultiplier={1.4} style={{ color: selected ? c.ink : c.ink3, fontWeight: selected ? '700' : '500', fontSize: 15 }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
