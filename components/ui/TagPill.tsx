import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export function TagPill({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <View style={[styles.pill, { backgroundColor: selected ? theme.colors.brand : '#0E1115', borderColor: selected ? theme.colors.brand : theme.colors.border }]}> 
      <Text style={[styles.text, { color: selected ? '#0B0D10' : theme.colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1 },
  text: { fontSize: 12, fontWeight: '600' },
});


