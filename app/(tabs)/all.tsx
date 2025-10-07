// app/(tabs)/all.tsx
import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useDockState } from '@/hooks/useDockState';
import { usePosts } from '@/hooks/usePosts';
import { HeroGrid } from '@/components/home/HeroGrid';
import { DockedSearchRail } from '@/components/home/DockedSearchRail';
import { logEvent } from '@/lib/analytics';

export default function AllScreen() {
  const router = useRouter();
  const { dock, undock, isDocked } = useDockState();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { items, loadMore } = usePosts({ tags: selected, search: query });

  useEffect(() => { logEvent('home_view'); }, []);

  const onToggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    logEvent('filter_select', { tag });
  };

  // Grid scroll docking behavior will be refined with onScroll later

  return (
    <View style={styles.container}>
      <HeroGrid
        data={items}
        onEndReached={loadMore}
        onOpen={(id: string) => router.push(`/item/${id}`)}
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (y > 40 && !isDocked) { dock(); }
          else if (y < 10 && isDocked) { undock(); }
        }}
      />
      {/* Listen to scroll to toggle dock state if needed (grid is primary scroller) */}
      {/* In practice we could elevate this to a custom FlatList onScroll prop; simplified here */}
      {/* No-op: using threshold logic managed elsewhere */}
      <DockedSearchRail visible={isDocked} query={query} onQuery={(q) => { setQuery(q); logEvent('search_query', { q }); }} selected={selected} onToggle={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
});
