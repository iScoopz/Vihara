import { useIsFocused } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';

/** Status bar style for one screen only, e.g. light text over the aubergine zone. */
export function FocusStatusBar({ style }: { style: StatusBarStyle }) {
  const focused = useIsFocused();
  return focused ? <StatusBar style={style} /> : null;
}
