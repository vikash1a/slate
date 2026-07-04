import { useEffect, useState } from 'react';
import { subscribeToItem } from '@/services/items';
import { useAuth } from '@/contexts/AuthContext';
import type { Item } from '@/types';

export function useItem(itemId: string | undefined) {
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !itemId) {
      setItem(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToItem(user.uid, itemId, (item) => {
      setItem(item);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, itemId]);

  return { item, loading };
}
