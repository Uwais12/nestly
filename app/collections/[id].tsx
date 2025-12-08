import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Glass } from '@/components/ui/Glass';
import { IconButton } from '@/components/ui/IconButton';
import { collectionsApi } from '@/hooks/useCollections';
import { PostCard } from '@/components/home/PostCard';
import { Post } from '@/hooks/usePosts';

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<Post[]>([]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const { data } = await collectionsApi.getWithItems(String(id));
    setTitle(data?.title ?? '');
    const mapped = (data?.collection_items ?? []).map((r: any) => r.item) as Post[];
    setItems(mapped);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton name="chevron.backward" onPress={() => router.back()} />
        <Text style={styles.title}>{title || 'Collection'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <Glass style={styles.card}>
        <Text style={styles.subtitle}>{items.length} posts</Text>
      </Glass>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12, gap: 14 }}
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/item/${item.id}`)}>
            <PostCard post={item as any} onPress={() => router.push(`/item/${item.id}`)} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No posts yet.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700', fontFamily: 'Sora_600SemiBold' },
  card: { padding: 14, borderRadius: theme.radius },
  subtitle: { color: theme.colors.textMuted },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 20 },
});
