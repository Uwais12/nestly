// app/_layout.tsx
import { Stack } from 'expo-router';
import { DockProvider } from '@/hooks/useDockState';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/hooks/useSession';
import { useShareCapture } from '@/hooks/useShareCapture';
import { useShareHandler } from '@/hooks/useShareHandler';

function ShareBootstrapper() { useShareCapture(); useShareHandler(); return null; }

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Global default; individual screens can override */}
      <StatusBar style="dark" animated />
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

        {/* Modals */}
        <Stack.Screen name="modals/add-link" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      </DockProvider>
    </AuthProvider>
  );
}
