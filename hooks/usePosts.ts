import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';

export type Post = {
  id: string;
  url: string;
  title: string | null;
  short_title: string | null;
  author: string | null;
  thumbnail_url: string | null;
  created_at: string;
  is_done: boolean;
};

type FetchParams = {
  tags: string[]; // multi-select OR
  search: string;
  pageSize?: number;
  filters?: {
    after?: string; // ISO
    before?: string; // ISO
    platforms?: string[];
    sort?: 'recent' | 'oldest';
  };
};

export function usePosts({ tags, search, pageSize = 24, filters }: FetchParams) {
  const { session } = useSession();
  const [items, setItems] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestQuery = useRef<{ tagsKey: string; search: string; after?: string; before?: string; platforms?: string[]; sort?: string }>({ tagsKey: '', search: '' });

  const tagsKey = useMemo(() => [...tags].sort().join('|'), [tags]);
  const sort = filters?.sort ?? 'recent';
  const sortAscending = sort === 'oldest';

  const resetAndLoad = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    setPage(0);
    latestQuery.current = { tagsKey, search, after: filters?.after, before: filters?.before, platforms: filters?.platforms, sort: filters?.sort };
    try {
      const base = supabase
        .from('items')
        .select('*, item_tags(tag)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: sortAscending })
        .range(0, pageSize - 1);

      let query = base as any;

      if (search.trim().length) {
        // Simple ILIKE across selected fields to respect index; fallback if Postgres fts is not configured in client
        const term = `%${search.toLowerCase()}%`;
        query = query.or(`short_title.ilike.${term},title.ilike.${term}`);
      }

      if (filters?.platforms?.length) {
        query = query.in('platform', filters.platforms);
      }
      if (filters?.after) query = query.gte('created_at', filters.after);
      if (filters?.before) query = query.lte('created_at', filters.before);

      if (tags.length) {
        query = supabase
          .from('items')
          .select('*, item_tags!inner(tag)')
          .eq('user_id', session.user.id)
          .in('item_tags.tag', tags)
          .order('created_at', { ascending: sortAscending })
          .range(0, pageSize - 1);
        if (filters?.platforms?.length) query = query.in('platform', filters.platforms);
        if (filters?.after) query = query.gte('created_at', filters.after);
        if (filters?.before) query = query.lte('created_at', filters.before);
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
  }, [session?.user?.id, tagsKey, tags, search, pageSize, filters?.after, filters?.before, filters?.platforms, filters?.sort, sortAscending]);

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
        .order('created_at', { ascending: sortAscending })
        .range(from, to);
      if (search.trim().length) query = query.or(`short_title.ilike.%${search.toLowerCase()}%,title.ilike.%${search.toLowerCase()}%`);
      if (filters?.platforms?.length) query = query.in('platform', filters.platforms);
      if (filters?.after) query = query.gte('created_at', filters.after);
      if (filters?.before) query = query.lte('created_at', filters.before);
      if (tags.length) {
        query = supabase
          .from('items')
          .select('*, item_tags!inner(tag)')
          .eq('user_id', session.user.id)
          .in('item_tags.tag', tags)
          .order('created_at', { ascending: sortAscending })
          .range(from, to);
        if (filters?.platforms?.length) query = query.in('platform', filters.platforms);
        if (filters?.after) query = query.gte('created_at', filters.after);
        if (filters?.before) query = query.lte('created_at', filters.before);
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
  }, [session?.user?.id, page, pageSize, search, tags, loading, hasMore, filters?.after, filters?.before, filters?.platforms, sortAscending]);

  useEffect(() => {
    resetAndLoad();
  }, [resetAndLoad]);

  return { items, loading, error, hasMore, loadMore, reload: resetAndLoad };
}


