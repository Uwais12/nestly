import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { usePreferences } from '@/hooks/usePreferences';
import { IconButton } from '@/components/ui/IconButton';

export default function NotificationsScreen() {
  const { prefs, toggleNotifications } = usePreferences();
  const router = useRouter();

  const toggle = () => {
    toggleNotifications();
    Alert.alert('Saved', 'Preference stored. Push notifications coming soon.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton name="chevron.backward" onPress={() => router.back()} />
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.subtitle}>We do not send push notifications yet. Toggle will be used when the service is live.</Text>

      <TouchableOpacity style={[styles.row, prefs.notificationsEnabled && styles.rowActive]} onPress={toggle}>
        <Text style={styles.rowLabel}>Enable push notifications</Text>
        <Text style={styles.rowNote}>{prefs.notificationsEnabled ? 'On (placeholder)' : 'Off (default)'}</Text>
      </TouchableOpacity>
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
});
