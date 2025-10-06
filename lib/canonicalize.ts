const STRIP_PARAMS = new Set(['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','fbclid','gclid']);

export function canonicalizeUrl(input: string): string {
  try {
    const u = new URL(input);
    u.hash = '';
    // Normalize protocol/host casing
    u.protocol = u.protocol.toLowerCase();
    u.hostname = u.hostname.toLowerCase();
    // Remove tracking params
    for (const k of Array.from(u.searchParams.keys())) {
      if (STRIP_PARAMS.has(k.toLowerCase())) u.searchParams.delete(k);
    }
    // Sort params
    const entries = [...u.searchParams.entries()].sort(([a],[b]) => a.localeCompare(b));
    u.search = '';
    for (const [k,v] of entries) u.searchParams.append(k, v);
    // Remove trailing slash for non-root
    if (u.pathname !== '/' && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.replace(/\/+$/, '');
    }
    return u.toString();
  } catch {
    return input;
  }
}


