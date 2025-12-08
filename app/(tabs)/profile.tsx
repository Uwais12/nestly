// app/(tabs)/profile.tsx
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Glass } from '@/components/ui/Glass';
import { deleteAccount } from '@/lib/api';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSession } from '@/hooks/useSession';
import { usePosts } from '@/hooks/usePosts';
import { TAB_BAR_HEIGHT } from '@/constants/layout';
import { useCollections } from '@/hooks/useCollections';

export default function Profile() {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { session } = useSession();
  const { items } = usePosts({ tags: [], search: '' });
  const { collections, refresh } = useCollections();
  const [tagCount, setTagCount] = useState(0);
  const insets = useSafeAreaInsets();
  const savesCount = useMemo(() => items.length, [items.length]);
  const collectionPalette = [['#7A5CFF', '#5CE1E6'], ['#5CE1E6', '#7A5CFF'], ['#7A5CFF', '#B9A6FF'], ['#5CE1E6', '#7A5CFF']];

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    (async () => {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('item_tags')
        .select('tag, items!inner(id,user_id)')
        .eq('items.user_id', session.user.id);
      if (!error) {
        const unique = new Set((data ?? []).map((r: any) => r.tag));
        setTagCount(unique.size);
      }
    })();
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

  const handleSupport = () => Linking.openURL('https://uwais12.github.io/nestly/support');
  const handlePrivacy = () => Linking.openURL('https://uwais12.github.io/nestly/privacy-policy.html');
  const handleFeedback = () => Linking.openURL('mailto:uwais_i@outlook.com?subject=Nestly%20Feedback');
  const handleRate = () => Linking.openURL('https://uwais12.github.io/nestly/support');
  const nav = (path: string) => router.push(path as any);
  const comingSoon = (label: string) => Alert.alert(label, 'This will ship soon. Reach out via support to prioritize.');

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your saved links will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await deleteAccount();

              if (error) {
                throw error;
              }

              // 2. Sign out
              await supabase.auth.signOut();
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            } catch {
              Alert.alert('Error', 'Could not delete account. Please contact support@nestly.app if this persists.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + theme.spacing(2) }]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile & Settings</Text>
        <Text style={styles.subtitle}>Your premium vault, softly lit and organised.</Text>
      </View>

      <Glass style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{session?.user?.email?.[0]?.toUpperCase() ?? 'N'}</Text>
        </View>
        <Text style={styles.name}>Nestly user</Text>
        <Text style={styles.handle}>{session?.user?.email ?? '@you'}</Text>
        <View style={styles.statsRow}>
          <StatBlock label="Saves" value={savesCount} />
          <StatBlock label="Collections" value={collections.length} />
          <StatBlock label="Tags" value={tagCount} />
        </View>
      </Glass>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Collections</Text>
        <Text style={styles.sectionSubtitle}>Vault tiles to group your memories.</Text>
      </View>
      <View style={styles.collectionGrid}>
        {collections.length === 0 ? (
          <Text style={styles.sectionSubtitle}>No collections yet. Create one to get started.</Text>
        ) : (
          collections.map((c, idx) => (
            <CollectionTile
              key={c.id}
              title={c.title}
              subtitle={`${c.collection_items?.[0]?.count ?? 0} posts`}
              accent={collectionPalette[idx % collectionPalette.length]}
              onPress={() => nav('/collections')}
            />
          ))
        )}
      </View>

      <Glass style={styles.section}>
        <Text style={styles.sectionLabel}>Settings</Text>
        {[
          { label: 'Manage Tags', onPress: () => nav('/tags') },
          { label: 'Manage Collections', onPress: () => nav('/collections') },
          { label: 'Notifications', onPress: () => nav('/settings/notifications') },
          { label: 'Appearance', onPress: () => nav('/settings/appearance') },
          { label: 'Storage & Export', onPress: () => comingSoon('Export') },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.85}>
            <View style={styles.menuIcon}>
              <IconSymbol name="chevron.right" size={18} color={theme.colors.text} />
            </View>
            <Text style={styles.menuText}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </Glass>

      <Glass style={styles.section}>
        <Text style={styles.sectionLabel}>Support</Text>
        {[
          { label: 'Help & FAQ', onPress: handleSupport },
          { label: 'Send Feedback', onPress: handleFeedback },
          { label: 'Rate Nestly', onPress: handleRate },
          { label: 'Privacy Policy', onPress: handlePrivacy },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.85}>
            <Text style={styles.menuText}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </Glass>

      <View style={styles.actions}>
        <Button title="Sign Out" onPress={handleSignOut} />
        
        <TouchableOpacity 
          style={[styles.deleteBtn, deleting && { opacity: 0.5 }]} 
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>{deleting ? 'Deleting...' : 'Delete Account'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Nestly Inc. • Privacy • Terms
      </Text>
    </ScrollView>
  );
}

function CollectionTile({ title, subtitle, accent, onPress }: { title: string; subtitle: string; accent: string[]; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.collectionTile} activeOpacity={0.92} onPress={onPress}>
      <LinearGradient
        colors={[`${accent[0]}33`, `${accent[1]}11`, 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.collectionTitle}>{title}</Text>
      <Text style={styles.collectionSubtitle}>{subtitle}</Text>
      <View style={styles.previewRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.previewItem, { opacity: 0.7 + i * 0.1 }]} />
        ))}
      </View>
    </TouchableOpacity>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { padding: theme.spacing(3), gap: theme.spacing(3), paddingBottom: TAB_BAR_HEIGHT + 140 },
  header: { marginTop: theme.spacing(2), marginBottom: theme.spacing(1), gap: 6 },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -1, fontFamily: 'Sora_600SemiBold' },
  subtitle: { color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
  profileCard: { padding: theme.spacing(3), alignItems: 'center', gap: theme.spacing(1.5), borderRadius: 24 },
  avatar: { width: 96, height: 96, borderRadius: 28, backgroundColor: theme.colors.accentGlow, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  avatarText: { color: theme.colors.textAccent, fontSize: 32, fontWeight: '800' },
  name: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  handle: { color: theme.colors.textMuted },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  statBlock: { backgroundColor: theme.colors.surfaceAlt, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.borderSubtle, alignItems: 'center', minWidth: 80 },
  statValue: { color: theme.colors.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: theme.colors.textMuted, fontSize: 12 },
  sectionHeader: { gap: 4, paddingHorizontal: 4 },
  sectionTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  sectionSubtitle: { color: theme.colors.textMuted, fontSize: 13 },
  collectionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  collectionTile: {
    width: '47%',
    minHeight: 190,
    borderRadius: 24,
    padding: 16,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    gap: 10,
  },
  collectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700', fontFamily: 'Sora_600SemiBold' },
  collectionSubtitle: { color: theme.colors.textMuted, fontSize: 13 },
  previewRow: { flexDirection: 'row', gap: 8, marginTop: 'auto' },
  previewItem: { flex: 1, height: 18, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: theme.colors.borderSubtle },
  section: { padding: theme.spacing(2), gap: theme.spacing(1.5), borderRadius: 22 },
  sectionLabel: { color: theme.colors.textMuted, fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: '700' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  menuIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderSubtle },
  menuText: { flex: 1, fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  menuValue: { fontSize: 15, color: theme.colors.textSecondary },
  actions: { gap: theme.spacing(2), marginTop: theme.spacing(2) },
  deleteBtn: { paddingVertical: 16, alignItems: 'center' },
  deleteText: { color: theme.colors.danger, fontSize: 16, fontWeight: '600' },
  footer: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, marginTop: theme.spacing(2) },
});
