// app/auth.tsx
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View, Alert, Text } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Parsed = {
  code?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  error_description?: string | null;
};

function parseFromUrl(url: string): Parsed {
  try {
    const u = new URL(url);
    const hash = new URLSearchParams((u.hash || '').replace(/^#/, ''));
    const query = u.searchParams;
    return {
      code: query.get('code'),
      access_token: hash.get('access_token') || query.get('access_token'),
      refresh_token: hash.get('refresh_token') || query.get('refresh_token'),
      error_description:
        hash.get('error_description') || query.get('error_description'),
    };
  } catch {
    return {};
  }
}

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle'|'handling'|'done'|'error'>('idle');
  const handledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function completeLogin(url: string) {
      if (handledRef.current) return;
      console.log('[auth] received URL:', url);

      const { code, access_token, refresh_token, error_description } = parseFromUrl(url);

      try {
        setStatus('handling');

        if (error_description) throw new Error(error_description);

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
        } else {
          console.log('[auth] URL had no tokens, waiting for next event…');
          return;
        }

        handledRef.current = true;
        setStatus('done');
        router.replace('/(tabs)/all');
      } catch (e: any) {
        handledRef.current = true;
        setStatus('error');
        console.warn('[auth] error:', e?.message);
        Alert.alert('Sign-in failed', e?.message ?? 'Unknown error');
        router.replace('/(auth)/sign-in');
      }
    }

    Linking.getInitialURL().then((url) => { if (url) completeLogin(url); });
    const sub = Linking.addEventListener('url', (e) => completeLogin(e.url));

    timeoutRef.current = setTimeout(() => {
      if (!handledRef.current) {
        setStatus('error');
        Alert.alert('Sign-in failed', 'No auth data found in the link.');
        router.replace('/(auth)/sign-in');
      }
    }, 5000);

    return () => {
      sub.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0D10' }}>
      <ActivityIndicator size="large" />
      <Text style={{ color: '#A0A7B1', marginTop: 12 }}>
        {status === 'handling' ? 'Signing you in…' : 'Waiting for auth response…'}
      </Text>
    </View>
  );
}
