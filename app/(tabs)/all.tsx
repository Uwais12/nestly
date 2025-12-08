// app/(tabs)/all.tsx
import { DockedSearchRail } from '@/components/home/DockedSearchRail';
import { HeroGrid } from '@/components/home/HeroGrid';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { IconButton } from '@/components/ui/IconButton';
import { theme } from '@/constants/theme';
import { useDockState } from '@/hooks/useDockState';
import { usePosts } from '@/hooks/usePosts';
import { logEvent } from '@/lib/analytics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AllScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top - 6, 0);
  const { dock, undock, isDocked } = useDockState();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [platform, setPlatform] = useState<'all' | 'instagram' | 'tiktok' | 'youtube' | 'web'>('all');
  const [sort, setSort] = useState<'recent' | 'oldest'>('recent');
  const { items, loadMore, loading } = usePosts({
    tags: selected,
    search: query,
    filters: {
      platforms: platform === 'all' ? undefined : [platform],
      sort,
    },
  });

  useEffect(() => { logEvent('home_view'); }, []);
  useEffect(() => { dock(); }, [dock]);

  const onToggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    logEvent('filter_select', { tag });
  };

  const [scrollable, setScrollable] = useState(true);

  const showEmpty = !loading && items.length === 0;
  const savesCount = useMemo(() => items.length, [items.length]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient
          colors={['#0D0F12', '#0D0F12']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['#7A5CFF22', '#00000000']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.8, y: 0.8 }}
          style={styles.glowOne}
        />
        <LinearGradient
          colors={['#5CE1E612', '#00000000']}
          start={{ x: 0.8, y: 0.2 }}
          end={{ x: 0.2, y: 1 }}
          style={styles.glowTwo}
        />
      </View>

      <View style={[styles.topBar, { paddingTop: topInset }]}>
        <View>
          <Text style={styles.kicker}>Your vault</Text>
          <Text style={styles.headerTitle}>Nestly</Text>
          <Text style={styles.headerSubtitle}>{savesCount} saves · curated calm</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            name="line.3.horizontal.decrease.circle"
            onPress={() => setSort((prev) => (prev === 'recent' ? 'oldest' : 'recent'))}
            style={sort === 'oldest' ? styles.iconActive : undefined}
          />
          <IconButton name="plus" onPress={() => router.push('/(tabs)/add')} />
          <IconButton name="person.crop.circle" onPress={() => router.push('/(tabs)/profile')} />
        </View>
      </View>

      <View style={styles.platformTabs}>
        {[
          { key: 'all', label: 'All' },
          { key: 'instagram', label: 'Instagram' },
          { key: 'tiktok', label: 'TikTok' },
          { key: 'youtube', label: 'YouTube' },
          { key: 'web', label: 'Other' },
        ].map((p) => {
          const active = platform === p.key;
          return (
            <TouchableOpacity key={p.key} style={[styles.platformChip, active && styles.platformChipActive]} onPress={() => setPlatform(p.key as any)}>
              <Text style={[styles.platformText, active && styles.platformTextActive]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showEmpty ? (
        <View style={styles.emptyContainer}>
          <Empty
            icon="tray.fill"
            title="You haven’t saved anything yet."
            subtitle="Add your first post and Nestly will organise it beautifully."
            cta={
              <Button
                title="Add your first post"
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
            if (v < -0.1) { undock(); }
            else if (v > 0.1) { dock(); }
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
  topBar: {
    paddingTop: 0,
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 0,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 2 },
  kicker: { color: theme.colors.textMuted, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: theme.colors.text,
    fontFamily: 'Sora_600SemiBold',
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 20,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surfaceAlt,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
  },
  heroTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 4, fontFamily: 'Sora_600SemiBold' },
  heroMeta: { color: theme.colors.textSecondary, fontSize: 14, marginBottom: 4, lineHeight: 20 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  glowOne: { ...StyleSheet.absoluteFillObject },
  glowTwo: { ...StyleSheet.absoluteFillObject },
  platformTabs: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  platformChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surfaceAlt,
  },
  platformChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(122,92,255,0.12)',
  },
  platformText: { color: theme.colors.textMuted, fontSize: 13 },
  platformTextActive: { color: theme.colors.text },
  sortTabs: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
    marginTop: 10,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  sortChipActive: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(122,92,255,0.12)',
  },
  sortText: { color: theme.colors.textMuted, fontSize: 13 },
  sortTextActive: { color: theme.colors.text },
  iconActive: {
    borderColor: theme.colors.accent,
    backgroundColor: 'rgba(122,92,255,0.14)',
    shadowColor: theme.colors.accentGlow,
  },
});
