// components/Feed.tsx
import he from 'he';
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  View,
  Text,
  ViewToken,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { toDeepLink } from '@/lib/deeplinks';
import * as Linking from 'expo-linking';
import { Button } from '@/components/ui/Button';
import { Empty } from '@/components/ui/Empty';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { detectPlatform } from '@/lib/url';
import { UniversalPlayer } from '@/components/player/UniversalPlayer';
import { useRouter } from 'expo-router';
import { TAB_BAR_HEIGHT, FEED_TOP_BAR } from '@/constants/layout';

type Item = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  thumbnail_url?: string | null;
  is_done: boolean;
};

export function Feed({
  tag,
  onAddLink,
  topOffset = 0, // <— extra space to subtract for top overlay
}: {
  tag: string;
  onAddLink: () => void;
  topOffset?: number;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cardH, setCardH] = useState<number | null>(null);
  const { session } = useSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const CARD_SPACING = 16;
  const MAX_CARD_HEIGHT = 520;
  const PANEL_HEIGHT = 120; // fixed to keep snapping exact

  function onLayout(e: LayoutChangeEvent) {
    const h = e.nativeEvent.layout.height;
    // Actual bottom bar footprint on-screen:
    //   - we set the TabBar's style.height = TAB_BAR_HEIGHT + insets.bottom
    //   - the margin is outside the view’s height; it should NOT be subtracted
    const bottomBar = TAB_BAR_HEIGHT + Math.max(insets.bottom, 8);
    
    // Reserve EXACTLY the bar + any top overlay space
    const reserved = bottomBar + topOffset;

    // Boxed card height: must leave room for the info panel + spacing
    const available = h - reserved;
    const spaceForCard = available - (PANEL_HEIGHT + CARD_SPACING);
    const target = Math.min(MAX_CARD_HEIGHT, spaceForCard);
    setCardH(Math.max(280, target));
  }

  async function load() {
    if (!session) return;
    let q = supabase
      .from('items')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (tag === 'Inbox') q = q.eq('is_done', false);
    if (tag !== 'All' && tag !== 'Inbox') {
      const { data: tags } = await supabase.from('item_tags').select('item_id').eq('tag', tag);
      const ids = (tags ?? []).map((t) => t.item_id);
      q = ids.length ? q.in('id', ids) : q.in('id', ['__none__']);
    }
    const { data } = await q;
    setItems((data as any) ?? []);
    setActiveId((data && data[0]?.id) ?? null);
  }

  useEffect(() => { load(); }, [tag, session?.user?.id]); // eslint-disable-line

  function open(item: Item) {
    const deep = toDeepLink(item.url);
    Linking.openURL(deep).catch(() => Linking.openURL(item.url));
  }

  async function markDone(item: Item) {
    if (tag === 'Inbox') {
      setItems((prev) => prev.filter((it) => it.id !== item.id));
    } else {
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, is_done: true } : it)));
    }
    const { error } = await supabase.from('items').update({ is_done: true }).eq('id', item.id);
    if (error) await load();
  }

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const v = viewableItems.find((vi) => vi.isViewable);
    if (v?.item?.id) setActiveId(v.item.id as string);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 98, minimumViewTime: 120 }).current;

  function render({ item }: ListRenderItemInfo<Item>) {
    if (!cardH) return null;
    const isActive = item.id === activeId;
    const platform = detectPlatform(item.url);

    return (
      <View style={{ height: (cardH + PANEL_HEIGHT + CARD_SPACING) }}>
        <View style={[styles.card, { height: cardH }]}>
          <UniversalPlayer url={item.url} platform={platform} active={isActive} height={cardH} />
        </View>

        {/* Standalone panel BELOW the player */}
        <View style={[styles.panelStandalone, { height: PANEL_HEIGHT }] }>
          <View style={styles.panelHeader}>
            <Text style={styles.pill}>{platform === 'youtube' ? 'YouTube' : platform === 'instagram' ? 'Instagram' : platform === 'tiktok' ? 'TikTok' : 'Link'}</Text>
            <Text style={styles.title} numberOfLines={2}>{he.decode(item.title ?? 'Untitled')}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={[styles.btn, styles.btnSolid]} onPress={() => open(item)}>
              <Text style={styles.btnSolidText}>Open</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => markDone(item)}>
              <Text style={styles.btnGhostText}>Done</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => router.push(`/item/${item.id}`)}>
              <Text style={styles.btnGhostText}>Details</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  if (!items.length) {
    return (
      <Empty
        title="Nothing saved here yet."
        subtitle="Add your first link to get started."
        cta={<Button title="Add a link" onPress={onAddLink} />}
      />
    );
  }

  const contentPaddingTop = FEED_TOP_BAR + Math.max(insets.top, 10);
  const paddingBottom = TAB_BAR_HEIGHT + Math.max(insets.bottom, 8);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Immersive feed */}
      <StatusBar style="light" hidden />
      {cardH && (
        <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={render}
        showsVerticalScrollIndicator={false}
        // Snap to each card + info panel block
        snapToInterval={cardH + PANEL_HEIGHT + CARD_SPACING}
        decelerationRate="fast"
        getItemLayout={(_, i) => ({ length: cardH + PANEL_HEIGHT + CARD_SPACING, offset: (cardH + PANEL_HEIGHT + CARD_SPACING) * i, index: i })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        contentContainerStyle={{ 
          paddingTop: contentPaddingTop,
          paddingBottom: paddingBottom,
          paddingHorizontal: 12,
        }}
        refreshControl={
        <RefreshControl
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await load();
          setRefreshing(false);
        }}
        />
      }
      />
      )}
    </View>
  );
}

const PANEL_RADIUS = 16;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  card: { width: '100%', backgroundColor: theme.colors.card, borderRadius: theme.radius, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.glassStroke },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 0 },

  // Standalone panel below the player
  panelStandalone: {
    marginTop: 10,
    marginBottom: 16,
    padding: 12,
    gap: 10,
    borderRadius: PANEL_RADIUS,
    backgroundColor: theme.colors.elevatedBg,
    borderWidth: 1,
    borderColor: theme.colors.glassStroke,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  panelHeader: { gap: 6 },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.glassStroke,
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  title: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },

  actions: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1 },
  btnSolid: { backgroundColor: theme.colors.brand, borderColor: theme.colors.brand },
  btnSolidText: { color: '#0B0D10', fontWeight: '800' },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' },
  btnGhostText: { color: theme.colors.text, fontWeight: '700' },
});
