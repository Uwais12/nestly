import { memo, useCallback, useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { theme } from '@/constants/theme';
import { Post } from '@/hooks/usePosts';
import { logEvent } from '@/lib/analytics';
import { getFallbackThumb, detectPlatform } from '@/lib/url';
import { decodeEntities } from '@/utils/text';
import { IconSymbol } from '@/components/ui/icon-symbol';

const formatSavedAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Saved today';
  if (days === 1) return 'Saved yesterday';
  if (days < 30) return `Saved ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Saved ${months} mo ago`;
  const years = Math.floor(months / 12);
  return `Saved ${years} yr${years > 1 ? 's' : ''} ago`;
};

export const PostCard = memo(function PostCard({ post, onPress }: { post: Post; onPress: () => void }) {
  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logEvent('filter_select', { action: 'quick_actions_open' });
    Clipboard.setStringAsync(post.url);
  }, [post.url]);

  const [thumbFailed, setThumbFailed] = useState(false);
  const thumb = useMemo(() => {
    const raw = post.thumbnail_url || getFallbackThumb(post.url) || null;
    if (!raw) return null;
    return raw.replace(/^http:/, 'https:');
  }, [post.thumbnail_url, post.url]);
  const platform = detectPlatform(post.url);
  const tags = (post as any)?.item_tags?.map((t: any) => t.tag).filter(Boolean).slice(0, 3) ?? [];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.02)', 'rgba(122,92,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.thumbShell}>
        {thumb && !thumbFailed ? (
          <Image
            source={{ uri: thumb }}
            style={styles.thumb}
            contentFit="cover"
            transition={150}
            cachePolicy="disk"
            onError={() => setThumbFailed(true)}
          />
        ) : (
          <View style={styles.thumbFallback}>
            <IconSymbol name="photo" size={22} color={theme.colors.textMuted} />
          </View>
        )}
        <View style={styles.platformPill}>
          <Text style={styles.platformText}>{platform?.toUpperCase?.() ?? 'LINK'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {decodeEntities(post.short_title || post.title || 'Saved post')}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {post.author ? `@${post.author}` : 'Unknown creator'} • {formatSavedAgo(post.created_at)}
        </Text>
        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag: string) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 14,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    minHeight: 150,
  },
  pressed: { transform: [{ translateY: -2 }], opacity: 0.96 },
  thumbShell: {
    width: 104,
    height: 104,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  platformPill: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  platformText: { color: '#fff', fontSize: 11, fontFamily: 'Sora_600SemiBold', letterSpacing: 0.3 },
  body: { flex: 1, gap: 10, justifyContent: 'center' },
  title: { color: theme.colors.text, fontSize: 17, fontWeight: '700', letterSpacing: -0.2, fontFamily: 'Sora_600SemiBold', lineHeight: 24 },
  meta: { color: theme.colors.textMuted, fontSize: 13, fontFamily: 'Sora_400Regular' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  tagText: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: 'Sora_500Medium' },
});


