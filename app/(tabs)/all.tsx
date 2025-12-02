// app/(tabs)/all.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useDockState } from '@/hooks/useDockState';
import { usePosts } from '@/hooks/usePosts';
import { HeroGrid } from '@/components/home/HeroGrid';
import { DockedSearchRail } from '@/components/home/DockedSearchRail';
import { logEvent } from '@/lib/analytics';
import { Empty } from '@/components/ui/Empty';
import { Button } from '@/components/ui/Button';

export default function AllScreen() {
  const router = useRouter();
  const { dock, undock, isDocked } = useDockState();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const { items, loadMore, loading } = usePosts({ tags: selected, search: query });

  useEffect(() => { logEvent('home_view'); }, []);
  useEffect(() => { dock(); }, [dock]);

  const onToggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    logEvent('filter_select', { tag });
  };

  const [scrollable, setScrollable] = useState(true);

  const showEmpty = !loading && items.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[theme.colors.accentPurple, theme.colors.accentCyan, theme.colors.accentOrange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.accent} />
      
      {showEmpty ? (
        <View style={styles.emptyContainer}>
          <Empty 
            icon="tray.fill"
            title="No saved items yet" 
            subtitle="Save links from TikTok, Instagram, or YouTube to see them here."
            cta={
              <Button 
                title="Add your first link" 
                onPress={() => router.push('/(tabs)/add')} 
              />
            }
          />
        </View>
      ) : (
        <HeroGrid
          data={items}
          onEndReached={loadMore}
          onOpen={(id: string) => router.push(`/item/${id}`)}
          startAtEnd
          onScrollableChange={setScrollable}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const v = e.nativeEvent.velocity?.y ?? 0;
            // Scrolling up (content moves down): hide the rail; scrolling down: show it
            if (v < -0.1) { undock(); }
            else if (v > 0.1) { dock(); }
            // Fallback thresholds
            else if (y < 12 && isDocked) { undock(); }
            else if (y > 40 && !isDocked) { dock(); }
          }}
        />
      )}

      <DockedSearchRail 
        visible={isDocked} 
        forceVisible={!scrollable || showEmpty} 
        query={query} 
        onQuery={(q) => { setQuery(q); logEvent('search_query', { q }); }} 
        selected={selected} 
        onToggle={onToggle} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  accent: { height: 3, alignSelf: 'stretch', marginHorizontal: 12, marginTop: 6, borderRadius: 3, backgroundColor: theme.colors.accentOrange },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
});
