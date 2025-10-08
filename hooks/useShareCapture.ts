import { useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
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
    // Instead of auto-saving, route to the Add Link modal with prefilled URL
    const encoded = encodeURIComponent(textOrUrl);
    router.push(`/modals/add-link?url=${encoded}`);
    onHandled?.({ url: textOrUrl, fromBackground, text: undefined });
  }, [session?.user?.id, router]);

  function extractUrlFromSharedItems(items: any[] | null | undefined): string | null {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    const tryParseJson = (val: string): any => {
      try { return JSON.parse(val); } catch { return null; }
    };
    for (const item of items) {
      const dataArr = Array.isArray(item?.data) ? item.data : [];
      for (const entry of dataArr) {
        if (typeof entry === 'string') {
          // Direct URL
          if (/^https?:\/\//i.test(entry)) return entry;
          // Possibly JSON-encoded array/object
          if (/^[\[{]/.test(entry)) {
            const parsed = tryParseJson(entry);
            if (Array.isArray(parsed)) {
              // Array of strings or objects
              for (const p of parsed) {
                if (typeof p === 'string' && /^https?:\/\//i.test(p)) return p;
                if (p && typeof p === 'object' && typeof p.url === 'string' && /^https?:\/\//i.test(p.url)) return p.url;
              }
            } else if (parsed && typeof parsed === 'object' && typeof parsed.url === 'string') {
              if (/^https?:\/\//i.test(parsed.url)) return parsed.url;
            }
          }
        } else if (entry && typeof entry === 'object') {
          // Object with url field
          if (typeof entry.url === 'string' && /^https?:\/\//i.test(entry.url)) return entry.url;
          if (typeof entry.uri === 'string' && /^https?:\/\//i.test(entry.uri)) return entry.uri;
        }
      }
    }
    return null;
  }

  // Cold start (app launched from share). Guard for environments where expo-share-intent
  // is not available (simulators without extension, web, or release builds without the module).
  useEffect(() => {
    (async () => {
      try {
        // If we were launched via our own deep link, let the deep-link handler manage it
        const initialUrl = await Linking.getInitialURL();
        if (typeof initialUrl === 'string' && initialUrl.startsWith('nestly://')) {
          return;
        }
        // Dynamically require to avoid bundling/runtime errors on unsupported platforms
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const ShareIntent = require('expo-share-intent');
        const getSharedData: undefined | (() => Promise<any[] | null>) = ShareIntent?.getSharedData;
        const clearSharedData: undefined | (() => Promise<void>) = ShareIntent?.clearSharedData;
        if (typeof getSharedData === 'function') {
          const initial = await getSharedData();
          const maybeUrl = extractUrlFromSharedItems(initial);
          if (maybeUrl) await saveUrlOrDefer(maybeUrl, true);
          if (initial && typeof clearSharedData === 'function') {
            await clearSharedData();
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
          const maybeUrl = extractUrlFromSharedItems(items ?? undefined);
          if (maybeUrl) await saveUrlOrDefer(maybeUrl, false);
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


