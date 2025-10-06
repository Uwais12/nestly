// app/(auth)/sign-in.tsx

import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { theme } from '@/constants/theme';
import { Glass } from '@/components/ui/Glass';
import { H1, Muted } from '@/components/ui/Typography';

export default function SignInScreen() {
  const { session } = useSession();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');

  if (session) return <Redirect href="/(tabs)/all" />;

  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

  // Magic link (kept for convenience; works in dev if redirect is Expo Go URL)
  async function sendMagicLink() {
    const redirect = Linking.createURL('/auth'); // Expo Go deep link (shows as exp://…/--/auth)
    console.log('DEV REDIRECT:', redirect);

    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect, shouldCreateUser: true },
      });
      if (error) throw error;
      Alert.alert(
        'Check your email',
        'We sent you a sign-in link. If it doesn’t return to the app, switch to “Use 6-digit code instead”.'
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not send magic link.');
    } finally {
      setLoading(false);
    }
  }

  // OTP flow: IMPORTANT — no redirect passed here, otherwise Supabase may send a link email.
  async function sendOtpCode() {
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // DO NOT pass emailRedirectTo here for OTP-only
        },
      });
      if (error) throw error;
      Alert.alert('Check your email', 'Enter the 6-digit code we just sent you.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not send code.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpCode() {
    if (!otp || otp.trim().length < 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit code from your email.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp.trim(),
        type: 'email', // email OTP
      });
      if (error) throw error;
      // Session set; AuthProvider will redirect automatically.
      Alert.alert('Signed in', 'Welcome back!');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.hero}>
          <H1 style={styles.heroTitle}>Welcome back</H1>
          <Muted>Save links. Watch later. Stay organized.</Muted>
        </View>
        <Glass style={styles.card}>
        <View style={styles.formRow}>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            style={styles.input}
            returnKeyType="next"
          />
        </View>

        {!useOtp ? (
          <>
            <TouchableOpacity
              onPress={sendMagicLink}
              disabled={loading}
              style={[styles.button, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{loading ? 'Sending…' : 'Send magic link'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setUseOtp(true)} style={styles.secondaryBtn}>
              <Text style={styles.secondaryText}>Use 6-digit code instead</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.formRow}>
              <TextInput
                placeholder="Enter 6-digit code"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
                editable={!loading}
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={!loading ? verifyOtpCode : undefined}
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              onPress={otp ? verifyOtpCode : sendOtpCode}
              disabled={loading}
              style={[styles.button, loading && { opacity: 0.7 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Working…' : (otp ? 'Verify code' : 'Send code')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setUseOtp(false); setOtp(''); }}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryText}>Back to magic link</Text>
            </TouchableOpacity>
          </>
        )}

        </Glass>

        <View style={styles.links}>
          <Text style={styles.linkText}>Privacy</Text>
          <Text style={styles.dot}> • </Text>
          <Text style={styles.linkText}>Terms</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing(3), gap: theme.spacing(2), backgroundColor: theme.colors.bg },
  hero: { alignItems: 'center', gap: 6, marginBottom: theme.spacing(2) },
  heroTitle: { fontSize: 28 },
  card: { alignSelf: 'stretch', padding: theme.spacing(2), gap: theme.spacing(2) },
  formRow: { alignSelf: 'stretch' },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, padding: 14, fontSize: 16, backgroundColor: '#0E1115', color: theme.colors.text },
  button: { marginTop: 8, backgroundColor: theme.colors.brand, paddingVertical: 14, paddingHorizontal: 22, borderRadius: theme.radius, alignSelf: 'stretch', alignItems: 'center' },
  buttonText: { color: '#0B0D10', fontWeight: '800', fontSize: 14 },
  secondaryBtn: { paddingVertical: 12 },
  secondaryText: { color: theme.colors.textMuted },
  links: { flexDirection: 'row', gap: 6, marginTop: theme.spacing(2) },
  linkText: { color: theme.colors.textMuted },
  dot: { color: theme.colors.textMuted },
});
