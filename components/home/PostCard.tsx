import { memo, useCallback, useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { theme } from '@/constants/theme';
import { Post } from '@/hooks/usePosts';
import { logEvent } from '@/lib/analytics';
import { getFallbackThumb, detectPlatform } from '@/lib/url';
import { UniversalPlayer } from '@/components/player/UniversalPlayer';

export const PostCard = memo(function PostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logEvent('filter_select', { action: 'quick_actions_open' });
    // Minimal quick actions: copy link
    Clipboard.setStringAsync(post.url);
  }, [post.url]);

  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = useMemo(() => {
    const raw = post.thumbnail_url || getFallbackThumb(post.url) || null;
    if (!raw) return null;
    // Coerce http -> https to avoid ATS blocks on iOS
    return raw.replace(/^http:/, 'https:');
  }, [post.thumbnail_url, post.url]);

  return (
    <Pressable onPress={onPress} onLongPress={handleLongPress} style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]} accessibilityRole="button">
      {thumb && !thumbFailed ? (
        <Image
          source={{ uri: thumb }}
          style={styles.media}
          contentFit="cover"
          transition={150}
          cachePolicy="disk"
          onError={() => setThumbFailed(true)}
        />
      ) : (
        <UniversalPlayer url={post.url} platform={detectPlatform(post.url)} active={false} height={240} />
      )}
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>{post.short_title || post.title || ''}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  media: { flex: 1, width: '100%', height: '100%' },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.25)' },
  title: { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 18, minHeight: 36 },
});


