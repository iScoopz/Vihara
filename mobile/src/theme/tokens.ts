// Mirrors the CSS custom properties in src/app/globals.css of the web app (":root" and ".dark").
// Keep the two files in step when a token changes.

export type Palette = {
  canvas: string;
  surface: string;
  surface2: string;
  line: string;
  lineStrong: string;
  ink: string;
  ink2: string;
  ink3: string;
  brand: string;
  brandHover: string;
  onBrand: string;
  brandSoft: string;
  brandInk: string;
  gold: string;
  goldSoft: string;
  goldLine: string;
  ok: string;
  okSoft: string;
  onOk: string;
  danger: string;
  dangerSoft: string;
  nav: string;
  navInk: string;
  navInk2: string;
  navActive: string;
  navLine: string;
  shadowPanel: string;
  shadowRaised: string;
  shadowButton: string;
  /** Scrim behind sheets and dialogs. */
  scrim: string;
};

export const light: Palette = {
  canvas: '#f3efe8',
  surface: '#ffffff',
  surface2: '#f8f5ef',
  line: 'rgba(52, 36, 18, 0.11)',
  lineStrong: 'rgba(52, 36, 18, 0.2)',
  ink: '#1e1a24',
  ink2: '#4a4452',
  ink3: '#645e6b',
  brand: '#5b2fa6',
  brandHover: '#4a2489',
  onBrand: '#ffffff',
  brandSoft: '#f1ebfb',
  brandInk: '#4a2489',
  gold: '#8a4a0b',
  goldSoft: '#fbf0d9',
  goldLine: '#c59a3c',
  ok: '#166534',
  okSoft: '#dcfce7',
  onOk: '#ffffff',
  danger: '#b91c1c',
  dangerSoft: '#fee2e2',
  nav: '#26163a',
  navInk: '#ffffff',
  navInk2: '#cfc4e2',
  navActive: 'rgba(255, 255, 255, 0.12)',
  navLine: 'rgba(255, 255, 255, 0.1)',
  shadowPanel: '0px 1px 2px rgba(52, 36, 18, 0.05), 0px 6px 16px -6px rgba(52, 36, 18, 0.1)',
  shadowRaised: '0px 24px 48px -16px rgba(30, 18, 50, 0.35), 0px 2px 6px rgba(30, 18, 50, 0.08)',
  shadowButton: '0px 1px 2px rgba(30, 18, 50, 0.18)',
  scrim: 'rgba(15, 10, 20, 0.5)',
};

export const dark: Palette = {
  canvas: '#0f0c13',
  surface: '#18141e',
  surface2: '#211c29',
  line: 'rgba(255, 255, 255, 0.1)',
  lineStrong: 'rgba(255, 255, 255, 0.18)',
  ink: '#f4f1f7',
  ink2: '#ccc5d6',
  ink3: '#9d95a8',
  brand: '#c4b0f5',
  brandHover: '#d4c4f8',
  onBrand: '#1b0f33',
  brandSoft: 'rgba(196, 176, 245, 0.14)',
  brandInk: '#d4c4f8',
  gold: '#f5cf7a',
  goldSoft: 'rgba(245, 207, 122, 0.12)',
  goldLine: '#b88a2e',
  ok: '#86efac',
  okSoft: 'rgba(134, 239, 172, 0.12)',
  onOk: '#0b2a16',
  danger: '#fca5a5',
  dangerSoft: 'rgba(252, 165, 165, 0.12)',
  nav: '#140b20',
  navInk: '#ffffff',
  navInk2: '#bfb3d4',
  navActive: 'rgba(255, 255, 255, 0.1)',
  navLine: 'rgba(255, 255, 255, 0.08)',
  shadowPanel: '0px 0px 0px 1px rgba(255, 255, 255, 0.02), 0px 8px 20px -10px rgba(0, 0, 0, 0.7)',
  shadowRaised: '0px 24px 48px -12px rgba(0, 0, 0, 0.8)',
  shadowButton: '0px 1px 2px rgba(0, 0, 0, 0.4)',
  scrim: 'rgba(0, 0, 0, 0.6)',
};

/** The sunrise scene is the same in both modes: it lives in the aubergine nav zone. */
export const sunrise = {
  sky: ['#140b20', '#26163a', '#4a2a4f', '#6b3a45'] as const,
  far: '#3d2350',
  mid: '#2e1a42',
  near: '#1f1030',
  sunCore: '#ffe7a8',
  sunMid: '#f2c15a',
  sunEdge: '#d9952e',
  glow: '#f5c45e',
};

/** Gold seal details used inside the aubergine zone (both modes). */
export const seal = {
  tileTop: '#3a2154',
  tileBorder: 'rgba(197, 154, 60, 0.35)',
  month: '#e9c77a',
  chipBg: 'rgba(197, 154, 60, 0.22)',
  chipInk: '#f2d48a',
  onGold: '#1f1030',
};

export const fonts = {
  display: 'Newsreader_600SemiBold',
  displayBold: 'Newsreader_700Bold',
};

export const radius = {
  control: 8,
  panel: 12,
  modal: 16,
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

/** Minimum touch target in points. */
export const TAP = 44;
