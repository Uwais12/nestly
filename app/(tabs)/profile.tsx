// app/(tabs)/profile.tsx
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Glass } from '@/components/ui/Glass';
import { deleteAccount } from '@/lib/api';
import { useState } from 'react';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function Profile() {
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  };

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
              // 1. First try to call the API to delete data
              const { error } = await deleteAccount();
              
              if (error) {
                // If function fails (e.g. not deployed), fail gracefully by alerting user
                // In production, this must work.
                throw error;
              }

              // 2. Sign out
              await supabase.auth.signOut();
              Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            } catch (e: any) {
              Alert.alert('Error', 'Could not delete account. Please contact support@nestly.app if this persists.');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <Glass style={styles.section}>
        <View style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <IconSymbol name="house.fill" size={20} color={theme.colors.text} />
          </View>
          <Text style={styles.menuText}>App Version</Text>
          <Text style={styles.menuValue}>1.0.0</Text>
        </View>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { padding: theme.spacing(3), gap: theme.spacing(3), paddingBottom: 100 },
  header: { marginTop: theme.spacing(2), marginBottom: theme.spacing(1) },
  title: { color: theme.colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  section: { padding: theme.spacing(2), gap: theme.spacing(2) },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  menuValue: { fontSize: 16, color: theme.colors.textMuted },
  actions: { gap: theme.spacing(2), marginTop: theme.spacing(2) },
  deleteBtn: { paddingVertical: 16, alignItems: 'center' },
  deleteText: { color: theme.colors.danger, fontSize: 16, fontWeight: '600' },
  footer: { textAlign: 'center', color: theme.colors.textMuted, fontSize: 12, marginTop: theme.spacing(2) },
});
