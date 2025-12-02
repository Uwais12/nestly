// app/(tabs)/all.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
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
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.headerIconShell}>
            <Image
              source={require('../../assets/images/NestlyAppIcons/light/icon_40x40.png')}
              style={styles.headerIcon}
              contentFit="contain"
            />
          </View>
          <View>
            <Text style={styles.headerTitle}>Nestly</Text>
            <Text style={styles.headerSubtitle}>Save links. Watch later.</Text>
          </View>
        </View>
      </View>

      <LinearGradient
        colors={[theme.colors.accentPurple, theme.colors.accentCyan, theme.colors.accentOrange]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accent}
      />
      
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconShell: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  accent: {
    height: 3,
    alignSelf: 'stretch',
    marginHorizontal: 12,
    marginTop: 4,
    borderRadius: 3,
    backgroundColor: theme.colors.accentOrange,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
});
