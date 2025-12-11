// lib/url.ts
export type PlatformKind = 'youtube' | 'tiktok' | 'instagram' | 'web';

export function detectPlatform(url: string): PlatformKind {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, '').toLowerCase();
    if (h.includes('youtu.be') || h.includes('youtube.com')) return 'youtube';
    if (h.includes('tiktok.com')) return 'tiktok';
    if (h.includes('instagram.com')) return 'instagram';
    return 'web';
  } catch {
    return 'web';
  }
}

export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    // youtu.be/<id>
    if (host.includes('youtu.be')) {
      const seg = u.pathname.split('/').filter(Boolean)[0];
      return seg || null;
    }
    // youtube.com/watch?v=...
    const v = u.searchParams.get('v');
    if (v) return v;

    // youtube.com/shorts/<id> or /embed/<id>
    const parts = u.pathname.split('/').filter(Boolean);
    const idxShorts = parts.indexOf('shorts');
    if (idxShorts >= 0 && parts[idxShorts + 1]) return parts[idxShorts + 1];
    const idxEmbed = parts.indexOf('embed');
    if (idxEmbed >= 0 && parts[idxEmbed + 1]) return parts[idxEmbed + 1];

    return null;
  } catch {
    return null;
  }
}

export function instagramEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if ((parts[0] === 'p' || parts[0] === 'reel') && parts[1]) {
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed`;
    }
    return null;
  } catch {
    return null;
  }
}

/** Best-effort thumbnail fallback (YouTube only; TikTok/IG need server-side) */
export function getFallbackThumb(url: string): string | null {
  const id = getYouTubeId(url);
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  try {
    const u = new URL(url);
    const domain = u.hostname.replace(/^www\./, '');
    // Use Google favicon service as a lightweight visual fallback
    return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(domain)}`;
  } catch {
    return null;
  }
}
