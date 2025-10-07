import { memo, useCallback, ReactElement } from 'react';
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Post } from '@/hooks/usePosts';
import { PostCard } from '@/components/home/PostCard';

export const HeroGrid = memo(function HeroGrid({
  data,
  onEndReached,
  onOpen,
  onScroll,
  footer,
}: {
  data: Post[];
  onEndReached: () => void;
  onOpen: (id: string) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  footer?: ReactElement | null;
}) {
  const { width, height } = useWindowDimensions();
  const spacing = 12;
  const cardW = Math.floor((width - spacing * 3) / 2);
  const cardH = Math.floor(((height * 0.75) - spacing * 3) / 2);

  const render = useCallback(({ item }: ListRenderItemInfo<Post>) => {
    return (
      <View style={{ width: cardW, height: cardH, margin: spacing / 2 }}>
        <PostCard post={item} onPress={() => onOpen(item.id)} />
      </View>
    );
  }, [cardW, cardH, onOpen]);

  return (
    <FlatList
      data={data}
      renderItem={render}
      keyExtractor={(it) => it.id}
      numColumns={2}
      contentContainerStyle={{ padding: spacing }}
      onEndReachedThreshold={0.6}
      onEndReached={onEndReached}
      onScroll={onScroll}
      scrollEventThrottle={16}
      ListFooterComponent={footer ?? null}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({});


