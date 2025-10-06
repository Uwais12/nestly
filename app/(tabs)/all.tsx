// app/(tabs)/all.tsx
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feed } from '@/components/Feed';
import { TagFilterBar } from '@/components/navigation/TagFilterBar';
import { theme } from '@/constants/theme';
import { FEED_TOP_BAR } from '@/constants/layout';

export default function AllScreen() {
  const [tag, setTag] = useState<string>('All');
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Overlayed filter bar */}
      <TagFilterBar value={tag} onChange={setTag} />
      {/* Reserve space for the top filter bar so one post fits the screen */}
      <Feed tag={tag} onAddLink={() => router.push('/modals/add-link')} topOffset={FEED_TOP_BAR} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
});
