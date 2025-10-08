import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { SearchBar } from '@/components/home/SearchBar';
import { ChipList } from '@/components/home/ChipList';
import { theme } from '@/constants/theme';

export function SearchSection({
  query,
  onQuery,
  selected,
  onToggle,
}: {
  query: string;
  onQuery: (q: string) => void;
  selected: string[];
  onToggle: (t: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <ThemedText type="subtitle" style={styles.title}>Search your posts</ThemedText>
      <View style={{ height: 10 }} />
      <SearchBar value={query} onChange={onQuery} />
      <View style={{ height: 10 }} />
      <ChipList selected={selected} onToggle={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, backgroundColor: theme.colors.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: 0.1, color: theme.colors.text },
});


