// constants/theme.ts
import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Surfaces
    bg: '#0A0C10',           // app background (deeper charcoal)
    card: '#10131A',         // elevated cards
    surface: '#0D1117',      // control surfaces / inputs
    surfaceAlt: '#0F131A',   // subtle alternative surface

    // Text
    text: '#E6EAF0',
    textMuted: '#95A1AE',
    textFaint: '#6C7785',

    // Brand
    brand: '#7BD7FF',        // primary accent
    brandAlt: '#A9A1FF',

    // UI States
    border: '#1A2029',
    borderAlt: 'rgba(255,255,255,0.08)',
    success: '#3DD9A3',
    danger: '#FF6B6B',
    warning: '#FFC069',
    info: '#6FB7FF',
    elevatedBg: 'rgba(18,21,26,0.75)',
    glassStroke: 'rgba(255,255,255,0.14)',
    glassBg: 'rgba(13,17,23,0.45)',
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
