// Supabase Edge Function: unfurl
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

type Platform = 'tiktok'|'instagram'|'youtube'|'web';

function platformFromUrl(url: string): Platform {
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

const STRIP_PARAMS = new Set(['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','fbclid','gclid']);
function canonicalizeUrl(input: string): string {
  try {
    const u = new URL(input);
    u.hash = '';
    u.protocol = u.protocol.toLowerCase();
    u.hostname = u.hostname.toLowerCase();
    for (const k of Array.from(u.searchParams.keys())) if (STRIP_PARAMS.has(k.toLowerCase())) u.searchParams.delete(k);
    const entries = [...u.searchParams.entries()].sort(([a],[b]) => a.localeCompare(b));
    u.search = '';
    for (const [k,v] of entries) u.searchParams.append(k, v);
    if (u.pathname !== '/' && u.pathname.endsWith('/')) u.pathname = u.pathname.replace(/\/+$/, '');
    return u.toString();
  } catch {
    return input;
  }
}

async function parseOG(url: string) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const getMeta = (p: RegExp) => html.match(p)?.[1] ?? null;
  const title = getMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || getMeta(/<title>([^<]+)<\/title>/i);
  const description = getMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const author = getMeta(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i);
  const image = getMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  return { title, description, author, image };
}

serve(async (req) => {
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });
    const { url, note } = await req.json();
    if (!url) return new Response(JSON.stringify({ error: 'url required' }), { status: 400 });

    const canonical = canonicalizeUrl(url);
    const platform = platformFromUrl(canonical);

    // dedupe per user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });

    const { data: existing } = await supabase.from('items').select('*').eq('user_id', user.id).eq('url', canonical).maybeSingle();
    if (existing) return new Response(JSON.stringify(existing), { headers: { 'Content-Type': 'application/json' } });

    const og = await parseOG(canonical);
    const { data: item, error } = await supabase
      .from('items')
      .insert({ user_id: user.id, url: canonical, platform, title: og.title, caption: og.description, author: og.author, thumbnail_url: og.image })
      .select('*')
      .single();
    if (error) throw error;

    if (note) await supabase.from('notes').upsert({ item_id: item.id, body: note });

    // call classifier with extracted hashtags to improve accuracy
    const caption = (item as any)?.caption ?? null;
    const hashtags = typeof caption === 'string' ? (caption.match(/#[A-Za-z0-9_]+/g) ?? []) : [];
    await supabase.functions.invoke('classify', { body: { itemId: item.id, title: item.title, caption: item.caption, hashtags } });

    return new Response(JSON.stringify(item), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400 });
  }
});


