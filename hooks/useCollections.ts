import { useCallback, useEffect, useState } from 'react';
import {
  addItemToCollection,
  Collection,
  createCollection,
  deleteCollection,
  getCollectionWithItems,
  listCollections,
  removeItemFromCollection,
  updateCollection,
} from '@/lib/collections';

export function useCollections() {
  const [collections, setCollections] = useState<(Collection & { collection_items?: { count: number }[] })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await listCollections();
    if (error) setError(error.message);
    setCollections(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { collections, loading, error, refresh };
}

export const collectionsApi = {
  create: createCollection,
  update: updateCollection,
  delete: deleteCollection,
  addItem: addItemToCollection,
  removeItem: removeItemFromCollection,
  getWithItems: getCollectionWithItems,
};
