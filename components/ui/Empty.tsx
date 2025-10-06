import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

export function Empty({ title, subtitle, cta }: PropsWithChildren<{ title: string; subtitle?: string; cta?: React.ReactNode }>) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {cta}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing(2), padding: theme.spacing(3) },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: theme.colors.textMuted, textAlign: 'center' },
});


