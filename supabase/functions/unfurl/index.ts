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

async function fetchTikTokOEmbed(url: string) {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data?.title as string | null,
      author: data?.author_name as string | null,
      image: data?.thumbnail_url as string | null,
    };
  } catch {
    return null;
  }
}

function extractInstagramShortcode(url: string): string | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    if (['p', 'reel', 'tv'].includes(parts[0] ?? '') && parts[1]) return parts[1];
    return null;
  } catch {
    return null;
  }
}

function instagramImageFromShortcode(shortcode: string | null): string | null {
  if (!shortcode) return null;
  // Public unauthenticated image URL; works for many public posts
  return `https://www.instagram.com/p/${shortcode}/media/?size=l`;
}

async function fetchInstagramImage(shortcode: string | null): Promise<string | null> {
  if (!shortcode) return null;
  // Try JSON endpoint first
  try {
    const jsonRes = await fetch(`https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9' },
    });
    if (jsonRes.ok) {
      const body = await jsonRes.json();
      const display = body?.graphql?.shortcode_media?.display_url
        ?? body?.items?.[0]?.image_versions2?.candidates?.[0]?.url
        ?? null;
      if (display) return display;
    }
  } catch {
    // ignore and fallback
  }
  // Fallback to media endpoint
  return instagramImageFromShortcode(shortcode);
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

    // Helper to enrich TikTok metadata (works for both new and existing rows)
    async function enrichTikTokMeta(current: any) {
      if (platform !== 'tiktok') return current;
      const needsTitle = !current?.title || /tiktok - make/i.test(current.title);
      const needsThumb = !current?.thumbnail_url;
      const needsAuthor = !current?.author;
      if (!needsTitle && !needsThumb && !needsAuthor) return current;
      const oembed = await fetchTikTokOEmbed(canonical);
      if (!oembed) return current;
      const updated = {
        ...current,
        title: needsTitle ? (oembed.title ?? current?.title) : current?.title,
        author: needsAuthor ? (oembed.author ?? current?.author) : current?.author,
        thumbnail_url: needsThumb ? (oembed.image ?? current?.thumbnail_url) : current?.thumbnail_url,
      };
      const { data: saved } = await supabase
        .from('items')
        .update({
          title: updated.title,
          author: updated.author,
          thumbnail_url: updated.thumbnail_url,
        })
        .eq('id', current.id)
        .select('*')
        .single();
      return saved ?? updated;
    }

    async function enrichInstagramMeta(current: any) {
      if (platform !== 'instagram') return current;
      const needsThumb = !current?.thumbnail_url;
      const needsAuthor = !current?.author || current?.author === 'Unknown creator';
      if (!needsThumb && !needsAuthor) return current;
      const shortcode = extractInstagramShortcode(canonical);
      const thumb = needsThumb ? await fetchInstagramImage(shortcode) : current?.thumbnail_url;

      // Attempt to derive author from title if it matches "<user> on Instagram"
      let derivedAuthor = current?.author;
      if (needsAuthor && typeof current?.title === 'string') {
        const m = current.title.match(/^([^:]+)\s+on\s+Instagram/i);
        if (m?.[1]) derivedAuthor = m[1].trim();
      }

      const { data: saved } = await supabase
        .from('items')
        .update({
          author: derivedAuthor ?? current?.author ?? 'Instagram',
          thumbnail_url: thumb ?? current?.thumbnail_url,
        })
        .eq('id', current.id)
        .select('*')
        .single();
      return saved ?? { ...current, author: derivedAuthor ?? current?.author ?? 'Instagram', thumbnail_url: thumb ?? current?.thumbnail_url };
    }

    if (existing) {
      const enrichedTikTok = await enrichTikTokMeta(existing);
      const enriched = await enrichInstagramMeta(enrichedTikTok);
      return new Response(JSON.stringify(enriched ?? existing), { headers: { 'Content-Type': 'application/json' } });
    }

    const og = await parseOG(canonical);

    // Enrich TikTok metadata with oEmbed (better title/author/thumbnail than generic OG tags)
    const withOembed = platform === 'tiktok' ? await fetchTikTokOEmbed(canonical) : null;
    if (withOembed) {
      og.title = withOembed.title ?? og.title;
      og.author = withOembed.author ?? og.author;
      og.image = withOembed.image ?? og.image;
    }

    if (platform === 'instagram') {
      const shortcode = extractInstagramShortcode(canonical);
      if (!og.image) og.image = await fetchInstagramImage(shortcode);
      if (!og.author && og.title) {
        const m = og.title.match(/^([^:]+)\s+on\s+Instagram/i);
        if (m?.[1]) og.author = m[1].trim();
      }
    }

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


