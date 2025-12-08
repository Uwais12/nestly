import { PropsWithChildren } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export function Glass({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <View {...rest} style={[styles.glass, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: theme.colors.glassBg,
    borderWidth: 1,
    borderColor: theme.colors.glassStroke,
    borderRadius: theme.radius,
    shadowColor: theme.colors.accentGlow,
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    overflow: 'hidden',
  },
});


