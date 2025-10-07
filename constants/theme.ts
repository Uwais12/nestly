// constants/theme.ts
import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Light (Apple-like)
    bg: '#FBFBFD',           // near-white
    card: '#FFFFFF',         // surfaces
    surface: '#FFFFFF',      // inputs
    surfaceAlt: '#FFFFFF',

    // Text
    text: '#0A0A0A',
    textMuted: '#6B7280',
    textFaint: 'rgba(0,0,0,0.45)',

    // Brand
    brand: '#4F8EF7',        // Nestly Blue
    brandAlt: '#4F8EF7',

    // UI States
    border: 'rgba(0,0,0,0.06)',
    borderAlt: 'rgba(0,0,0,0.06)',
    success: '#3DD9A3',
    danger: '#FF6B6B',
    warning: '#FFC069',
    info: '#6FB7FF',
    elevatedBg: 'rgba(255,255,255,0.75)',
    glassStroke: 'rgba(0,0,0,0.06)',
    glassBg: 'rgba(255,255,255,0.80)',
  },
  radius: 16,
  radiusMd: 12,
  radiusSm: 10,
  spacing: (n: number) => n * 8,
  font: { h1: 30, h2: 24, h3: 18, body: 16, small: 13 },
  shadowSm: { color: '#000', opacity: 0.2, radius: 8, y: 8 },
  shadowMd: { color: '#000', opacity: 0.28, radius: 12, y: 10 },
  shadowLg: { color: '#000', opacity: 0.35, radius: 16, y: 14 },
  chip: { radius: 18, padH: 14, padV: 8 },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Backwards-compatible Colors object used by starter components
const tintColorLight = '#7BD7FF';
const tintColorDark = '#E6EAF0';
export const Colors = {
  light: {
    text: theme.colors.text,
    background: '#ffffff',
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
