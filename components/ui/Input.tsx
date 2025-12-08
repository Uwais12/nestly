import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '@/constants/theme';

type InputProps = TextInputProps & {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
};

export function Input({ leadingIcon, trailingIcon, style, onFocus, onBlur, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.shell, focused && styles.shellFocused]}>
      {leadingIcon ? <View style={styles.iconLeading}>{leadingIcon}</View> : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={theme.colors.accent}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, style]}
      />
      {trailingIcon ? <View style={styles.iconTrailing}>{trailingIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  shellFocused: {
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accentGlow,
    shadowOpacity: 0.4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    fontFamily: 'Sora_400Regular',
  },
  iconLeading: { marginRight: 10, alignItems: 'center', justifyContent: 'center' },
  iconTrailing: { marginLeft: 10, alignItems: 'center', justifyContent: 'center' },
});


