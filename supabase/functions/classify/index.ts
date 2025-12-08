// @ts-nocheck
/* eslint-disable import/no-unresolved */
// Supabase Edge Function: classify
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

type Tag = 'Inbox'|'Food'|'Travel'|'Tech'|'Fitness'|'Home'|'Style'|'Finance'|'Learning'|'Events'|'DIY'|'Beauty'|'Health'|'Parenting'|'Pets'|'Other';

const TAGS: Tag[] = ['Inbox','Food','Travel','Tech','Fitness','Home','Style','Finance','Learning','Events','DIY','Beauty','Health','Parenting','Pets','Other'];

interface Payload { itemId: string; title?: string; caption?: string; hashtags?: string[] }

serve(async (req) => {
  try {
    const { itemId, title, caption, hashtags }: Payload = await req.json();
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } },
    });

    // Identify the user to prioritize tags they already use
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id ?? null;
    let userUsedTags: Tag[] = [];
    if (userId) {
      const { data: used } = await supabase
        .from('item_tags')
        .select('tag, items!inner(user_id)')
        .eq('items.user_id', userId);
      userUsedTags = Array.from(new Set((used ?? []).map((r: any) => r.tag))) as Tag[];
    }

    const text = [title, caption, (hashtags ?? []).join(' ')].filter(Boolean).join(' ');
    let shortTitle: string | null = null;

    let results: { tag: Tag; confidence: number }[] = [];
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const keyLooksValid = typeof OPENAI_API_KEY === 'string' && OPENAI_API_KEY.startsWith('sk-');
    if (keyLooksValid) {
      const preferNote = userUsedTags.length
        ? ` Prefer these when applicable: ${userUsedTags.filter((t) => t !== 'Inbox').join(', ')}.`
        : '';
      const system = `You classify short social video metadata (title, caption, hashtags) into zero or more of these tags: Food, Travel, Tech, Fitness, Home, Style, Finance, Learning, Events, DIY, Beauty, Health, Parenting, Pets, Other.${preferNote} Return ONLY a compact JSON array like [{"tag":"Food","confidence":0.76}]. Only include tags with confidence ≥ 0.35. Do not include explanations.`;
      const body = { model: 'gpt-4o-mini', messages: [ { role: 'system', content: system }, { role: 'user', content: text } ] };
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        console.error('OpenAI request failed', resp.status, text);
      }
      const json = await resp.json().catch(() => ({} as any));
      console.log(json);
      const content = json?.choices?.[0]?.message?.content ?? '[]';
      const tryParseArray = (str: string): any[] => {
        try {
          const parsed = JSON.parse(str.trim());
          if (Array.isArray(parsed)) return parsed;
        } catch {}
        const m = str.match(/\[[\s\S]*\]/);
        if (m) {
          try {
            const parsed = JSON.parse(m[0]);
            if (Array.isArray(parsed)) return parsed;
          } catch {}
        }
        return [];
      };
      const parsed = tryParseArray(content);
      if (Array.isArray(parsed)) {
        results = parsed
          .filter((r: any) => TAGS.includes(r?.tag) && r?.tag !== 'Inbox')
          .map((r: any) => ({ tag: r.tag as Tag, confidence: Number(r?.confidence ?? 0) }));
      }
      // Also ask for a very short 3-5 word title
      try {
        const titlePrompt = {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Write a concise, catchy 3-5 word title for a saved social video. No punctuation beyond basic capitalization. Return ONLY the title text.' },
            { role: 'user', content: text || (title ?? '') },
          ],
        };
        const tResp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(titlePrompt),
        });
        const tJson = await tResp.json().catch(() => ({} as any));
        const tContent = (tJson?.choices?.[0]?.message?.content ?? '').trim();
        if (tContent) shortTitle = tContent.slice(0, 80);
      } catch {}
    } else if (OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY appears invalid (expected to start with "sk-"). Falling back to rules.');
    } // else no key set — silently fall back to rules

    if (!results.length) {
      // rules fallback
      const map: Record<string, Tag> = {
        '#restaurant': 'Food', '#foodie': 'Food', 'menu': 'Food', 'recipe': 'Food',
        'flight': 'Travel', '#wanderlust': 'Travel', 'itinerary': 'Travel', 'hotel': 'Travel',
        'iphone': 'Tech', 'ai': 'Tech', 'coding': 'Tech',
        'workout': 'Fitness', 'gym': 'Fitness',
        'makeup': 'Beauty', 'skincare': 'Beauty',
        'budget': 'Finance', 'investing': 'Finance',
      };
      const found = new Map<Tag, number>();
      const lower = text.toLowerCase();
      for (const [k,t] of Object.entries(map)) if (lower.includes(k)) found.set(t as Tag, Math.min(1, (found.get(t as Tag) ?? 0) + 0.4));
      results = found.size ? [...found.entries()].map(([tag, confidence]) => ({ tag, confidence })) : [{ tag: 'Inbox', confidence: 0.3 }];
    }

    // Post-process: boost confidence for tags the user already uses so they rank higher
    if (userUsedTags.length && results.length) {
      const prefer = new Set(userUsedTags);
      results = results
        .map((r) => ({ tag: r.tag, confidence: Math.min(1, r.confidence + (prefer.has(r.tag) ? 0.15 : 0)) }))
        .sort((a, b) => (b.confidence - a.confidence));
    }

    // Upsert item_tags
    if (itemId) {
      const rows = results.map((r) => ({ item_id: itemId, tag: r.tag, confidence: r.confidence }));
      await supabase.from('item_tags').upsert(rows, { onConflict: 'item_id,tag' });
      if (shortTitle) {
        await supabase.from('items').update({ short_title: shortTitle }).eq('id', itemId);
      }
    }

    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400 });
  }
});


