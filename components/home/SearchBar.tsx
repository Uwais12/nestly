import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { theme } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function SearchBar({ value, onChange, compact = false }: { value: string; onChange: (v: string) => void; compact?: boolean }) {
  const [text, setText] = useState(value);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setText(value); }, [value]);

  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => onChange(text), 250); // debounce
    return () => { if (timeout.current) clearTimeout(timeout.current); };
  }, [text, onChange]);

  const height = compact ? 40 : 52;
  const radius = compact ? 20 : 22;

  return (
    <View style={[styles.wrap, { height, borderRadius: radius, shadowOpacity: compact ? 0.08 : 0.12 }]}> 
      <IconSymbol name="magnifyingglass" size={18} color={theme.colors.textFaint} style={{ marginLeft: 12 }} />
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Search your posts…"
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, { height }]}
        returnKeyType="search"
      />
      {text.length > 0 && (
        <Pressable onPress={() => setText('')} style={styles.clear} accessibilityRole="button">
          <IconSymbol name="xmark.circle.fill" size={18} color={theme.colors.textFaint} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, paddingRight: 8, shadowColor: '#000', shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  input: { flex: 1, color: theme.colors.text, fontSize: 16, paddingHorizontal: 10, includeFontPadding: false },
  clear: { padding: 8 },
});


