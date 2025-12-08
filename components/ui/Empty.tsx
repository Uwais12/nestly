import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { IconSymbol, IconSymbolName } from './icon-symbol';

export function Empty({ 
  title, 
  subtitle, 
  cta,
  icon 
}: PropsWithChildren<{ 
  title: string; 
  subtitle?: string; 
  cta?: React.ReactNode;
  icon?: IconSymbolName;
}>) {
  return (
    <View style={styles.wrap}>
      {icon && (
        <View style={styles.iconContainer}>
          <IconSymbol name={icon} size={48} color={theme.colors.brand} />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {cta && <View style={styles.ctaContainer}>{cta}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: theme.spacing(1.5), 
    padding: theme.spacing(4),
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(2),
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    shadowColor: theme.colors.brand,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  title: { 
    color: theme.colors.text, 
    fontSize: 20, 
    fontWeight: '700', 
    textAlign: 'center',
    fontFamily: 'Sora_600SemiBold',
  },
  subtitle: { 
    color: theme.colors.textMuted, 
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 300,
    fontFamily: 'Sora_400Regular',
  },
  ctaContainer: {
    marginTop: theme.spacing(2),
  }
});
