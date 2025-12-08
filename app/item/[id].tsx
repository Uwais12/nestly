// app/item/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { upsertNote } from '@/lib/api';
import { theme } from '@/constants/theme';
import { UniversalPlayer } from '@/components/player/UniversalPlayer';
import { detectPlatform } from '@/lib/url';
import { decodeEntities } from '@/utils/text';
import { IconButton } from '@/components/ui/IconButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { toDeepLink } from '@/lib/deeplinks';
import { Glass } from '@/components/ui/Glass';
import { Chip } from '@/components/ui/Chip';
import { PlatformPill } from '@/components/ui/PlatformPill';
import { useCollections, collectionsApi } from '@/hooks/useCollections';

type ItemRow = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  caption: string | null;
  thumbnail_url: string | null;
  created_at: string;
  item_tags?: { tag: string }[];
};

export default function ItemDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ItemRow | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { collections, refresh: refreshCollections } = useCollections();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, item_tags(tag)')
        .eq('id', id)
        .single();
      if (!error && data) {
        setItem(data as ItemRow);
        // pull note if exists
        const { data: n } = await supabase.from('notes').select('body').eq('item_id', id).single();
        setNote(n?.body ?? '');
      }
    })();
  }, [id]);

  const tags = useMemo(() => item?.item_tags?.map((t) => t.tag).filter(Boolean) ?? [], [item?.item_tags]);

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.textAccent} />
      </View>
    );
  }

  async function openNativeOrWeb(url: string) {
    const deep = toDeepLink(url);
    Linking.openURL(deep).catch(() => Linking.openURL(url));
  }

  async function saveNote() {
    if (!id) return;
    setSaving(true);
    const { error } = await upsertNote(String(id), note);
    setSaving(false);
    if (error) { Alert.alert('Error', error.message); }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete this item?',
      'This will remove it from your Nestly list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('items').delete().eq('id', id);
            if (error) {
              Alert.alert('Error', error.message);
              return;
            }
            router.back();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={['#0D0F12', '#0D0F12']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['#7A5CFF22', '#00000000']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 0.9 }} style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.header}>
        <IconButton name="chevron.backward" onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton name="trash" onPress={confirmDelete} />
          <IconButton name="square.and.arrow.up" onPress={() => Share.share({ message: item.url })} />
          <IconButton name="arrowshape.turn.up.right" onPress={() => openNativeOrWeb(item.url)} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.mediaContainer}>
          <UniversalPlayer
            url={item.url}
            platform={detectPlatform(item.url)}
            thumbnail={item.thumbnail_url ?? undefined}
          />
        </View>

        <Glass style={styles.card}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.author?.[0]?.toUpperCase() ?? 'N'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{item.author ?? 'Unknown creator'}</Text>
              <PlatformPill platform={detectPlatform(item.url)} />
            </View>
            <IconButton name="arrow.up.right" onPress={() => openNativeOrWeb(item.url)} />
          </View>

          <Text style={styles.title}>{decodeEntities(item.title ?? '') || 'Untitled'}</Text>
          {!!item.caption && (
            <Text style={styles.caption} numberOfLines={6}>
              {decodeEntities(item.caption)}
            </Text>
          )}

          <View style={styles.metaInline}>
            <Text style={styles.metaInlineText}>Saved {new Date(item.created_at).toLocaleDateString()}</Text>
            <Text style={styles.metaInlineText}>Platform · {detectPlatform(item.url)}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionPill} onPress={() => openNativeOrWeb(item.url)}>
              <IconSymbol name="arrow.up.right" size={18} color={theme.colors.text} />
              <Text style={styles.actionText}>Open original</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionPill} onPress={() => Share.share({ message: item.url })}>
              <IconSymbol name="square.and.arrow.up" size={18} color={theme.colors.text} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionPill} onPress={() => { refreshCollections(); setPickerOpen(true); }}>
              <IconSymbol name="folder" size={18} color={theme.colors.text} />
              <Text style={styles.actionText}>Add to collection</Text>
            </TouchableOpacity>
          </View>
        </Glass>

        {tags.length > 0 && (
          <Glass style={styles.section}>
            <Text style={styles.sectionLabel}>AI-generated tags</Text>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <Chip key={tag} title={tag} onPress={() => {}} variant="glass" selected style={styles.tag} />
              ))}
            </View>
          </Glass>
        )}

        <Glass style={styles.section}>
          <Text style={styles.sectionLabel}>Note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            style={styles.input}
            placeholder="Add a note"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TouchableOpacity onPress={saveNote} style={styles.primary} disabled={saving}>
            <Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save note'}</Text>
          </TouchableOpacity>
        </Glass>

        <Glass style={styles.section}>
          <Text style={styles.sectionLabel}>Metadata</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Saved</Text>
            <Text style={styles.metaValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Source</Text>
            <Text style={styles.metaValue}>{detectPlatform(item.url)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Open original</Text>
            <TouchableOpacity onPress={() => openNativeOrWeb(item.url)}>
              <Text style={[styles.metaValue, { color: theme.colors.textAccent }]}>View</Text>
            </TouchableOpacity>
          </View>
        </Glass>
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionLabel}>Select a collection</Text>
            <ScrollView contentContainerStyle={{ gap: 10 }}>
              {collections.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.collectionRow}
                  onPress={async () => {
                    setAdding(true);
                    await collectionsApi.addItem(c.id, item.id);
                    setAdding(false);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.collectionTitle}>{c.title}</Text>
                  <Text style={styles.collectionMeta}>{c.collection_items?.[0]?.count ?? 0} posts</Text>
                </TouchableOpacity>
              ))}
              {collections.length === 0 && <Text style={styles.collectionMeta}>No collections yet. Create one in Profile.</Text>}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setPickerOpen(false)} disabled={adding}>
              <Text style={styles.closeText}>{adding ? 'Adding…' : 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 16, gap: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  mediaContainer: {
    borderRadius: theme.radius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  card: { borderRadius: theme.radius, borderWidth: 1, borderColor: theme.colors.glassStroke, padding: 16, gap: 12 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '800', fontFamily: 'Sora_600SemiBold' },
  caption: { color: theme.colors.textSecondary, lineHeight: 22, fontFamily: 'Sora_400Regular' },
  section: { padding: 16, gap: 12, marginTop: 12, borderRadius: theme.radius },
  sectionLabel: { color: theme.colors.textMuted, fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, padding: 14, minHeight: 92, backgroundColor: theme.colors.surface, color: theme.colors.text },
  primary: { backgroundColor: theme.colors.brand, paddingVertical: 12, alignItems: 'center', borderRadius: theme.radius, marginTop: 4 },
  primaryText: { color: '#f8f8fc', fontWeight: '800' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.accentGlow, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.textAccent, fontSize: 18, fontWeight: '800' },
  authorName: { color: theme.colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'Sora_600SemiBold' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { marginRight: 0 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { color: theme.colors.textSecondary },
  metaValue: { color: theme.colors.text },
  metaInline: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metaInlineText: { color: theme.colors.textMuted, fontSize: 13 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionPill: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  actionText: { color: theme.colors.text, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: 12,
  },
  collectionRow: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
  },
  collectionTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  collectionMeta: { color: theme.colors.textMuted, fontSize: 13 },
  closeBtn: { alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: theme.colors.surfaceAlt },
  closeText: { color: theme.colors.text, fontWeight: '700' },
});
