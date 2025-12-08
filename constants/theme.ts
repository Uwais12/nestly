// constants/theme.ts
import { Platform } from 'react-native';

// Midnight Mist design tokens for the premium Nestly system
export const theme = {
  colors: {
    // Backgrounds
    bg: '#0D0F12',
    bgSecondary: '#10131A',
    card: '#13161A',
    surface: '#1A1E23',
    surfaceAlt: '#1F232C',
    elevatedBg: 'rgba(19,22,26,0.9)',
    glassBg: 'rgba(19,22,26,0.8)',
    glassStroke: 'rgba(255,255,255,0.06)',

    // Text
    text: 'rgba(255,255,255,0.92)',
    textSecondary: 'rgba(255,255,255,0.72)',
    textMuted: 'rgba(255,255,255,0.55)',
    textFaint: 'rgba(255,255,255,0.38)',
    textAccent: '#B9A6FF',

    // Brand / accent
    primary: '#7A5CFF',
    brand: '#7A5CFF',
    brandAlt: '#5CE1E6',
    accent: '#B9A6FF',
    accentLight: '#7A5CFF',
    accentGlow: 'rgba(122,92,255,0.18)',

    // UI states
    border: 'rgba(255,255,255,0.08)',
    borderAlt: 'rgba(255,255,255,0.1)',
    borderSubtle: 'rgba(255,255,255,0.06)',
    success: '#4ADE80',
    danger: '#F87171',
    warning: '#FBBF24',
    info: '#6FB7FF',

    // Legacy accent helpers (used by gradients)
    accentPurple: '#7A5CFF',
    accentCyan: '#5CE1E6',
    accentOrange: '#FFB86C',
  },

  // Layout + radii
  radius: 22,
  radiusMd: 18,
  radiusSm: 14,
  spacing: (n: number) => n * 8,
  font: { h1: 30, h2: 24, h3: 20, body: 16, small: 13 },

  // Shadows tuned for dark atmospheric depth
  shadowSm: { color: '#000', opacity: 0.18, radius: 12, y: 10 },
  shadowMd: { color: '#000', opacity: 0.24, radius: 18, y: 14 },
  shadowLg: { color: '#000', opacity: 0.32, radius: 26, y: 18 },

  chip: { radius: 14, padH: 14, padV: 8 },

  // Gradients and glow helpers
  gradients: {
    brand: ['#7A5CFF', '#5CE1E6'],
    brandSoft: ['#7A5CFF22', '#5CE1E602'],
    canvas: [
      'radial-gradient(circle at 30% 20%, #7A5CFF22, #00000000)',
      'radial-gradient(circle at 70% 80%, #5CE1E622, #00000000)',
    ],
  },

  motion: {
    durationSm: 180,
    durationMd: 260,
    durationLg: 320,
    easing: { standard: (t: number) => t },
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'Sora', serif: 'GeneralSans-Semibold', rounded: 'Sora', mono: 'SFMono-Regular' },
  default: { sans: 'Sora', serif: 'GeneralSans-Semibold', rounded: 'Sora', mono: 'monospace' },
  web: {
    sans: "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    rounded: "'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Backwards-compatible Colors object used by starter components
const tintColorLight = '#7A5CFF';
const tintColorDark = '#7A5CFF';
export const Colors = {
  light: {
    text: theme.colors.text,
    background: theme.colors.bg,
    tint: tintColorLight,
    icon: theme.colors.textMuted,
    tabIconDefault: theme.colors.textMuted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: theme.colors.text,
    background: theme.colors.bg,
    tint: tintColorDark,
    icon: theme.colors.textMuted,
    tabIconDefault: theme.colors.textMuted,
    tabIconSelected: tintColorDark,
  },
};
