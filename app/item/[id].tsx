// app/item/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Share, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { upsertNote } from '@/lib/api';
import { theme } from '@/constants/theme';
import { UniversalPlayer } from '@/components/player/UniversalPlayer';
import { detectPlatform } from '@/lib/url';
import { decodeEntities } from '@/utils/text';
import { IconButton } from '@/components/ui/IconButton';
import { toDeepLink } from '@/lib/deeplinks';
import { Glass } from '@/components/ui/Glass';

type ItemRow = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  caption: string | null;
  thumbnail_url: string | null;
};

export default function ItemDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<ItemRow | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
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

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton name="chevron.backward" onPress={() => router.back()} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
        <IconButton name="square.and.arrow.up" onPress={() => Share.share({ message: item.url })} />
        <IconButton name="arrowshape.turn.up.right" onPress={() => openNativeOrWeb(item.url)} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 18 }}>
        <UniversalPlayer
          url={item.url}
          platform={detectPlatform(item.url)}
          thumbnail={item.thumbnail_url ?? undefined}
        />

        <Glass style={styles.card}>
          <Text style={styles.title}>{decodeEntities(item.title ?? '') || 'Untitled'}</Text>
          {!!item.author && <Text style={styles.author}>{item.author}</Text>}
          {!!item.caption && (
            <Text style={styles.caption} numberOfLines={6}>
              {decodeEntities(item.caption)}
            </Text>
          )}
          <TouchableOpacity onPress={() => openNativeOrWeb(item.url)} style={styles.primary}>
            <Text style={styles.primaryText}>Open</Text>
          </TouchableOpacity>
        </Glass>

        <Glass style={styles.section}>
          <Text style={styles.sectionTitle}>Note</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            multiline
            style={styles.input}
            placeholder="Add a note"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TouchableOpacity onPress={saveNote} style={styles.button} disabled={saving}>
            <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save Note'}</Text>
          </TouchableOpacity>
        </Glass>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: 14, gap: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  card: { borderRadius: theme.radius, borderWidth: 1, borderColor: theme.colors.glassStroke, padding: 14, gap: 8 },
  title: { color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  author: { color: theme.colors.textMuted },
  caption: { color: theme.colors.text, lineHeight: 22 },
  section: { padding: 14, gap: 10 },
  sectionTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 16 },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, padding: 12, minHeight: 92, backgroundColor: theme.colors.surface, color: theme.colors.text },
  button: { backgroundColor: 'rgba(255,255,255,0.04)', paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start', borderRadius: theme.radius, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  buttonText: { color: theme.colors.text },
  primary: { backgroundColor: theme.colors.brand, paddingVertical: 12, alignItems: 'center', borderRadius: theme.radius, marginTop: 8 },
  primaryText: { color: '#0B0D10', fontWeight: '800' },
});
