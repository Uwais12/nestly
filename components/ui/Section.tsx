import { PropsWithChildren } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export function Section({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <View {...rest} style={[styles.section, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing(1.5 as any),
    padding: theme.spacing(2),
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});


