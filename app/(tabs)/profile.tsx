// app/(tabs)/profile.tsx
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Sign out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg, gap: theme.spacing(2) },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
});


