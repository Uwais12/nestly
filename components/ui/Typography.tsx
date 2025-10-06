import { PropsWithChildren } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export function H1(props: PropsWithChildren<TextProps>) {
  return <Text {...props} style={[styles.h1, props.style]} />;
}

export function H2(props: PropsWithChildren<TextProps>) {
  return <Text {...props} style={[styles.h2, props.style]} />;
}

export function Body(props: PropsWithChildren<TextProps>) {
  return <Text {...props} style={[styles.body, props.style]} />;
}

export function Muted(props: PropsWithChildren<TextProps>) {
  return <Text {...props} style={[styles.muted, props.style]} />;
}

const styles = StyleSheet.create({
  h1: { color: theme.colors.text, fontSize: theme.font.h1, fontWeight: '800' },
  h2: { color: theme.colors.text, fontSize: theme.font.h2, fontWeight: '800' },
  body: { color: theme.colors.text, fontSize: theme.font.body },
  muted: { color: theme.colors.textMuted },
});


