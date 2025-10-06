// components/navigation/TagFilterBar.tsx
import { useEffect, useMemo, useState } from 'react';
import { Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase, TAGS } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { theme } from '@/constants/theme';
import { FEED_TOP_BAR } from '@/constants/layout';

type Props = {
  value: string;
  onChange: (tag: string) => void;
};

export function TagFilterBar({ value, onChange }: Props) {
  const { session } = useSession();
  const [tags, setTags] = useState<string[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      if (!session?.user?.id) return;
      // Fetch tags that are associated with the current user's items
      // We join item_tags -> items to scope to the user's data (RLS covers this too)
      const { data, error } = await supabase
        .from('item_tags')
        .select('tag, items!inner(user_id)')
        .eq('items.user_id', session.user.id);
      if (error) return;
      const userTags = Array.from(new Set((data ?? []).map((row: any) => row.tag)));
      setTags(userTags);
    })();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase
      .channel('item_tags_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'item_tags' }, async () => {
        const { data } = await supabase
          .from('item_tags')
          .select('tag, items!inner(user_id)')
          .eq('items.user_id', session.user.id);
        const fresh = Array.from(new Set((data ?? []).map((row: any) => row.tag)));
        setTags(fresh);
      })
      .subscribe();
    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [session?.user?.id]);

  // Display order: All, Inbox, then known TAGS in canonical order, but only show tags the user has
  const items = useMemo(() => {
    const available = new Set(tags);
    const orderedUserTags = TAGS.filter((t) => t !== 'Inbox' && available.has(t));
    return ['All', 'Inbox', ...orderedUserTags];
  }, [tags]);

  return (
    <BlurView
      intensity={28}
      tint="dark"
      style={[
        styles.wrap,
        {
          paddingTop: Math.max(insets.top, 10),
          height: FEED_TOP_BAR + Math.max(insets.top, 10),
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {items.map((t) => {
          const active = value === t;
          return (
            <Pressable
              key={t}
              onPress={() => onChange(t)}
              style={({ pressed }) => [
                styles.chip,
                active ? styles.chipActive : styles.chipGlass,
                pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={active ? styles.activeText : styles.glassText}>{t}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0, right: 0, top: 0,
    zIndex: 1000,
    backgroundColor: theme.colors.glassBg,
    borderBottomWidth: 1,
    borderColor: theme.colors.glassStroke,
  },
  row: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: theme.chip.padH,
    paddingVertical: theme.chip.padV,
    borderRadius: theme.chip.radius,
  },
  chipActive: { backgroundColor: theme.colors.brand },
  chipGlass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: theme.colors.glassStroke,
  },
  activeText: { color: '#0B0D10', fontWeight: '800' },
  glassText: { color: theme.colors.text, fontWeight: '700' },
});
