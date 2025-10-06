import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '@/constants/theme';

export function Card({ children, style, ...rest }: PropsWithChildren<ViewProps>) {
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
});


