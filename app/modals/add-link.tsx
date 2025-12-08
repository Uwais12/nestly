// app/modals/add-link.tsx
import { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createItemViaUnfurl } from '@/lib/api';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Glass } from '@/components/ui/Glass';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function AddLinkModal() {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams<{ url?: string | string[]; note?: string | string[] }>();

  useEffect(() => {
    const incomingUrl = Array.isArray(params?.url) ? params?.url?.[0] : params?.url;
    const incomingNote = Array.isArray(params?.note) ? params?.note?.[0] : params?.note;
    if (incomingUrl && !url) setUrl(String(incomingUrl));
    if (incomingNote && !note) setNote(String(incomingNote));
  }, [params]);

  async function onSave() {
    if (!/^https?:\/\//i.test(url)) { setErrorText('Enter a valid URL'); return; }
    setLoading(true);
    const { error } = await createItemViaUnfurl(url, note);
    setLoading(false);
    if (error) { setErrorText(error.message ?? 'Failed to save'); return; }
    else {
      Alert.alert('Saved', 'Saved to Inbox');
      router.replace('/(tabs)/all');
    }
  }

  const processingMessage = useMemo(() => {
    const steps = [
      'Feathering your post…',
      'Collecting metadata…',
      'Preparing tags…',
      'Almost there…',
      'Sorting your memory…',
    ];
    const idx = Math.min(steps.length - 1, Math.floor(Math.random() * steps.length));
    return steps[idx];
  }, [loading]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <LinearGradient colors={['#0D0F12', '#0D0F12']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['#7A5CFF22', '#00000000']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 0.9 }} style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <IconButton
            name="xmark"
            onPress={() => {
              // Close the modal if we can, else go home
              // @ts-ignore: canGoBack exists at runtime
              if (typeof router.canGoBack === 'function' && router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/all');
              }
            }}
          />
          <Text style={styles.title}>Add a post</Text>
          <View style={{ width: 36 }} />
        </View>
        <Glass style={styles.hero}>
          <View style={styles.iconCircle}>
            <IconSymbol name="link" size={28} color={theme.colors.text} />
          </View>
          <Text style={styles.heroTitle}>Paste a URL</Text>
          <Text style={styles.heroSubtitle}>Nestly will fetch metadata, auto-tag, and save it beautifully.</Text>
        </Glass>

        <Glass style={styles.formCard}>
          <View style={styles.formRow}>
            <Input
              placeholder="https://instagram.com/p/..."
              autoCapitalize="none"
              autoCorrect={false}
              value={url}
              onChangeText={(t) => { setUrl(t); setErrorText(''); }}
            />
            {!!errorText && <Text style={styles.error}>{errorText}</Text>}
          </View>
          <View style={styles.formRow}>
            <Input placeholder="Optional note" value={note} onChangeText={setNote} />
          </View>

          {url.length > 0 && (
            <View style={styles.preview}>
              <Text style={styles.previewLabel}>Metadata preview</Text>
              <View style={styles.previewBody}>
                <View style={styles.previewThumb} />
                <View style={styles.previewTextCol}>
                  <Text style={styles.previewTitle} numberOfLines={1}>{url.replace(/^https?:\/\//, '')}</Text>
                  <Text style={styles.previewMeta}>Platform detected automatically · AI tags ready</Text>
                </View>
              </View>
            </View>
          )}

          {loading ? (
            <View style={styles.processing}>
              <ActivityIndicator color={theme.colors.textAccent} />
              <Text style={styles.processingText}>Feathering your post…</Text>
              <Text style={styles.processingSub}>{processingMessage}</Text>
            </View>
          ) : (
            <Button title="Save to Nestly" onPress={onSave} loading={loading} size="lg" />
          )}
        </Glass>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing(3), gap: theme.spacing(2), backgroundColor: theme.colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginBottom: theme.spacing(1), textAlign: 'center', flex: 1, fontFamily: 'Sora_600SemiBold' },
  formRow: { alignSelf: 'stretch' },
  error: { color: theme.colors.danger, marginTop: 6 },
  hero: { alignSelf: 'stretch', padding: theme.spacing(3), alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: 'rgba(122,92,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700', fontFamily: 'Sora_600SemiBold' },
  heroSubtitle: { color: theme.colors.textMuted, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  formCard: { alignSelf: 'stretch', padding: theme.spacing(2), gap: theme.spacing(2), borderRadius: 24 },
  preview: { gap: 10 },
  previewLabel: { color: theme.colors.textMuted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.4 },
  previewBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  previewThumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: theme.colors.borderSubtle },
  previewTextCol: { flex: 1, gap: 4 },
  previewTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  previewMeta: { color: theme.colors.textMuted, fontSize: 13 },
  processing: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  processingText: { color: theme.colors.text, fontWeight: '700' },
  processingSub: { color: theme.colors.textMuted, fontSize: 13 },
});


