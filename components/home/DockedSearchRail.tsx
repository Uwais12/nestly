import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN } from '@/constants/layout';
import { SearchBar } from '@/components/home/SearchBar';
import { ChipList } from '@/components/home/ChipList';

export function DockedSearchRail({ visible, query, onQuery, selected, onToggle }: { visible: boolean; query: string; onQuery: (q: string) => void; selected: string[]; onToggle: (t: string) => void; }) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(100);

  useEffect(() => {
    y.value = withTiming(visible ? 0 : 120, { duration: 200 });
  }, [visible, y]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View style={[
      styles.wrap,
      style,
      { paddingBottom: Math.max(insets.bottom, 8), bottom: TAB_BAR_HEIGHT + TAB_BAR_MARGIN + 10 }
    ]}
      pointerEvents={visible ? 'auto' : 'none'}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'yes' : 'no-hide-descendants'}
    >
      <SearchBar value={query} onChange={onQuery} compact />
      <View style={{ height: 8 }} />
      <ChipList selected={selected} onToggle={onToggle} compact />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 10, right: 10, backgroundColor: theme.colors.glassBg, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.glassStroke, padding: 10, zIndex: 998 },
});


