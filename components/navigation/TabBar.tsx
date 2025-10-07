import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN } from '@/constants/layout';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  console.log('[TabBar] mounted, route index:', state.index);

  const go = (name: string, key: string, focused: boolean) => {
    const e = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true });
    if (!focused && !e.defaultPrevented) navigation.navigate(name as never);
  };

  const items = [
    { key: state.routes[0].key, name: 'all', icon: 'house.fill' as const },
    { key: state.routes[1].key, name: 'add', icon: 'plus.circle.fill' as const },
    { key: state.routes[2].key, name: 'profile', icon: 'person.crop.circle' as const },
  ];

  return (
    <BlurView
      intensity={28}
      tint="light"
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: TAB_BAR_HEIGHT + Math.max(insets.bottom, 8),
          margin: TAB_BAR_MARGIN,
        },
      ]}
      pointerEvents="auto"
    >
      <View style={styles.row}>
        {items.map((it, idx) => {
          const focused = state.index === idx;
          const center = it.name === 'add';
          const color = focused && !center ? theme.colors.brand : theme.colors.textMuted;
          return (
            <Pressable
              key={it.key}
              accessibilityRole="button"
              onPress={() => {
                if (it.name === 'add') router.push('/modals/add-link');
                else go(it.name, it.key, focused);
              }}
              style={({ pressed }) => [
                styles.item,
                center && styles.center,
                pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
            >
              <IconSymbol
                name={it.icon}
                size={center ? 34 : 22}
                color={center ? theme.colors.brand : color}
              />
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    zIndex: 999,
    borderRadius: 22,
    backgroundColor: theme.colors.glassBg,
    borderWidth: 1,
    borderColor: theme.colors.glassStroke,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly' },
  item: { padding: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  center: { backgroundColor: 'rgba(255,255,255,0.06)' },
});
