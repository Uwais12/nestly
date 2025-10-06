import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export function PlatformPill({ kind }: { kind: 'youtube' | 'instagram' | 'tiktok' | 'web' }) {
  const label = kind === 'youtube' ? 'YouTube' : kind === 'instagram' ? 'Instagram' : kind === 'tiktok' ? 'TikTok' : 'Link';
  return (
    <View style={styles.pill}><Text style={styles.text}>{label}</Text></View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: theme.colors.glassStroke },
  text: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' },
});


