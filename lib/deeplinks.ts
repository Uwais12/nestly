// Platform detection patterns matching reference implementation
const PLATFORM_PATTERNS = {
  Instagram: /instagram\.com/i,
  Twitter: /twitter\.com|x\.com/i,
  TikTok: /tiktok\.com/i,
  Reddit: /reddit\.com/i,
  LinkedIn: /linkedin\.com/i,
  Facebook: /facebook\.com|fb\.com/i,
  Pinterest: /pinterest\.com/i,
  YouTube: /youtu\.be|youtube\.com/i,
} as const;

export type Platform = keyof typeof PLATFORM_PATTERNS | 'Other';

export function detectPlatform(url: string): Platform {
  for (const [platform, pattern] of Object.entries(PLATFORM_PATTERNS)) {
    if (pattern.test(url)) {
      return platform as Platform;
    }
  }
  return 'Other';
}

// Legacy function for backward compatibility
export function platformFromUrl(url: string): 'tiktok' | 'instagram' | 'youtube' | 'web' {
  const platform = detectPlatform(url);
  if (platform === 'TikTok') return 'tiktok';
  if (platform === 'Instagram') return 'instagram';
  if (platform === 'YouTube') return 'youtube';
    return 'web';
}

export function toDeepLink(url: string): string {
  const platform = platformFromUrl(url);
  try {
    const u = new URL(url);
    if (platform === 'tiktok') {
      // Prefer web; deep link explicitly from button elsewhere
      return url;
    }
    if (platform === 'instagram') {
      return url;
    }
    if (platform === 'youtube') {
      const v = u.searchParams.get('v');
      if (v) return `vnd.youtube://${v}`;
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `vnd.youtube://${id}`;
    }
    return url;
  } catch {
    return url;
  }
}


// Parse incoming app deep links created by share extensions or native share handlers.
// Supported shapes:
//  - nestly://shared?url=ENCODED_URL
//  - nestly://?url=ENCODED_URL
//  - nestly://?dataUrl=SHARED_KEY
//  - nestly://dataUrl=SHARED_KEY (legacy host-based without '?')
export function parseIncomingShare(url: string): { directUrl?: string; hasDataUrlKey: boolean } {
  let directUrl: string | undefined;
  let hasDataUrlKey = false;
  try {
    const u = new URL(url);
    if (u.host === 'shared') {
      directUrl = u.searchParams.get('url') ?? undefined;
    }
    if (!directUrl) {
      const qpUrl = u.searchParams.get('url');
      const qpData = u.searchParams.get('dataUrl');
      directUrl = qpUrl ?? undefined;
      hasDataUrlKey = !!qpData && !qpUrl;
    }
    if (!directUrl && !hasDataUrlKey) {
      const raw = url.replace(/^nestly:\/\//, '');
      const beforeHash = raw.split('#')[0];
      if (beforeHash.startsWith('dataUrl=')) {
        hasDataUrlKey = true;
      }
    }
  } catch {
    // ignore
  }
  return { directUrl, hasDataUrlKey };
}


