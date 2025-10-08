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
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
});


