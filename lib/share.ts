export function extractUrlFromSharedItems(items: any[] | null | undefined): string | null {
  if (!items || !Array.isArray(items) || items.length === 0) return null;
  const tryParseJson = (val: string): any => {
    try { return JSON.parse(val); } catch { return null; }
  };
  for (const item of items) {
    const dataArr = Array.isArray(item?.data) ? item.data : [];
    for (const entry of dataArr) {
      if (typeof entry === 'string') {
        if (/^https?:\/\//i.test(entry)) return entry;
        if (/^[\[{]/.test(entry)) {
          const parsed = tryParseJson(entry);
          if (Array.isArray(parsed)) {
            for (const p of parsed) {
              if (typeof p === 'string' && /^https?:\/\//i.test(p)) return p;
              if (p && typeof p === 'object' && typeof p.url === 'string' && /^https?:\/\//i.test(p.url)) return p.url;
            }
          } else if (parsed && typeof parsed === 'object' && typeof parsed.url === 'string') {
            if (/^https?:\/\//i.test(parsed.url)) return parsed.url;
          }
        }
      } else if (entry && typeof entry === 'object') {
        if (typeof (entry as any).url === 'string' && /^https?:\/\//i.test((entry as any).url)) return (entry as any).url;
        if (typeof (entry as any).uri === 'string' && /^https?:\/\//i.test((entry as any).uri)) return (entry as any).uri;
      }
    }
  }
  return null;
}


