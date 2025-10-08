import { memo, useCallback, ReactElement, useRef } from 'react';
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions, View } from 'react-native';
//
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN } from '@/constants/layout';
import { Post } from '@/hooks/usePosts';
import { PostCard } from '@/components/home/PostCard';

export const HeroGrid = memo(function HeroGrid({
  data,
  onEndReached,
  onOpen,
  onScroll,
  footer,
  startAtEnd,
}: {
  data: Post[];
  onEndReached: () => void;
  onOpen: (id: string) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  footer?: ReactElement | null;
  startAtEnd?: boolean;
}) {
  const { width, height } = useWindowDimensions();
  const spacing = 12;
  const cardW = Math.floor((width - spacing * 3) / 2);
  const cardH = Math.floor(((height * 0.75) - spacing * 3) / 2);
  const listRef = useRef<FlatList<Post>>(null);
  const didScrollToEnd = useRef(false);

  const render = useCallback(({ item }: ListRenderItemInfo<Post>) => {
    return (
      <View style={{ width: cardW, height: cardH, margin: spacing / 2 }}>
        <PostCard post={item} onPress={() => onOpen(item.id)} />
      </View>
    );
  }, [cardW, cardH, onOpen]);

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={render}
      keyExtractor={(it) => it.id}
      numColumns={2}
      contentContainerStyle={{ padding: spacing, paddingBottom: spacing + TAB_BAR_HEIGHT + TAB_BAR_MARGIN + 80 }}
      onEndReachedThreshold={0.6}
      onEndReached={onEndReached}
      onScroll={onScroll}
      scrollEventThrottle={16}
      ListFooterComponent={footer ?? null}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => {
        if (startAtEnd && !didScrollToEnd.current && data.length > 0) {
          requestAnimationFrame(() => {
            try { listRef.current?.scrollToEnd({ animated: false }); } catch {}
            didScrollToEnd.current = true;
          });
        }
      }}
    />
  );
});

// removed unused styles


