import { useEffect } from 'react';
import * as ShareIntent from 'expo-share-intent';
import { createItemViaUnfurl } from '@/lib/api';

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
  // Cold start (app launched from share)
  useEffect(() => {
    (async () => {
      const initial = await ShareIntent.getSharedData();
      if (initial?.length) {
        await processSharedItems(initial as any[], true, onHandled);
        await ShareIntent.clearSharedData();
      }
    })();
  }, []);

  // While app is alive (foreground share to our app)
  useEffect(() => {
    const sub = ShareIntent.addListener(async (items) => {
      await processSharedItems(items as any[], false, onHandled);
    });
    return () => sub.remove();
  }, []);
}


