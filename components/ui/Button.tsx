import { ActivityIndicator, GestureResponderEvent, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';

type Props = {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  loading?: boolean;
  variant?: 'filled' | 'subtle' | 'ghost';
  size?: 'md' | 'lg';
};

export function Button({ title, onPress, loading, variant = 'filled', size = 'md' }: Props) {
  const padV = size === 'lg' ? 14 : 12;
  const padH = size === 'lg' ? 22 : 18;

  const stylesByVariant = {
    filled: {
      bg: theme.colors.brand,
      color: '#0B0D10',
      border: theme.colors.brand,
    },
    subtle: {
      bg: 'rgba(255,255,255,0.06)',
      color: theme.colors.text,
      border: 'rgba(255,255,255,0.10)',
    },
    ghost: {
      bg: 'transparent',
      color: theme.colors.text,
      border: 'rgba(255,255,255,0.14)',
    },
  } as const;

  const v = stylesByVariant[variant];

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.btn, { backgroundColor: v.bg, borderColor: v.border, paddingVertical: padV, paddingHorizontal: padH }]}> 
      {loading ? <ActivityIndicator color={v.color} /> : <Text style={[styles.text, { color: v.color }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: theme.radius, alignItems: 'center', borderWidth: 1 },
  text: { fontWeight: '700', fontSize: 15 },
});


