import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Glass } from '@/components/ui/Glass';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { IconButton } from '@/components/ui/IconButton';

type TagRow = { tag: string; count: number };

export default function ManageTagsScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    // Get tags for this user (via join on items)
    const { data, error } = await supabase
      .from('item_tags')
      .select('tag, items!inner(id,user_id)')
      .eq('items.user_id', session.user.id);
    if (error) {
      setLoading(false);
      return;
    }
    const counts = new Map<string, number>();
    (data as any[]).forEach((r) => {
      const t = r.tag as string;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    });
    const result = Array.from(counts.entries()).map(([tag, count]) => ({ tag, count }));
    setRows(result);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [session?.user?.id]);

  const removeTagEverywhere = async (tag: string) => {
    if (!session?.user?.id) return;
    const confirm = await new Promise<boolean>((resolve) => {
      Alert.alert('Remove tag?', `This will remove "${tag}" from all posts.`, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
      ]);
    });
    if (!confirm) return;
    // find all item ids for this user
    const { data: items } = await supabase.from('items').select('id').eq('user_id', session.user.id);
    const ids = (items ?? []).map((i: any) => i.id);
    if (!ids.length) return;
    await supabase.from('item_tags').delete().eq('tag', tag).in('item_id', ids);
    load();
  };

  const sorted = useMemo(() => rows.sort((a, b) => b.count - a.count), [rows]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton name="chevron.backward" onPress={() => router.back()} />
        <Text style={styles.title}>Manage Tags</Text>
        <View style={{ width: 36 }} />
      </View>

      <Glass style={styles.card}>
        <Text style={styles.subtitle}>Remove tags you no longer need. (Rename not supported yet.)</Text>
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.tag}
          contentContainerStyle={{ paddingVertical: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          refreshing={loading}
          onRefresh={load}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.tag}>{item.tag}</Text>
                <Text style={styles.count}>{item.count} posts</Text>
              </View>
              <TouchableOpacity style={styles.remove} onPress={() => removeTagEverywhere(item.tag)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Glass>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700', fontFamily: 'Sora_600SemiBold' },
  card: { flex: 1, padding: 16, gap: 12, borderRadius: theme.radius },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  tag: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  count: { color: theme.colors.textMuted, fontSize: 13 },
  remove: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: theme.colors.border },
  removeText: { color: theme.colors.danger, fontWeight: '700' },
});
