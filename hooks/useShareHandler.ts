import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { parseIncomingShare } from '@/lib/deeplinks';
import { useSession } from '@/hooks/useSession';

export function useShareHandler() {
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    async function handleDeepLink(url: string | null) {
      if (!url) return;
      const { directUrl, hasDataUrlKey } = parseIncomingShare(url);
      let sharedUrl: string | null = directUrl ?? null;
      if (!sharedUrl && !hasDataUrlKey) return;

      if (!session) {
        Alert.alert('Sign in required', 'Please sign in to save shares.');
        router.replace('/(auth)/sign-in');
        return;
      }

      // If the deep link provided a dataUrl key (expo-share-intent style), fetch the actual shared data now
      if (!sharedUrl && hasDataUrlKey) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ShareIntent = require('expo-share-intent');
          const getSharedData = ShareIntent?.getSharedData as undefined | (() => Promise<any[] | null>);
          const clearSharedData = ShareIntent?.clearSharedData as undefined | (() => Promise<void>);
          if (typeof getSharedData === 'function') {
            const items = await getSharedData();
            const first = items && items[0];
            const dataArr = Array.isArray(first?.data) ? first.data : [];
            const textOrUrl = typeof dataArr[0] === 'string' ? dataArr[0] : undefined;
            if (textOrUrl) sharedUrl = textOrUrl;
            if (typeof clearSharedData === 'function') await clearSharedData();
          }
        } catch {}
      }

      if (!sharedUrl) return;

      // Navigate to Add Link modal with prefilled URL instead of auto-saving
      router.push(`/modals/add-link?url=${encodeURIComponent(sharedUrl)}`);
    }

    // Runtime URL events
    const sub = Linking.addEventListener('url', (ev) => handleDeepLink(ev.url));

    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

    if (Platform.OS !== 'web' && !isExpoGo) {
      // Optional: react-native-share-menu fallback for native share intents
      // This requires native integration. We try to call it if available.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    }

    // Initial URL (cold start)
    Linking.getInitialURL().then(handleDeepLink);

    return () => {
      try { sub.remove(); } catch {}
    };
  }, [session, router]);
}
