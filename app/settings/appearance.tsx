import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { usePreferences } from '@/hooks/usePreferences';
import { IconButton } from '@/components/ui/IconButton';

export default function AppearanceScreen() {
  const { prefs, setAppearance } = usePreferences();
  const router = useRouter();

  const options: { label: string; value: 'system' | 'dark'; note?: string }[] = [
    { label: 'System default', value: 'system' },
    { label: 'Dark', value: 'dark', note: 'Current theme; light coming soon.' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton name="chevron.backward" onPress={() => router.back()} />
        <Text style={styles.title}>Appearance</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.subtitle}>Light theme not yet available; toggle is stored for future release.</Text>

      {options.map((opt) => {
        const active = prefs.appearance === opt.value;
        return (
          <TouchableOpacity key={opt.value} style={[styles.row, active && styles.rowActive]} onPress={() => setAppearance(opt.value)}>
            <Text style={styles.rowLabel}>{opt.label}</Text>
            {opt.note ? <Text style={styles.rowNote}>{opt.note}</Text> : null}
            <Text style={styles.badge}>{active ? 'Selected' : 'Select'}</Text>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700', fontFamily: 'Sora_600SemiBold' },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  row: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: 4,
  },
  rowActive: { borderColor: theme.colors.accent },
  rowLabel: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  rowNote: { color: theme.colors.textMuted, fontSize: 13 },
  badge: { color: theme.colors.textMuted, fontSize: 12 },
});
