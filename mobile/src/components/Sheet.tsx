import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, useTheme } from '@/theme';

import { Button, type ButtonVariant } from './Pressables';
import { GoldRule, Txt } from './ui';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Scrollable body for long lists. */
  scroll?: boolean;
};

/** Bottom sheet over a dark scrim. Back button, Escape (web) and tapping the scrim close it. */
export function Sheet({ visible, onClose, title, children, scroll }: SheetProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      {visible ? (
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}>
            <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Tutup" />
          </Animated.View>
          <Animated.View
            entering={reduce ? FadeIn.duration(150) : SlideInDown.springify().damping(22).stiffness(220)}
            exiting={reduce ? FadeOut.duration(120) : SlideOutDown.duration(180)}
            accessibilityViewIsModal
            style={{
              backgroundColor: c.surface,
              borderTopLeftRadius: radius.modal + 4,
              borderTopRightRadius: radius.modal + 4,
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 16),
              maxHeight: '86%',
              boxShadow: c.shadowRaised,
            }}
          >
            <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: c.lineStrong, marginBottom: 14 }} />
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <GoldRule />
              <Txt variant="heading" accessibilityRole="header">
                {title}
              </Txt>
            </View>
            {scroll ? (
              <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
                {children}
              </ScrollView>
            ) : (
              <View style={{ paddingHorizontal: 20 }}>{children}</View>
            )}
          </Animated.View>
        </View>
      ) : null}
    </Modal>
  );
}

type ConfirmProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Confirmation for actions that undo something: the safe choice is the neutral button. */
export function ConfirmSheet({ visible, title, message, confirmLabel, confirmVariant = 'danger', cancelLabel = 'Batal', onConfirm, onCancel }: ConfirmProps) {
  return (
    <Sheet visible={visible} onClose={onCancel} title={title}>
      <Txt tone="ink2" style={{ marginBottom: 20 }}>
        {message}
      </Txt>
      <View style={{ gap: 10 }}>
        <Button label={confirmLabel} variant={confirmVariant} onPress={onConfirm} size="lg" />
        <Button label={cancelLabel} variant="neutral" onPress={onCancel} size="lg" />
      </View>
    </Sheet>
  );
}
