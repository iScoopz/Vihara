import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { radius, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Button } from './Pressables';
import { Txt } from './ui';

type Props = {
  icon?: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'empty' | 'error';
};

/** Empty and error states: say why, and offer the one action that helps. */
export function StateView({ icon, title, message, actionLabel, onAction, tone = 'empty' }: Props) {
  const { c } = useTheme();
  const isError = tone === 'error';
  return (
    <Animated.View entering={FadeIn.duration(220)} style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, gap: 10 }} accessibilityLiveRegion="polite">
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: radius.panel,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isError ? c.dangerSoft : c.brandSoft,
          marginBottom: 4,
        }}
      >
        <Icon name={icon ?? (isError ? 'refresh' : 'calendar')} size={24} color={isError ? c.danger : c.brandInk} />
      </View>
      <Txt variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </Txt>
      {message ? (
        <Txt variant="small" tone="ink2" style={{ textAlign: 'center', maxWidth: 320 }}>
          {message}
        </Txt>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary"icon={isError ? 'refresh' : undefined} style={{ marginTop: 8 }} />
      ) : null}
    </Animated.View>
  );
}

export function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return <StateView tone="error" title="Gagal memuat" message={message ?? 'Terjadi kesalahan.'} actionLabel="Coba lagi" onAction={onRetry} />;
}
