import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { theme } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = { value: string; onChange: (v: string) => void; compact?: boolean; placeholder?: string };

export function SearchBar({ value, onChange, compact = false, placeholder = 'Search your memory…' }: Props) {
  const [text, setText] = useState(value);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => { setText(value); }, [value]);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onChange(text), 250); // debounce
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, [text, onChange]);

  const height = compact ? 48 : 60;
  const radius = compact ? 18 : 24;

  return (
    <View style={[styles.outer, { height, borderRadius: radius, padding: focused ? 3 : 2 }]}>
      <LinearGradient
        colors={[focused ? '#7A5CFF22' : 'rgba(255,255,255,0.02)', '#5CE1E612', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.wrap,
          {
            height,
            borderRadius: radius,
            borderColor: focused ? theme.colors.borderAlt : theme.colors.borderSubtle,
            backgroundColor: focused ? theme.colors.surfaceAlt : theme.colors.surface,
            shadowOpacity: compact ? 0.1 : 0.2,
            transform: [{ translateY: focused ? -1 : 0 }],
          },
        ]}
      >
        <IconSymbol name="magnifyingglass" size={18} color={focused ? theme.colors.textAccent : theme.colors.textMuted} style={styles.icon} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, { height }]}
          returnKeyType="search"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {text.length > 0 && (
          <Pressable onPress={() => setText('')} style={styles.clear} accessibilityRole="button">
            <IconSymbol name="xmark.circle.fill" size={18} color={theme.colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingRight: 12,
    shadowColor: '#000',
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingHorizontal: 12,
    includeFontPadding: false,
    fontFamily: 'Sora_400Regular',
  },
  icon: { marginLeft: 14 },
  clear: { padding: 10 },
});


