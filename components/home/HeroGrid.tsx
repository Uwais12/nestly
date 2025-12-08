import { memo, useCallback, ReactElement, useRef } from 'react';
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, View, LayoutChangeEvent } from 'react-native';
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
  onScrollableChange,
}: {
  data: Post[];
  onEndReached: () => void;
  onOpen: (id: string) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  footer?: ReactElement | null;
  startAtEnd?: boolean;
  onScrollableChange?: (scrollable: boolean) => void;
}) {
  const spacing = 20;
  const listRef = useRef<FlatList<Post>>(null);
  const didScrollToEnd = useRef(false);
  const containerHeightRef = useRef<number | null>(null);
  const contentHeightRef = useRef<number | null>(null);
  const bottomPad = spacing + TAB_BAR_HEIGHT + TAB_BAR_MARGIN + 120;

  const render = useCallback(
    ({ item }: ListRenderItemInfo<Post>) => (
      <PostCard post={item} onPress={() => onOpen(item.id)} />
    ),
    [onOpen],
  );

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={render}
      keyExtractor={(it) => it.id}
      ItemSeparatorComponent={() => <View style={{ height: 26 }} />}
      contentContainerStyle={{ paddingHorizontal: spacing, paddingVertical: spacing, paddingBottom: bottomPad }}
      onEndReachedThreshold={0.6}
      onEndReached={onEndReached}
      onScroll={onScroll}
      scrollEventThrottle={16}
      ListFooterComponent={footer ?? null}
      showsVerticalScrollIndicator={false}
      onLayout={(e: LayoutChangeEvent) => {
        containerHeightRef.current = e.nativeEvent.layout.height;
        const ch = contentHeightRef.current;
        if (typeof ch === 'number' && typeof onScrollableChange === 'function') {
          const scrollable = ch + bottomPad > (containerHeightRef.current ?? 0);
          onScrollableChange(scrollable);
        }
      }}
      onContentSizeChange={(_, h) => {
        contentHeightRef.current = h;
        if (startAtEnd && !didScrollToEnd.current && data.length > 0) {
          requestAnimationFrame(() => {
            try { listRef.current?.scrollToEnd({ animated: false }); } catch {}
            didScrollToEnd.current = true;
          });
        }
        if (typeof onScrollableChange === 'function') {
          const ch = h;
          const listH = containerHeightRef.current ?? 0;
          const scrollable = ch + bottomPad > listH;
          onScrollableChange(scrollable);
        }
      }}
    />
  );
});


