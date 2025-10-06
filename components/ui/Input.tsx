import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { theme } from '@/constants/theme';

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={theme.colors.textMuted} {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, padding: 14, fontSize: 16, backgroundColor: theme.colors.surface, color: theme.colors.text },
});


