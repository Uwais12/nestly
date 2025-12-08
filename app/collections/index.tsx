import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Glass } from '@/components/ui/Glass';
import { IconButton } from '@/components/ui/IconButton';
import { useCollections, collectionsApi } from '@/hooks/useCollections';

export default function CollectionsScreen() {
  const { collections, loading, refresh } = useCollections();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await collectionsApi.create({ title: title.trim(), description: desc.trim() || null });
    setTitle('');
    setDesc('');
    setSaving(false);
    refresh();
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Delete collection?', 'Items stay saved; only this collection link will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await collectionsApi.delete(id); refresh(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <IconButton name="chevron.backward" onPress={() => router.back()} />
        <Text style={styles.title}>Collections</Text>
        <View style={{ width: 36 }} />
      </View>

      <Glass style={styles.card}>
        <Text style={styles.subtitle}>Create “vaults” to group posts.</Text>
        <TextInput
          placeholder="Collection title"
          placeholderTextColor={theme.colors.textMuted}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Optional description"
          placeholderTextColor={theme.colors.textMuted}
          value={desc}
          onChangeText={setDesc}
          style={[styles.input, { height: 46 }]}
        />
        <TouchableOpacity style={[styles.createBtn, (!title.trim() || saving) && { opacity: 0.6 }]} onPress={create} disabled={!title.trim() || saving}>
          <Text style={styles.createText}>{saving ? 'Creating…' : 'Create collection'}</Text>
        </TouchableOpacity>
      </Glass>

      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={refresh}
        contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
        renderItem={({ item }) => {
          const count = item.collection_items?.[0]?.count ?? 0;
          return (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/collections/${item.id}`)}>
              <View>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowMeta}>{count} posts</Text>
              </View>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No collections yet.</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '700', fontFamily: 'Sora_600SemiBold' },
  card: { gap: 10, padding: 14, borderRadius: theme.radius },
  subtitle: { color: theme.colors.textMuted, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: theme.radius,
    padding: 12,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  createBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.radius,
    backgroundColor: theme.colors.brand,
  },
  createText: { color: '#fff', fontWeight: '700' },
  row: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  rowMeta: { color: theme.colors.textMuted, fontSize: 13 },
  deleteBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)' },
  deleteText: { color: theme.colors.danger, fontWeight: '700' },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 20 },
});
