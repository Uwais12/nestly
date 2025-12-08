import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';

type ChipVariant = 'solid' | 'glass' | 'ghost';

type ChipProps = {
  title: string;
  onPress: () => void;
  variant?: ChipVariant;
  style?: ViewStyle;
  selected?: boolean;
  icon?: React.ReactNode;
  compact?: boolean;
};

export function Chip({ title, onPress, variant = 'glass', style, selected = false, icon, compact = false }: ChipProps) {
  const padV = compact ? theme.chip.padV - 2 : theme.chip.padV;
  const padH = compact ? theme.chip.padH - 2 : theme.chip.padH;

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { paddingVertical: padV, paddingHorizontal: padH },
        styles[variant],
        selected && styles.selected,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={[styles.content, icon && styles.withIcon]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.text, selected ? styles.textSelected : styles[`text${variant === 'solid' ? 'Solid' : 'Glass'}`]]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.chip.radius,
    alignSelf: 'flex-start',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  withIcon: { gap: 8 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  solid: {
    backgroundColor: theme.colors.brand,
    shadowColor: theme.colors.accentGlow,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  glass: {
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selected: {
    backgroundColor: '#7A5CFF22',
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accentGlow,
    shadowOpacity: 0.45,
    shadowRadius: 12,
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.94 },
  text: { fontSize: 13, letterSpacing: -0.1, fontFamily: 'Sora_600SemiBold' },
  textSolid: { color: '#f8f8fc' },
  textGlass: { color: theme.colors.textSecondary },
  textSelected: { color: '#FFFFFF' },
});


