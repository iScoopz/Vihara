import { forwardRef, useState } from 'react';
import { Pressable, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { radius, TAP, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Txt } from './ui';

type Props = TextInputProps & {
  label: string;
  icon?: IconName;
  hint?: string;
  error?: string | null;
  secureToggle?: boolean;
};

/** Labelled input with a visible focus ring (brand, 2pt) instead of the platform default. */
export const Field = forwardRef<TextInputInstance, Props>(function Field({ label, icon, hint, error, secureToggle, style, onFocus, onBlur, secureTextEntry, ...rest }, ref) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? c.danger : focused ? c.brand : c.lineStrong;
  return (
    <View style={{ gap: 6 }}>
      <Txt variant="label" tone="ink2" nativeID={`label-${label}`}>
        {label}
      </Txt>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 50,
          borderRadius: radius.control,
          borderWidth: focused ? 2 : 1,
          borderColor,
          backgroundColor: c.surface,
          paddingHorizontal: focused ? 11 : 12,
          gap: 10,
          boxShadow: focused ? `0px 0px 0px 3px ${c.brandSoft}` : undefined,
        }}
      >
        {icon ? <Icon name={icon} size={18} color={focused ? c.brand : c.ink3} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityLabelledBy={`label-${label}`}
          placeholderTextColor={c.ink3}
          selectionColor={c.brand}
          cursorColor={c.brand}
          maxFontSizeMultiplier={1.6}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[{ flex: 1, color: c.ink, fontSize: 16, paddingVertical: 12, outlineWidth: 0 } as object, style]}
          {...rest}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Tampilkan kata sandi' : 'Sembunyikan kata sandi'}
            hitSlop={8}
            style={{ width: TAP, height: TAP, alignItems: 'center', justifyContent: 'center', marginRight: -10 }}
          >
            <Icon name={hidden ? 'eye' : 'eyeOff'} size={20} color={c.ink3} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Txt variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Txt>
      ) : hint ? (
        <Txt variant="caption" tone="ink3">
          {hint}
        </Txt>
      ) : null}
    </View>
  );
});

/** Search input with a clear button; used above long lists. */
export function SearchBox({ value, onChangeText, placeholder, label }: { value: string; onChangeText: (t: string) => void; placeholder: string; label: string }) {
  const { c } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        borderRadius: radius.control,
        borderWidth: focused ? 2 : 1,
        borderColor: focused ? c.brand : c.line,
        backgroundColor: c.surface,
        paddingLeft: focused ? 11 : 12,
        gap: 8,
      }}
    >
      <Icon name="search" size={18} color={c.ink3} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.ink3}
        accessibilityLabel={label}
        selectionColor={c.brand}
        cursorColor={c.brand}
        returnKeyType="search"
        autoCorrect={false}
        maxFontSizeMultiplier={1.6}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex: 1, color: c.ink, fontSize: 16, paddingVertical: 10, outlineWidth: 0 } as object}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Hapus pencarian"
          style={{ width: TAP, height: TAP, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="x" size={18} color={c.ink3} />
        </Pressable>
      ) : null}
    </View>
  );
}
