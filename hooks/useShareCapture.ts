import { createItemViaUnfurl } from '@/lib/api';
import { useEffect } from 'react';

type Handler = (payload: { url?: string; text?: string; fromBackground: boolean }) => void;

async function processSharedItems(items: any[] | undefined, fromBackground: boolean, onHandled?: Handler) {
  if (!items?.length) return;
  const first = items[0];
  // expected shape: { mimeType: string, data: string[] }
  const dataArr = Array.isArray(first?.data) ? first.data : [];
  const textOrUrl = typeof dataArr[0] === 'string' ? dataArr[0] : undefined;
  if (!textOrUrl) return;
  const looksLikeUrl = /^https?:\/\//i.test(textOrUrl);
  if (looksLikeUrl) {
    await createItemViaUnfurl(textOrUrl, '');
  }
  onHandled?.({ url: looksLikeUrl ? textOrUrl : undefined, text: looksLikeUrl ? undefined : textOrUrl, fromBackground });
}

export function useShareCapture(onHandled?: Handler) {
  // Cold start (app launched from share). Guard for environments where expo-share-intent
  // is not available (simulators without extension, web, or release builds without the module).
  useEffect(() => {
    (async () => {
      try {
        // Dynamically require to avoid bundling/runtime errors on unsupported platforms
         
        const ShareIntent = require('expo-share-intent');
        const getSharedData: undefined | (() => Promise<any[] | null>) = ShareIntent?.getSharedData;
        const clearSharedData: undefined | (() => Promise<void>) = ShareIntent?.clearSharedData;
        if (typeof getSharedData === 'function') {
          const initial = await getSharedData();
          if (initial?.length) {
            await processSharedItems(initial as any[], true, onHandled);
            if (typeof clearSharedData === 'function') {
              await clearSharedData();
            }
          }
        }
      } catch {
        // Module not installed/available; ignore
      }
    })();
  }, []);

  // While app is alive (foreground share to our app)
  useEffect(() => {
    let remove: undefined | (() => void);
    try {
       
      const ShareIntent = require('expo-share-intent');
      const addListener: undefined | ((cb: (items: any[] | null) => void) => { remove: () => void }) =
        ShareIntent?.addListener;
      if (typeof addListener === 'function') {
        const sub = addListener(async (items) => {
          await processSharedItems((items ?? undefined) as any[] | undefined, false, onHandled);
        });
        remove = () => { try { sub.remove(); } catch {} };
      }
    } catch {
      // Module not installed/available; ignore
    }
    return () => { try { remove?.(); } catch {} };
  }, []);
}


