import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN } from '@/constants/layout';
import { SearchBar } from '@/components/home/SearchBar';
import { ChipList } from '@/components/home/ChipList';

export function DockedSearchRail({ visible, query, onQuery, selected, onToggle, forceVisible = false }: { visible: boolean; query: string; onQuery: (q: string) => void; selected: string[]; onToggle: (t: string) => void; forceVisible?: boolean; }) {
  const insets = useSafeAreaInsets();
  const y = useSharedValue(100);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    y.value = withTiming((visible || forceVisible) ? 0 : 120, { duration: 200 });
  }, [visible, forceVisible, y]);

  // Keep the rail above the keyboard when editing
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s = Keyboard.addListener(show, (e) => {
      const h = e?.endCoordinates?.height ?? 0;
      setKeyboardOffset(h);
    });
    const hSub = Keyboard.addListener(hide, () => setKeyboardOffset(0));
    return () => { try { s.remove(); } catch {} try { hSub.remove(); } catch {} };
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View style={[
      styles.wrap,
      style,
      { paddingBottom: Math.max(insets.bottom, 8), bottom: TAB_BAR_HEIGHT + TAB_BAR_MARGIN + 10 + keyboardOffset }
    ]}
      pointerEvents={(visible || forceVisible) ? 'auto' : 'none'}
      accessibilityElementsHidden={!(visible || forceVisible)}
      importantForAccessibility={(visible || forceVisible) ? 'yes' : 'no-hide-descendants'}
    >
      <SearchBar value={query} onChange={onQuery} compact />
      <View style={{ height: 8 }} />
      <ChipList selected={selected} onToggle={onToggle} compact />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    backgroundColor: theme.colors.glassBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.glassStroke,
    padding: 12,
    zIndex: 998,
    shadowColor: theme.colors.accentGlow,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
});


