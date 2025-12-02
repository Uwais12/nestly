import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { parseIncomingShare } from '@/lib/deeplinks';
import { useSession } from '@/hooks/useSession';

export function useShareHandler() {
  const router = useRouter();
  const { session } = useSession();

  useEffect(() => {
    // If no session, we can't do anything useful with shares anyway
    if (!session) return;

    async function handleDeepLink(url: string | null) {
      if (!url) return;
      console.log('[ShareHandler] Incoming URL:', url);
      
      const { directUrl, hasDataUrlKey } = parseIncomingShare(url);
      let sharedUrl: string | null = directUrl ?? null;

      // Case 1: URL is explicitly in query param (e.g. nestly://?url=...)
      if (sharedUrl) {
        console.log('[ShareHandler] Direct URL found:', sharedUrl);
        router.push(`/modals/add-link?url=${encodeURIComponent(sharedUrl)}`);
        return;
      }

      // Case 2: URL requires fetching from Shared Group Storage (iOS Share Extension)
      if (hasDataUrlKey) {
         // expo-share-intent works by reading from a shared App Group container
         // The deep link usually looks like scheme://?dataUrl=someKey
         // We need to use the native module to read that key.
         if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const ShareIntent = require('expo-share-intent');
              if (ShareIntent && ShareIntent.getSharedData) {
                 const items = await ShareIntent.getSharedData();
                 console.log('[ShareHandler] Shared items:', items);
                 
                 // We look for the first valid web URL or text
                 const first = items?.[0];
                 if (first) {
                   // expo-share-intent structure usually: { type: 'weburl' | 'text', value: '...' } or similar depending on fork
                   // Based on your ShareViewController.swift:
                   // It saves JSON arrays like [{ url: '...', meta: '...' }] or ["some text"]
                   
                   let extractedUrl: string | null = null;
                   
                   // Check if it's the weburl structure from Swift
                   if (first.url && typeof first.url === 'string') {
                      extractedUrl = first.url;
                   } 
                   // Check if it's just a string (text share)
                   else if (typeof first === 'string') {
                      extractedUrl = first;
                   }
                   // Check native module 'data' property if specific shape
                   else if (first.data && typeof first.data === 'string') {
                      // sometimes simple text
                      extractedUrl = first.data;
                   }

                   if (extractedUrl) {
                      // Clean up the native storage
                      if (ShareIntent.clearSharedData) {
                         await ShareIntent.clearSharedData();
                      }
                      router.push(`/modals/add-link?url=${encodeURIComponent(extractedUrl)}`);
                      return;
                   }
                 }
              }
            } catch (e) {
               console.warn('[ShareHandler] Error reading share intent:', e);
            }
         }
      }
    }

    // --- 1. Handle App Launch with URL ---
    Linking.getInitialURL().then((url) => {
       if (url) handleDeepLink(url);
    });

    // --- 2. Handle Runtime URL events ---
    const sub = Linking.addEventListener('url', (ev) => handleDeepLink(ev.url));

    // --- 3. Native Module Fallback (if not using expo-share-intent managed workflow) ---
    // Only run this check if NOT in Expo Go
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    if (!isExpoGo && Platform.OS !== 'web') {
       try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ShareMenu = require('react-native-share-menu');
          if (ShareMenu) {
             ShareMenu.getInitialShare((share: any) => {
                if (share?.data) {
                   // normalize
                   const data = typeof share.data === 'string' ? share.data : share.data[0]?.data;
                   if (data && typeof data === 'string' && data.startsWith('http')) {
                      router.push(`/modals/add-link?url=${encodeURIComponent(data)}`);
                   }
                }
             });
             ShareMenu.addNewShareListener((share: any) => {
                if (share?.data) {
                   const data = typeof share.data === 'string' ? share.data : share.data[0]?.data;
                   if (data && typeof data === 'string' && data.startsWith('http')) {
                      router.push(`/modals/add-link?url=${encodeURIComponent(data)}`);
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
}
