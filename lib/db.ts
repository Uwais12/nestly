import { supabase } from './supabase';

export async function getItemsByTag(userId: string, tag: string) {
  let q = supabase.from('items').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (tag === 'Inbox') q = q.eq('is_done', false);
  if (tag !== 'All' && tag !== 'Inbox') {
    const { data: tags } = await supabase.from('item_tags').select('item_id').eq('tag', tag);
    const ids = (tags ?? []).map((t) => t.item_id);
    q = ids.length ? q.in('id', ids) : q.in('id', ['__none__']);
  }
  return q;
}


