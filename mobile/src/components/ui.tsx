import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';

import { fonts, radius, useTheme, type Palette } from '@/theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'small' | 'caption';
type Tone = 'ink' | 'ink2' | 'ink3' | 'brand' | 'brandInk' | 'gold' | 'ok' | 'danger' | 'onBrand' | 'navInk' | 'navInk2' | 'onOk';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.3 },
  title: { fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 23 },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '500' },
  small: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 13, lineHeight: 18 },
};

export function Txt({
  variant = 'body',
  tone = 'ink',
  weight,
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone; weight?: '400' | '500' | '600' | '700' }) {
  const { c } = useTheme();
  const isSerif = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <Text
      maxFontSizeMultiplier={isSerif ? 1.4 : 1.8}
      {...rest}
      style={[variants[variant], { color: c[tone as keyof Palette] as string }, weight ? { fontWeight: weight } : null, style]}
    />
  );
}

/** Short gold rule that opens every page title (DESIGN.md motif). */
export function GoldRule({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ width: 28, height: 3, borderRadius: 2, backgroundColor: c.goldLine, marginBottom: 10 }, style]} />;
}

export function Panel({ children, style, raised }: { children: ReactNode; style?: StyleProp<ViewStyle>; raised?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: raised ? radius.modal : radius.panel,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: c.line,
          boxShadow: raised ? c.shadowRaised : c.shadowPanel,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export type BadgeTone = 'brand' | 'ok' | 'gold' | 'danger' | 'neutral';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const { c } = useTheme();
  const map: Record<BadgeTone, { bg: string; fg: string }> = {
    brand: { bg: c.brandSoft, fg: c.brandInk },
    ok: { bg: c.okSoft, fg: c.ok },
    gold: { bg: c.goldSoft, fg: c.gold },
    danger: { bg: c.dangerSoft, fg: c.danger },
    neutral: { bg: c.surface2, fg: c.ink2 },
  };
  const { bg, fg } = map[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.control, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text maxFontSizeMultiplier={1.5} style={{ color: fg, fontSize: 12.5, lineHeight: 17, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

/** The one focal number per screen: large serif in brand. */
export function FocalNumber({ value, caption, onDark }: { value: number | string; caption?: string; onDark?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 8 }}>
      <Text
        maxFontSizeMultiplier={1.3}
        style={{ fontFamily: fonts.displayBold, fontSize: 44, lineHeight: 50, color: onDark ? c.navInk : c.brand, fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
      {caption ? (
        <Text maxFontSizeMultiplier={1.6} style={{ fontSize: 15, lineHeight: 21, color: onDark ? c.navInk2 : c.ink2, flexShrink: 1 }}>
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

export function Avatar({ label, size = 56 }: { label: string; size?: number }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.goldSoft,
        borderWidth: 2,
        borderColor: c.goldLine,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text maxFontSizeMultiplier={1.2} style={{ fontFamily: fonts.displayBold, fontSize: size * 0.38, color: c.gold }}>
        {label}
      </Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: c.line }, style]} />;
}
