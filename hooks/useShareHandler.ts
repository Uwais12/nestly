import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { createItemViaUnfurl } from '@/lib/api';
import { useSession } from '@/hooks/useSession';

function getQueryParam(url: string, key: string): string | null {
  try {
    const u = new URL(url);
    return u.searchParams.get(key);
  } catch {
    return null;
  }
}

export function useShareHandler() {
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    async function handleDeepLink(url: string | null) {
      if (!url) return;
      // Expect: nestly://shared?url=ENCODED_URL
      const host = (() => { try { return new URL(url).host; } catch { return ''; } })();
      if (host !== 'shared') return;
      const sharedUrl = getQueryParam(url, 'url');
      if (!sharedUrl) return;

      if (!session) {
        Alert.alert('Sign in required', 'Please sign in to save shares.');
        router.replace('/(auth)/sign-in');
        return;
      }

      const { error } = await createItemViaUnfurl(sharedUrl);
      if (error) {
        Alert.alert('Failed to save', error.message ?? 'Could not save this link');
      } else {
        Alert.alert('Saved', 'Saved to Inbox');
        router.replace('/(tabs)/all');
      }
    }

    // Initial URL (cold start)
    Linking.getInitialURL().then(handleDeepLink);

    // Runtime URL events
    const sub = Linking.addEventListener('url', (ev) => handleDeepLink(ev.url));

    // Optional: react-native-share-menu fallback for native share intents
    // This requires native integration. We try to call it if available.
    try {
      const ShareMenu = require('react-native-share-menu');
      const pickUrlFromShare = (share: any): string | null => {
        if (!share) return null;
        // Common structures: { data: string } or { data: [{ mimeType, data }, ...] }
        const data = share?.data;
        if (typeof data === 'string') return data;
        if (Array.isArray(data)) {
          const textEntry = data.find((d: any) => typeof d?.data === 'string');
          if (textEntry?.data) return textEntry.data;
          const uriEntry = data.find((d: any) => typeof d?.data?.uri === 'string');
          if (uriEntry?.data?.uri) return uriEntry.data.uri;
        }
        return null;
      };
      if (ShareMenu?.getInitialShare) {
        ShareMenu.getInitialShare(async (share: any) => {
          const maybeUrl = pickUrlFromShare(share);
          if (maybeUrl) await handleDeepLink(`nestly://shared?url=${encodeURIComponent(maybeUrl)}`);
        });
      }
      let remove: any;
      if (ShareMenu?.addNewShareListener) {
        remove = ShareMenu.addNewShareListener(async (share: any) => {
          const maybeUrl = pickUrlFromShare(share);
          if (maybeUrl) await handleDeepLink(`nestly://shared?url=${encodeURIComponent(maybeUrl)}`);
        });
      }
      return () => {
        try { sub.remove(); } catch {}
        try { remove?.(); } catch {}
      };
    } catch {
      // Library not installed; ignore
    }

    // Optional: expo-share-intent support if installed
    try {
      const intent = require('expo-share-intent');
      if (intent?.useShareIntent) {
        const { useShareIntent } = intent;
        // We can't call hooks conditionally here; so we access imperative API when available
        // For expo-share-intent, rely on deep link payloads from extension configured to open app
      }
    } catch {}

    return () => {
      try { sub.remove(); } catch {}
    };
  }, [session?.user?.id]);
}


