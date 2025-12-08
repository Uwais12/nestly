import { supabase } from './supabase';

export type Collection = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export async function listCollections() {
  const { data, error } = await supabase
    .from('collections')
    .select('id,title,description,created_at, collection_items(count)')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .order('created_at', { ascending: false });
  return { data: (data as any) as (Collection & { collection_items: { count: number }[] })[] | null, error };
}

export async function createCollection(payload: { title: string; description?: string | null }) {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) return { data: null, error: new Error('Not signed in') };
  const { data, error } = await supabase
    .from('collections')
    .insert({ title: payload.title, description: payload.description ?? null, user_id: userId })
    .select('*')
    .single();
  return { data: data as Collection | null, error };
}

export async function updateCollection(id: string, payload: { title?: string; description?: string | null }) {
  const { error } = await supabase.from('collections').update(payload).eq('id', id);
  return { error };
}

export async function deleteCollection(id: string) {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  return { error };
}

export async function getCollectionWithItems(id: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('id,title,description,created_at, collection_items(item:items(*, item_tags(tag)))')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .eq('id', id)
    .single();
  return { data: data as any, error };
}

export async function addItemToCollection(collectionId: string, itemId: string) {
  const { error } = await supabase.from('collection_items').upsert({ collection_id: collectionId, item_id: itemId });
  return { error };
}

export async function removeItemFromCollection(collectionId: string, itemId: string) {
  const { error } = await supabase.from('collection_items').delete().eq('collection_id', collectionId).eq('item_id', itemId);
  return { error };
}
