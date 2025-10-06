// app/modals/add-link.tsx
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { createItemViaUnfurl } from '@/lib/api';
import { theme } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Glass } from '@/components/ui/Glass';

export default function AddLinkModal() {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const router = useRouter();

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

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          <Text style={styles.title}>Add a link</Text>
          <View style={{ width: 36 }} />
        </View>
        <Glass style={{ alignSelf: 'stretch', padding: theme.spacing(2), gap: theme.spacing(2) }}>
          <View style={styles.formRow}>
            <Input placeholder="Paste TikTok/IG/YT link" autoCapitalize="none" autoCorrect={false} value={url} onChangeText={(t) => { setUrl(t); setErrorText(''); }} />
            {!!errorText && <Text style={styles.error}>{errorText}</Text>}
          </View>
          <View style={styles.formRow}>
            <Input placeholder="Optional note" value={note} onChangeText={setNote} />
          </View>
          <Button title={loading ? 'Saving…' : 'Save to Inbox'} onPress={onSave} loading={loading} />
        </Glass>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing(3), gap: theme.spacing(2), backgroundColor: theme.colors.bg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginBottom: theme.spacing(1), textAlign: 'center', flex: 1 },
  formRow: { alignSelf: 'stretch' },
  error: { color: theme.colors.danger, marginTop: 6 },
});


