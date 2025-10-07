import { createItemViaUnfurl } from '@/lib/api';
import { useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSession } from '@/hooks/useSession';

type Handler = (payload: { url?: string; text?: string; fromBackground: boolean }) => void;

export function useShareCapture(onHandled?: Handler) {
  const router = useRouter();
  const { session } = useSession();
  const pendingUrlRef = useRef<string | null>(null);

  const saveUrlOrDefer = useCallback(async (textOrUrl: string, fromBackground: boolean) => {
    const looksLikeUrl = /^https?:\/\//i.test(textOrUrl);
    if (!looksLikeUrl) return;
    if (!session) {
      pendingUrlRef.current = textOrUrl;
      Alert.alert('Sign in required', 'Please sign in to save this link.');
      router.replace('/(auth)/sign-in');
      return;
    }
    const { error } = await createItemViaUnfurl(textOrUrl, '');
    if (error) {
      Alert.alert('Failed to save', error.message ?? 'Could not save this link');
    } else {
      Alert.alert('Saved', 'Saved to Inbox');
      router.replace('/(tabs)/all');
    }
    onHandled?.({ url: textOrUrl, fromBackground, text: undefined });
  }, [session?.user?.id, router]);

  // Cold start (app launched from share). Guard for environments where expo-share-intent
  // is not available (simulators without extension, web, or release builds without the module).
  useEffect(() => {
    (async () => {
      try {
        // Dynamically require to avoid bundling/runtime errors on unsupported platforms
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ShareIntent = require('expo-share-intent');
        const getSharedData: undefined | (() => Promise<any[] | null>) = ShareIntent?.getSharedData;
        const clearSharedData: undefined | (() => Promise<void>) = ShareIntent?.clearSharedData;
        if (typeof getSharedData === 'function') {
          const initial = await getSharedData();
          if (initial?.length) {
            const first = initial[0];
            const dataArr = Array.isArray(first?.data) ? first.data : [];
            const textOrUrl = typeof dataArr[0] === 'string' ? dataArr[0] : undefined;
            if (textOrUrl) await saveUrlOrDefer(textOrUrl, true);
            if (typeof clearSharedData === 'function') {
              await clearSharedData();
            }
          }
        }
      } catch {
        // Module not installed/available; ignore
      }
    })();
  }, [session?.user?.id, saveUrlOrDefer]);

  // While app is alive (foreground share to our app)
  useEffect(() => {
    let remove: undefined | (() => void);
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ShareIntent = require('expo-share-intent');
      const addListener: undefined | ((cb: (items: any[] | null) => void) => { remove: () => void }) =
        ShareIntent?.addListener;
      if (typeof addListener === 'function') {
        const sub = addListener(async (items) => {
          const arr = (items ?? undefined) as any[] | undefined;
          if (!arr?.length) return;
          const first = arr[0];
          const dataArr = Array.isArray(first?.data) ? first.data : [];
          const textOrUrl = typeof dataArr[0] === 'string' ? dataArr[0] : undefined;
          if (textOrUrl) await saveUrlOrDefer(textOrUrl, false);
        });
        remove = () => { try { sub.remove(); } catch {} };
      }
    } catch {
      // Module not installed/available; ignore
    }
    return () => { try { remove?.(); } catch {} };
  }, [session?.user?.id, saveUrlOrDefer]);

  // Process any deferred save after login
  useEffect(() => {
    if (!session?.user?.id) return;
    const pending = pendingUrlRef.current;
    if (!pending) return;
    (async () => {
      const url = pendingUrlRef.current;
      pendingUrlRef.current = null;
      if (url) await saveUrlOrDefer(url, true);
    })();
  }, [session?.user?.id, saveUrlOrDefer]);
}


