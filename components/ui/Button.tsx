import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'filled';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}: Props) {
  const variantKey: Variant = variant === 'filled' ? 'primary' : variant === 'subtle' ? 'secondary' : variant;

  const sizeTokens = {
    sm: { padV: 11, padH: 16, font: 14 },
    md: { padV: 14, padH: 20, font: 15.5 },
    lg: { padV: 16, padH: 24, font: 16.5 },
  }[size];

  const v = {
    primary: {
      background: theme.gradients.brand,
      color: '#FFFFFF',
      border: 'transparent',
      glow: theme.colors.accentGlow,
    },
    secondary: {
      background: [theme.colors.surface, theme.colors.surfaceAlt],
      color: theme.colors.text,
      border: theme.colors.border,
      glow: 'rgba(255,255,255,0.05)',
    },
    ghost: {
      background: ['transparent', 'transparent'],
      color: theme.colors.textSecondary,
      border: theme.colors.borderSubtle,
      glow: 'transparent',
    },
  }[variantKey];

  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      style={({ pressed }) => [
        styles.base,
        { paddingVertical: sizeTokens.padV, paddingHorizontal: sizeTokens.padH, borderColor: v.border },
        pressed && styles.pressed,
        (loading || disabled) && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(loading || disabled) }}
    >
      <LinearGradient
        colors={Array.isArray(v.background) ? (v.background as string[]) : [v.background as string, v.background as string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, icon && styles.withIcon]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        {loading ? (
          <ActivityIndicator color={v.color} />
        ) : (
          <Text style={[styles.text, { color: v.color, fontSize: sizeTokens.font }]}>{title}</Text>
        )}
      </View>
      <View style={[styles.glow, { shadowColor: v.glow }]} pointerEvents="none" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius,
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: theme.shadowMd.opacity,
    shadowRadius: theme.shadowMd.radius,
    shadowOffset: { width: 0, height: theme.shadowMd.y },
    elevation: 6,
  },
  content: { paddingVertical: 2, paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  withIcon: { gap: 10 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700', letterSpacing: -0.1, fontFamily: 'Sora_600SemiBold' },
  pressed: { transform: [{ translateY: -1 }], opacity: 0.94 },
  disabled: { opacity: 0.6 },
  glow: {
    ...StyleSheet.absoluteFillObject,
    shadowOpacity: 0.28,
    shadowRadius: 24,
  },
});


