import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { canSelfRegister, isFinished, isFull } from '@/lib/events';
import { formatShortDate, formatTime, MONTHS_SHORT, WEEKDAYS_SHORT, witaParts } from '@/lib/format';
import type { ViharaEvent } from '@/lib/types';
import { fonts, radius, seal, useTheme } from '@/theme';

import { Icon } from './Icon';
import { PressableScale } from './Pressables';
import { Badge, type BadgeTone, Txt } from './ui';

/** Aubergine date tile with a serif day number, as on the web landing. */
export function DateTile({ date, size = 'md' }: { date: string; size?: 'md' | 'lg' }) {
  const { c } = useTheme();
  const p = witaParts(date);
  const big = size === 'lg';
  return (
    <LinearGradient
      colors={[seal.tileTop, c.nav]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.6, y: 1 }}
      style={{
        width: big ? 76 : 60,
        alignSelf: 'center',
        paddingVertical: big ? 10 : 8,
        borderRadius: radius.panel,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: seal.tileBorder,
      }}
    >
      <Text maxFontSizeMultiplier={1.2} style={{ color: c.navInk2, fontSize: big ? 12.5 : 11.5, fontWeight: '600' }}>
        {WEEKDAYS_SHORT[p.weekday]}
      </Text>
      <Text maxFontSizeMultiplier={1.2} style={{ color: c.navInk, fontFamily: fonts.displayBold, fontSize: big ? 36 : 28, lineHeight: big ? 40 : 32, fontVariant: ['tabular-nums'] }}>
        {p.day}
      </Text>
      <Text maxFontSizeMultiplier={1.2} style={{ color: seal.month, fontSize: big ? 12.5 : 11.5, fontWeight: '600' }}>
        {MONTHS_SHORT[p.month]}
      </Text>
    </LinearGradient>
  );
}

export function eventStatus(event: ViharaEvent, registered: boolean, count: number | undefined): { label: string; tone: BadgeTone } {
  if (!event.is_published) return { label: 'Draf', tone: 'gold' };
  if (isFinished(event)) return { label: 'Selesai', tone: 'neutral' };
  if (registered) return { label: 'Anda terdaftar', tone: 'ok' };
  if (isFull(event, count)) return { label: 'Kuota penuh', tone: 'gold' };
  if (canSelfRegister(event)) return { label: 'Pendaftaran dibuka', tone: 'brand' };
  return { label: 'Ditutup', tone: 'neutral' };
}

type Props = { event: ViharaEvent; registered: boolean; count?: number };

export function EventCard({ event, registered, count }: Props) {
  const { c } = useTheme();
  const status = eventStatus(event, registered, count);
  const finished = isFinished(event);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      accessibilityLabel={`${event.title}, ${formatShortDate(event.event_date)} pukul ${formatTime(event.event_date)}, ${event.location}. ${status.label}`}
      accessibilityHint="Buka detail kegiatan"
      style={{
        flexDirection: 'row',
        gap: 14,
        padding: 14,
        borderRadius: radius.panel,
        backgroundColor: c.surface,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: c.line,
        boxShadow: c.shadowPanel,
        opacity: finished ? 0.86 : 1,
      }}
    >
      <DateTile date={event.event_date} />
      <View style={{ flex: 1, gap: 6, justifyContent: 'center' }}>
        {event.category ? (
          <Txt variant="caption" tone="ink3" weight="500">
            {event.category}
          </Txt>
        ) : null}
        <Txt variant="label" weight="600" numberOfLines={2} style={{ fontSize: 16.5, lineHeight: 22 }}>
          {event.title}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="clock" size={14} color={c.ink3} />
          <Txt variant="caption" tone="ink2" numberOfLines={1} style={{ fontVariant: ['tabular-nums'], flexShrink: 0 }}>
            {formatTime(event.event_date)} WITA
          </Txt>
          <Txt variant="caption" tone="ink3">
            ·
          </Txt>
          <Txt variant="caption" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>
            {event.location}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
          <Badge label={status.label} tone={status.tone} />
          {typeof count === 'number' ? (
            <Txt variant="caption" tone="ink3" style={{ fontVariant: ['tabular-nums'] }}>
              {count}
              {event.quota ? ` / ${event.quota}` : ''} peserta
            </Txt>
          ) : null}
        </View>
      </View>
      <View style={{ justifyContent: 'center' }}>
        <Icon name="chevronRight" size={18} color={c.ink3} />
      </View>
    </PressableScale>
  );
}
