import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

export type Post = {
  id: string;
  url: string;
  title: string | null;
  author: string | null;
  thumbnail_url: string | null;
  created_at: string;
  is_done: boolean;
};

type FetchParams = {
  tags: string[]; // multi-select OR
  search: string;
  pageSize?: number;
};

export function usePosts({ tags, search, pageSize = 24 }: FetchParams) {
  const { session } = useSession();
  const [items, setItems] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestQuery = useRef<{ tagsKey: string; search: string }>({ tagsKey: '', search: '' });

  const tagsKey = useMemo(() => [...tags].sort().join('|'), [tags]);

  const resetAndLoad = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    setPage(0);
    latestQuery.current = { tagsKey, search };
    try {
      const base = supabase
        .from('items')
        .select('*, item_tags(tag)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .range(0, pageSize - 1);

      let query = base as any;

      if (search.trim().length) {
        // Simple ILIKE across selected fields to respect index; fallback if Postgres fts is not configured in client
        const term = `%${search.toLowerCase()}%`;
        query = query.ilike('title', term);
      }

      if (tags.length) {
        query = supabase
          .from('items')
          .select('*, item_tags!inner(tag)')
          .eq('user_id', session.user.id)
          .in('item_tags.tag', tags)
          .order('created_at', { ascending: false })
          .range(0, pageSize - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      setItems(((data as any) ?? []) as Post[]);
      setHasMore(((data as any)?.length ?? 0) === pageSize);
      setPage(1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, tagsKey, search, pageSize]);

  const loadMore = useCallback(async () => {
    if (!session?.user?.id || loading || !hasMore) return;
    setLoading(true);
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      let query: any = supabase
        .from('items')
        .select('*, item_tags(tag)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (search.trim().length) query = query.ilike('title', `%${search.toLowerCase()}%`);
      if (tags.length) {
        query = supabase
          .from('items')
          .select('*, item_tags!inner(tag)')
          .eq('user_id', session.user.id)
          .in('item_tags.tag', tags)
          .order('created_at', { ascending: false })
          .range(from, to);
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = ((data as any) ?? []) as Post[];
      setItems((prev) => [...prev, ...rows]);
      setHasMore(rows.length === pageSize);
      setPage((p) => p + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, page, pageSize, search, tags, loading, hasMore]);

  useEffect(() => {
    resetAndLoad();
  }, [resetAndLoad]);

  return { items, loading, error, hasMore, loadMore, reload: resetAndLoad };
}


