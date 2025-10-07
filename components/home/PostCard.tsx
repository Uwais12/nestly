import { memo, useCallback } from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { Post } from '@/hooks/usePosts';
import { logEvent } from '@/lib/analytics';

export const PostCard = memo(function PostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const router = useRouter();
  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logEvent('filter_select', { action: 'quick_actions_open' });
    // Minimal quick actions: copy link
    Clipboard.setStringAsync(post.url);
  }, [post.url]);

  return (
    <Pressable onPress={onPress} onLongPress={handleLongPress} style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] }]} accessibilityRole="button">
      <Image source={{ uri: post.thumbnail_url ?? undefined }} style={styles.media} contentFit="cover" transition={200} />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={1}>{post.title ?? ''}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: theme.colors.surface, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  media: { flex: 1, width: '100%', height: '100%' },
  overlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.25)' },
  title: { color: '#fff', fontSize: 14, fontWeight: '600' },
});


