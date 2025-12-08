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
import { Redirect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { theme } from '@/constants/theme';
import { Glass } from '@/components/ui/Glass';
import { H1, Muted } from '@/components/ui/Typography';

export default function SignInScreen() {
  const { session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modes: 'otp' (default) or 'password'
  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  // For OTP flow: whether the code input is visible
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  if (session) return <Redirect href="/(tabs)/all" />;

  const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v);

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
        },
      });
      if (error) throw error;
      setShowOtpInput(true);
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
        type: 'email',
      });
      if (error) throw error;
      Alert.alert('Signed in', 'Welcome back!');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithPassword() {
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Password required', 'Please enter your password.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Success handled by session listener
    } catch (e: any) {
      Alert.alert('Sign in failed', e.message);
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
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.navBack}>{'\u2190'} Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <H1 style={styles.heroTitle}>Welcome back</H1>
          <Muted>Save links. Watch later. Stay organized.</Muted>
        </View>
        <Glass style={styles.card}>
          <View style={styles.formRow}>
            <TextInput
              key="email-input"
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

          {mode === 'otp' ? (
            <>
              {showOtpInput ? (
                <View style={styles.formRow}>
                  <TextInput
                    key="otp-input"
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
              ) : null}

              <TouchableOpacity
                onPress={showOtpInput ? (otp ? verifyOtpCode : sendOtpCode) : sendOtpCode}
                disabled={loading}
                style={[styles.button, loading && { opacity: 0.7 }]}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Working…' : (showOtpInput && otp ? 'Verify code' : 'Send login code')}
                </Text>
              </TouchableOpacity>

              {!showOtpInput && (
                <TouchableOpacity onPress={() => setShowOtpInput(true)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryText}>I have a code</Text>
                </TouchableOpacity>
              )}
              
              {showOtpInput && (
                 <TouchableOpacity onPress={() => setShowOtpInput(false)} style={styles.secondaryBtn}>
                   <Text style={styles.secondaryText}>Send a new code</Text>
                 </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => { 
                  setMode('password'); 
                  setShowOtpInput(false); 
                  setOtp('');
                  setPassword(''); // Clear password when switching
                }} 
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryText}>Sign in with password</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.formRow}>
                <TextInput
                  key="password-input"
                  placeholder="Password"
                  placeholderTextColor={theme.colors.textMuted}
                  secureTextEntry
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  style={styles.input}
                  returnKeyType="done"
                  onSubmitEditing={!loading ? signInWithPassword : undefined}
                />
              </View>

              <TouchableOpacity
                onPress={signInWithPassword}
                disabled={loading}
                style={[styles.button, loading && { opacity: 0.7 }]}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => { 
                  setMode('otp'); 
                  setPassword(''); // Clear password when switching back
                }} 
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryText}>Use one-time code instead</Text>
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
  navRow: { alignSelf: 'stretch', marginBottom: theme.spacing(1) },
  navBack: { color: theme.colors.textMuted, fontSize: 14 },
  hero: { alignItems: 'center', gap: 6, marginBottom: theme.spacing(2) },
  heroTitle: { fontSize: 28 },
  card: { alignSelf: 'stretch', padding: theme.spacing(2), gap: theme.spacing(2) },
  formRow: { alignSelf: 'stretch' },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius, padding: 14, fontSize: 16, backgroundColor: theme.colors.surface, color: theme.colors.text },
  button: { marginTop: 8, backgroundColor: theme.colors.brand, paddingVertical: 14, paddingHorizontal: 22, borderRadius: theme.radius, alignSelf: 'stretch', alignItems: 'center' },
  buttonText: { color: '#0B0D10', fontWeight: '800', fontSize: 14 },
  secondaryBtn: { paddingVertical: 8, alignItems: 'center' },
  secondaryText: { color: theme.colors.textMuted },
  links: { flexDirection: 'row', gap: 6, marginTop: theme.spacing(2) },
  linkText: { color: theme.colors.textMuted },
  dot: { color: theme.colors.textMuted },
});
