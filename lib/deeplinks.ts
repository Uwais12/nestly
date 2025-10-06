export function platformFromUrl(url: string): 'tiktok' | 'instagram' | 'youtube' | 'web' {
  try {
    const u = new URL(url);
    const h = u.hostname.replace('www.', '');
    if (h.includes('tiktok.com')) return 'tiktok';
    if (h.includes('instagram.com')) return 'instagram';
    if (h.includes('youtu.be') || h.includes('youtube.com')) return 'youtube';
    return 'web';
  } catch {
    return 'web';
  }
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


