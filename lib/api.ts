import { supabase } from './supabase';

export async function createItemViaUnfurl(url: string, note?: string) {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return { error: new Error('Not signed in') };
  const { data, error } = await supabase.functions.invoke('unfurl', {
    body: { url, note },
  });
  return { data, error };
}

export type FeedTag =
  | 'All'
  | 'Inbox'
  | 'Food'
  | 'Travel'
  | 'Tech'
  | 'Fitness'
  | 'Home'
  | 'Style'
  | 'Finance'
  | 'Learning'
  | 'Events'
  | 'DIY'
  | 'Beauty'
  | 'Health'
  | 'Parenting'
  | 'Pets'
  | 'Other';

export async function fetchFeed(tag: FeedTag) {
  const base = supabase
    .from('items')
    .select('*, item_tags(tag, confidence), notes(body)')
    .order('created_at', { ascending: false });
  if (tag === 'All') return base;
  if (tag === 'Inbox') return base.eq('is_done', false);
  // Filter by related tag via inner join
  return supabase
    .from('items')
    .select('*, item_tags!inner(tag, confidence), notes(body)')
    .eq('item_tags.tag', tag)
    .order('created_at', { ascending: false });
}

export async function upsertTags(itemId: string, tags: { tag: string; confidence?: number }[]) {
  const rows = tags.map((t) => ({ item_id: itemId, tag: t.tag, confidence: t.confidence ?? null }));
  return supabase.from('item_tags').upsert(rows, { onConflict: 'item_id,tag' });
}

export async function upsertNote(itemId: string, body: string) {
  return supabase.from('notes').upsert({ item_id: itemId, body });
}


