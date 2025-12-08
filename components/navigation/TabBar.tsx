import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN } from '@/constants/layout';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const go = (name: string, key: string, focused: boolean) => {
    const e = navigation.emit({ type: 'tabPress', target: key, canPreventDefault: true });
    if (!focused && !e.defaultPrevented) navigation.navigate(name as never);
  };

  const config: Record<string, { icon: any; label: string }> = {
    all: { icon: 'house.fill', label: 'Home' },
    search: { icon: 'magnifyingglass', label: 'Search' },
    add: { icon: 'plus', label: 'Add' },
    profile: { icon: 'person.circle', label: 'Profile' },
  };

  const items = state.routes
    .map((route) => ({ ...config[route.name], key: route.key, name: route.name }))
    .filter(Boolean) as { key: string; name: string; icon: any; label: string }[];

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 14),
          margin: TAB_BAR_MARGIN + 2,
        },
      ]}
      pointerEvents="auto"
    >
      <LinearGradient
        colors={['rgba(19,22,26,0.98)', 'rgba(19,22,26,0.86)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['#7A5CFF22', '#5CE1E612', 'transparent']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.row}>
        {items.map((it, idx) => {
          const focused = state.index === idx;
          const center = it.name === 'add';
          const color = focused ? '#fff' : theme.colors.textMuted;

          if (center) {
            return (
              <Pressable
                key={it.key}
                accessibilityRole="button"
                onPress={() => router.push('/modals/add-link')}
                style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
              >
                <View style={styles.addInner}>
                  <IconSymbol name="plus" size={24} color="#fff" />
                </View>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={it.key}
              accessibilityRole="button"
              onPress={() => go(it.name, it.key, focused)}
              style={({ pressed }) => [styles.item, focused && styles.itemActive, pressed && styles.itemPressed]}
            >
              <View style={[styles.iconPill, focused && styles.iconPillActive]}>
                <IconSymbol name={it.icon} size={22} color={color} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]}>{it.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    minHeight: TAB_BAR_HEIGHT,
    borderRadius: 22,
    backgroundColor: 'rgba(13,15,18,0.94)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 18 },
    elevation: 18,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 10,
    width: '100%',
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 70,
  },
  itemPressed: { opacity: 0.9 },
  itemActive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
  },
  label: { fontSize: 11, color: theme.colors.textMuted, fontFamily: 'Sora_500Medium' },
  labelActive: { color: '#fff' },
  iconPill: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  iconPillActive: {
    backgroundColor: 'rgba(122,92,255,0.16)',
    borderColor: theme.colors.accent,
    shadowColor: theme.colors.accentGlow,
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -2 }],
  },
  addInner: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  addPressed: { transform: [{ translateY: -2 }, { scale: 0.97 }] },
});
