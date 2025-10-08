import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';

export function Chip({ title, onPress, variant = 'solid', style }: { title: string; onPress: () => void; variant?: 'solid' | 'glass'; style?: ViewStyle }) {
  return (
    <Pressable
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
      style={({ pressed }) => [
        styles.base,
        variant === 'solid' ? styles.solid : styles.glass,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
      accessibilityRole="button"
    >
      <Text style={variant === 'solid' ? styles.solidText : styles.glassText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: theme.chip.padH, paddingVertical: theme.chip.padV, borderRadius: theme.chip.radius, alignSelf: 'flex-start' },
  solid: { backgroundColor: theme.colors.brand },
  solidText: { color: '#0B0D10', fontWeight: '800', fontSize: 14 },
  glass: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  glassText: { color: theme.colors.text, fontWeight: '700', fontSize: 14 },
});


