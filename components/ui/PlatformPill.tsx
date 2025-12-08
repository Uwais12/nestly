import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

type PlatformKind = 
  | 'youtube' | 'instagram' | 'tiktok' | 'web' 
  | 'Instagram' | 'Twitter' | 'TikTok' | 'Reddit' | 'LinkedIn' | 'Facebook' | 'Pinterest' | 'YouTube' | 'Other';

export function PlatformPill({ kind, platform }: { kind?: PlatformKind; platform?: string }) {
  const normalizedPlatform = (platform || kind || 'web').toLowerCase();
  
  const getLabelForPlatform = (p: string): string => {
    const mapping: Record<string, string> = {
      'youtube': 'YouTube',
      'instagram': 'Instagram',
      'tiktok': 'TikTok',
      'twitter': 'Twitter',
      'reddit': 'Reddit',
      'linkedin': 'LinkedIn',
      'facebook': 'Facebook',
      'pinterest': 'Pinterest',
      'web': 'Link',
      'other': 'Link',
    };
    return mapping[p] || p;
  };

  const label = getLabelForPlatform(normalizedPlatform);
  
  return (
    <View style={styles.pill}><Text style={styles.text}>{label}</Text></View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: theme.colors.glassStroke },
  text: { color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' },
});


