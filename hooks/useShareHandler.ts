import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { parseIncomingShare } from '@/lib/deeplinks';
import { useSession } from '@/hooks/useSession';

/**
 * Unified Share Handler
 * Handles incoming shared URLs from:
 * 1. Deep links (nestly://?url=...)
 * 2. iOS Share Extension via App Group storage
 * 3. react-native-share-menu (fallback)
 * 
 * Routes to /share screen which auto-saves the post
 */
export function useShareHandler() {
  const router = useRouter();
  const { session } = useSession();
  const pendingShareUrl = useRef<string | null>(null);
  const isNavigationReady = useRef(false);

  // Mark navigation as ready after first render
  useEffect(() => {
    isNavigationReady.current = true;
  }, []);

  useEffect(() => {
    async function handleDeepLink(url: string | null) {
      if (!url) return;
      console.log('[ShareHandler] Incoming URL:', url);
      console.log('[ShareHandler] Navigation ready:', isNavigationReady.current);
      console.log('[ShareHandler] Session available:', !!session);
      
      const { directUrl, hasDataUrlKey } = parseIncomingShare(url);
      let sharedUrl: string | null = directUrl ?? null;

      // Case 1: URL is explicitly in query param (e.g. nestly://?url=...)
      if (sharedUrl) {
        console.log('[ShareHandler] Direct URL found:', sharedUrl);

        // If no session, store for later and bail
      if (!session) {
          pendingShareUrl.current = sharedUrl;
          console.log('[ShareHandler] No session yet, deferring...');
          return;
        }
        
        // Route to share screen for auto-save
        router.push(`/share?url=${encodeURIComponent(sharedUrl)}`);
        return;
      }

      // Case 2: URL requires fetching from Shared Group Storage (iOS Share Extension)
      // NOTE: This is now a FALLBACK path. ShareViewController should pass URLs directly.
      // This code path only runs if ShareViewController uses the dataUrl format.
      if (hasDataUrlKey) {
        console.warn('[ShareHandler] Using App Group fallback path (ShareViewController should pass URL directly)');
        console.warn('[ShareHandler] Deep link format:', url);
        console.warn('[ShareHandler] This suggests ShareViewController is not passing the URL in the query param');
        console.warn('[ShareHandler] Please rebuild the app to get the updated ShareViewController.swift');
        
        // For now, we can't read from App Group without the native module
        // The fix is to rebuild with the updated ShareViewController that passes URLs directly
        console.error('[ShareHandler] Cannot read from App Group - native module not available');
        console.error('[ShareHandler] Workaround: Share Extension should use: nestly://?url=ENCODED_URL');
                      return;
                   }
    }

    // 1. Handle Cold Start (app launched via deep link)
    Linking.getInitialURL().then((url) => {
       if (url) handleDeepLink(url);
    });

    // 2. Handle Runtime URL events (app already running)
    const sub = Linking.addEventListener('url', (ev) => handleDeepLink(ev.url));

    // 3. Native Module Fallback (react-native-share-menu)
    // Only run this check if NOT in Expo Go
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (!isExpoGo && Platform.OS !== 'web') {
       try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ShareMenu = require('react-native-share-menu');
          if (ShareMenu) {
             ShareMenu.getInitialShare((share: any) => {
                if (share?.data) {
                   const data = typeof share.data === 'string' ? share.data : share.data[0]?.data;
                   if (data && typeof data === 'string' && data.startsWith('http')) {
                      if (!session) {
                        pendingShareUrl.current = data;
                        return;
                      }
                router.push(`/share?url=${encodeURIComponent(data)}`);
                   }
                }
             });
             ShareMenu.addNewShareListener((share: any) => {
                if (share?.data) {
                   const data = typeof share.data === 'string' ? share.data : share.data[0]?.data;
                   if (data && typeof data === 'string' && data.startsWith('http')) {
                      if (!session) {
                        pendingShareUrl.current = data;
                        return;
                      }
                router.push(`/share?url=${encodeURIComponent(data)}`);
                   }
                }
             });
          }
    } catch {
          // Module not found, ignore
       }
    }

    return () => {
      sub.remove();
    };
  }, [session, router]);
  
  // Process pending share once session becomes available
  useEffect(() => {
    if (session && pendingShareUrl.current) {
      const url = pendingShareUrl.current;
      pendingShareUrl.current = null;
      console.log('[ShareHandler] Processing deferred share:', url);
      router.push(`/share?url=${encodeURIComponent(url)}`);
    }
  }, [session, router]);
}
