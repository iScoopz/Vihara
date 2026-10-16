import { useColorScheme } from 'react-native';

import { dark, light, type Palette } from './tokens';

export * from './tokens';

export type Theme = { c: Palette; isDark: boolean };

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return { c: isDark ? dark : light, isDark };
}
