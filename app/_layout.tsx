// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { DockProvider } from '@/hooks/useDockState';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/hooks/useSession';
import { useShareHandler } from '@/hooks/useShareHandler';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Sora_300Light, Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';

SplashScreen.preventAutoHideAsync();

function ShareBootstrapper() { 
  useShareHandler(); 
  return null; 
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_300Light,
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // CRITICAL: Always render ShareBootstrapper even if fonts aren't loaded yet
  // This ensures deep links from share extension are captured immediately
  // Otherwise, production builds lose the deep link while fonts are loading
  if (!fontsLoaded) {
    return (
      <AuthProvider>
        <ShareBootstrapper />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      {/* Global default; individual screens can override */}
      <StatusBar style="light" animated />
      <ShareBootstrapper />
      <DockProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Public & guards */}
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="auth" />

        {/* Main tabs */}
        <Stack.Screen name="(tabs)" />

        {/* Details */}
        <Stack.Screen name="item/[id]" options={{ headerShown: true, title: 'Post' }} />

        {/* Share screen - auto-saves shared posts */}
        <Stack.Screen name="share" options={{ headerShown: false }} />

        {/* Modals */}
        <Stack.Screen name="modals/add-link" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      </DockProvider>
    </AuthProvider>
  );
}
