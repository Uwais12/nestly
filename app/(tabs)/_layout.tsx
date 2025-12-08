import { Tabs, Redirect } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { HapticTab } from '@/components/haptic-tab';
import { theme } from '@/constants/theme';
import { TabBar } from '@/components/navigation/TabBar';
// import { useDockState } from '@/hooks/useDockState';

export default function TabLayout() {
  const { session } = useSession();
  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      // 👇 custom bar lives here, not inside screenOptions
      tabBar={(props) => (<TabBar {...props} />)}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: 'transparent', borderTopColor: 'transparent'},
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen name="all" options={{ href: '/(tabs)/all', title: 'Home' }} />
      <Tabs.Screen name="search" options={{ href: '/(tabs)/search', title: 'Search' }} />
      <Tabs.Screen name="add" options={{ href: '/(tabs)/add', title: 'Add' }} />
      <Tabs.Screen name="profile" options={{ href: '/(tabs)/profile', title: 'Profile' }} />
    </Tabs>
  );
}
