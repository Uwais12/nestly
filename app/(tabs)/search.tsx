import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { SearchBar } from '@/components/home/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { usePosts } from '@/hooks/usePosts';
import { TAGS } from '@/lib/supabase';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';

type ParsedQuery = {
  cleanedQuery: string;
  autoTags: string[];
  filters: { after?: string; before?: string; platforms?: string[]; sort?: 'recent' | 'oldest' };
};

const TAG_KEYWORDS = TAGS.map((t) => t.toLowerCase());
const PLATFORM_KEYWORDS: Record<string, string> = {
  instagram: 'instagram',
  insta: 'instagram',
  ig: 'instagram',
  reels: 'instagram',
  tiktok: 'tiktok',
  tt: 'tiktok',
  youtube: 'youtube',
  yt: 'youtube',
  web: 'web',
};

function parseRelativeDate(text: string): { after?: string; before?: string } {
  const now = new Date();
  const lower = text.toLowerCase();
  if (lower.includes('yesterday')) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return { after: d.toISOString() };
  }
  if (lower.includes('today')) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { after: start.toISOString() };
  }
  const match = lower.match(/(\d+)\s+(day|week|month|year)s?\s+ago/);
  if (match) {
    const [, numStr, unit] = match;
    const n = Number(numStr);
    const d = new Date(now);
    if (unit.startsWith('day')) d.setDate(d.getDate() - n);
    else if (unit.startsWith('week')) d.setDate(d.getDate() - n * 7);
    else if (unit.startsWith('month')) d.setMonth(d.getMonth() - n);
    else if (unit.startsWith('year')) d.setFullYear(d.getFullYear() - n);
    return { after: d.toISOString() };
  }
  return {};
}

function parseQuery(input: string): ParsedQuery {
  const filters: ParsedQuery['filters'] = { sort: 'recent' };
  const tokens = input.split(/\s+/);
  const autoTags = new Set<string>();
  const platforms = new Set<string>();
  const remaining: string[] = [];

  const dateFilters = parseRelativeDate(input);
  if (dateFilters.after) filters.after = dateFilters.after;
  if (dateFilters.before) filters.before = dateFilters.before;

  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (PLATFORM_KEYWORDS[lower]) {
      platforms.add(PLATFORM_KEYWORDS[lower]);
      continue;
    }
    if (TAG_KEYWORDS.includes(lower)) {
      autoTags.add(t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
      continue;
    }
    remaining.push(t);
  }

  if (platforms.size) filters.platforms = Array.from(platforms);
  const cleanedQuery = remaining.join(' ').trim();
  return { cleanedQuery, autoTags: Array.from(autoTags), filters };
}

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([
    'minimalist apartment ideas',
    'workout with dumbbells',
    'climbing training drills',
    'posts from 2023',
  ]);

  const parsed = useMemo(() => parseQuery(query), [query]);
  const mergedTags = useMemo(() => Array.from(new Set([...selectedTags, ...parsed.autoTags])), [selectedTags, parsed.autoTags]);

  const { items, loading } = usePosts({ tags: mergedTags, search: parsed.cleanedQuery || query, filters: parsed.filters });

  const showResults = useMemo(
    () => (parsed.cleanedQuery || query).trim().length > 0 || mergedTags.length > 0,
    [parsed.cleanedQuery, query, mergedTags.length],
  );

  useEffect(() => {
    if (query.trim().length < 3) return;
    setRecent((prev) => {
      const existing = prev.filter((p) => p.toLowerCase() !== query.trim().toLowerCase());
      return [query.trim(), ...existing].slice(0, 6);
    });
  }, [query]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const liveSuggestions = useMemo(() => {
    if (!query.trim()) {
      return [
        'Recipes with chicken',
        'Posts from 2023',
        'Anything saved from Instagram Reels',
        'Climbing training drills',
      ];
    }
    return [
      `${query.trim()} from this year`,
      `Posts tagged ${selectedTags[0] ?? 'any tag'}`,
      `Anything saved from ${query.split(' ')[0] || 'Instagram'}`,
    ];
  }, [query, selectedTags]);

  const columns = useMemo(() => {
    const left: typeof items = [];
    const right: typeof items = [];
    items.forEach((item, idx) => (idx % 2 === 0 ? left : right).push(item));
    return { left, right };
  }, [items]);

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
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 0.8 }}
          style={styles.glowOne}
        />
        <LinearGradient
          colors={['#5CE1E612', '#00000000']}
          start={{ x: 0.8, y: 0.1 }}
          end={{ x: 0.2, y: 1 }}
          style={styles.glowTwo}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Search your memory</Text>
          <Text style={styles.subtitle}>A hero-level, atmospheric search that feels effortless.</Text>
        </View>

        <View style={styles.heroCard}>
          <SearchBar value={query} onChange={setQuery} placeholder="Search your memory…" />
          <View style={styles.suggestionList}>
            {liveSuggestions.map((s) => (
              <TouchableOpacity key={s} onPress={() => setQuery(s.replace(/[“”]/g, ''))} style={styles.suggestionRow} activeOpacity={0.85}>
                <View style={styles.suggestionDot} />
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ marginTop: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {TAGS.filter((t) => t !== 'Inbox').map((tag) => (
                <Chip
                  key={tag}
                  title={tag}
                  onPress={() => toggleTag(tag)}
                  selected={selectedTags.includes(tag)}
                  variant={selectedTags.includes(tag) ? 'solid' : 'glass'}
                  compact
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {!showResults && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Recent searches</Text>
              {recent.map((r) => (
                <TouchableOpacity key={r} onPress={() => setQuery(r)} style={styles.recentRow} activeOpacity={0.85}>
                  <Text style={styles.bullet}>○</Text>
                  <Text style={styles.recentText}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {showResults && (
          <View style={styles.section}>
            <Text style={styles.sectionMeta}>{items.length} result{items.length === 1 ? '' : 's'} found</Text>
            {loading && <ActivityIndicator color={theme.colors.textAccent} style={{ marginVertical: 16 }} />}
            {!loading && items.length === 0 && (
              <Empty
                title="No posts match your search"
                subtitle="Try different keywords or clear filters."
                cta={<Button title="Browse all saves" variant="subtle" onPress={() => { setQuery(''); setSelectedTags([]); }} />}
                icon="magnifyingglass"
              />
            )}
            {!loading && items.length > 0 && (
              <View style={styles.resultsGrid}>
                <View style={styles.resultsColumnWide}>
                  {columns.left.map((item) => (
                    <SearchResultCard
                      key={item.id}
                      thumbnail={item.thumbnail_url ?? undefined}
                      title={item.short_title || item.title || 'Untitled'}
                      author={item.author || 'Unknown'}
                      url={item.url}
                      onPress={() => router.push(`/item/${item.id}`)}
                    />
                  ))}
                </View>
                <View style={styles.resultsColumnNarrow}>
                  {columns.right.map((item) => (
                    <SearchResultCard
                      key={item.id}
                      thumbnail={item.thumbnail_url ?? undefined}
                      title={item.short_title || item.title || 'Untitled'}
                      author={item.author || 'Unknown'}
                      url={item.url}
                      onPress={() => router.push(`/item/${item.id}`)}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchResultCard({ thumbnail, title, author, url, onPress }: { thumbnail?: string; title: string; author: string; url: string; onPress: () => void; }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.9}>
      <LinearGradient
        colors={['rgba(255,255,255,0.02)', 'rgba(122,92,255,0.06)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.thumbnailShell}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.thumbnail} contentFit="cover" />
        ) : (
          <View style={[styles.thumbnail, styles.thumbFallback]}>
            <IconSymbol name="photo" size={20} color={theme.colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.cardMeta} numberOfLines={1}>@{author}</Text>
        <View style={styles.cardFooter}>
          <IconSymbol name="arrow.up.right" size={14} color={theme.colors.textMuted} />
          <Text style={styles.cardUrl} numberOfLines={1}>{url.replace(/^https?:\/\//, '')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 140, gap: 18 },
  header: { marginTop: 4, gap: 6 },
  title: { color: theme.colors.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.3, fontFamily: 'Sora_600SemiBold' },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, fontFamily: 'Sora_400Regular', lineHeight: 20 },
  heroCard: {
    marginTop: 8,
    padding: 18,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    gap: 14,
  },
  suggestionList: { gap: 10, marginTop: 4 },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  suggestionDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: theme.colors.accent },
  suggestionText: { color: theme.colors.textSecondary, fontSize: 14 },
  section: { gap: 10, marginTop: 18 },
  sectionLabel: { color: theme.colors.textMuted, fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '700' },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  bullet: { color: theme.colors.textMuted, fontSize: 12 },
  recentText: { color: theme.colors.text, fontSize: 15 },
  sectionMeta: { color: theme.colors.textSecondary, fontSize: 13 },
  resultsGrid: { flexDirection: 'row', gap: 18, marginTop: 10 },
  resultsColumnWide: { flex: 1, gap: 14 },
  resultsColumnNarrow: { flex: 0.92, gap: 14 },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    overflow: 'hidden',
  },
  thumbnailShell: { width: 84, height: 84, borderRadius: 14, overflow: 'hidden', backgroundColor: theme.colors.surfaceAlt, borderWidth: 1, borderColor: theme.colors.borderSubtle },
  thumbnail: { width: '100%', height: '100%' },
  thumbFallback: { backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, minWidth: 0, gap: 6 },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700', lineHeight: 22, fontFamily: 'Sora_600SemiBold' },
  cardMeta: { color: theme.colors.textSecondary, fontSize: 13 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardUrl: { color: theme.colors.textMuted, fontSize: 12, flex: 1 },
  glowOne: { ...StyleSheet.absoluteFillObject },
  glowTwo: { ...StyleSheet.absoluteFillObject },
});
