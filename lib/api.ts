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

export async function deleteAccount() {
  // Note: Supabase client-side deletion requires the user to call an Edge Function with service role 
  // OR use the RPC if configured. For now, we will call a function if it existed, but simpler is:
  // Just delete the user from the auth schema? No, client cannot do that.
  // We will trigger the Edge Function 'delete-user' if we had one. 
  // 
  // Since we don't have a dedicated 'delete-user' function ready in your snippets,
  // and standard practice often uses an RPC or a specific edge function.
  //
  // However, for this specific codebase, we will invoke an Edge Function (we'll assume we create one or 
  // use a standard pattern). But wait, creating a new edge function might be overkill if we can just request via support?
  // No, requirement says "App must offer account deletion".
  //
  // Best approach for Supabase without a backend:
  // 1. Call an Edge Function `delete-account`.
  //
  // I will add the Edge Function invocation here. You will need to deploy it later or we can mock it if just UI is needed, 
  // but for real submission, it must work.
  //
  // Let's stub the Edge Function call.
  const { error } = await supabase.functions.invoke('delete-account');
  return { error };
}
