// app/share.tsx
// This screen handles incoming shared URLs and auto-saves them
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { createItemViaUnfurl } from '@/lib/api';
import { detectPlatform, type Platform } from '@/lib/deeplinks';
import { theme } from '@/constants/theme';
import { Glass } from '@/components/ui/Glass';
import { PlatformPill } from '@/components/ui/PlatformPill';

export default function ShareScreen() {
  const params = useLocalSearchParams<{ url?: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>('Other');
  const [sharedUrl, setSharedUrl] = useState<string>('');

  useEffect(() => {
    const url = params.url;
    if (!url) {
      // No URL provided, redirect to home
      router.replace('/(tabs)/all');
      return;
    }

    setSharedUrl(url);
    const detectedPlatform = detectPlatform(url);
    setPlatform(detectedPlatform);

    // Auto-trigger save immediately
    handleSave(url, detectedPlatform);
  }, [params.url]);

  const handleSave = async (url: string, detectedPlatform: Platform) => {
    setSaving(true);
    setError(null);

    try {
      // Call the unfurl API which fetches metadata and auto-classifies
      const { data, error: apiError } = await createItemViaUnfurl(url);

      if (apiError) {
        throw apiError;
      }

      // Success!
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);

      // Auto-redirect after 1.5s
      setTimeout(() => {
        router.replace('/(tabs)/all');
      }, 1500);
    } catch (err) {
      console.error('Error saving shared post:', err);
      setError(err instanceof Error ? err.message : 'Failed to save post. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Redirect to add-link modal so user can try manually
      setTimeout(() => {
        router.replace(`/modals/add-link?url=${encodeURIComponent(url)}`);
      }, 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Glass style={styles.card}>
        {/* Header */}
        <Text style={styles.title}>
          {saving ? 'Saving to Nestly...' : saved ? 'Saved!' : 'Error'}
        </Text>

        {/* Platform Indicator */}
        {platform !== 'Other' && (
          <View style={styles.platformRow}>
            <Text style={styles.label}>From:</Text>
            <PlatformPill platform={platform.toLowerCase()} />
          </View>
        )}

        {/* URL Display */}
        <View style={styles.urlContainer}>
          <Text style={styles.url} numberOfLines={2}>
            {sharedUrl}
          </Text>
        </View>

        {/* Status Indicator */}
        {saving && (
          <View style={styles.statusRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.statusText}>Fetching metadata...</Text>
          </View>
        )}

        {saved && (
          <View style={styles.statusRow}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={[styles.statusText, styles.successText]}>
              Saved to your Inbox
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorSubtext}>Redirecting to manual save...</Text>
          </View>
        )}
      </Glass>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
  },
  card: {
    alignSelf: 'stretch',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1),
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  urlContainer: {
    padding: theme.spacing(2),
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: 8,
  },
  url: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
  statusText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  successIcon: {
    fontSize: 20,
    color: theme.colors.success || '#4CAF50',
  },
  successText: {
    color: theme.colors.success || '#4CAF50',
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  errorIcon: {
    fontSize: 24,
  },
  errorText: {
    fontSize: 15,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing(0.5),
  },
});

