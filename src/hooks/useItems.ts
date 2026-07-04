import { useEffect, useState } from 'react';
import { subscribeToTopLevelItems } from '@/services/items';
import { useAuth } from '@/contexts/AuthContext';
import type { Item } from '@/types';

export function useItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTopLevelItems(user.uid, (items) => {
      setItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return { items, loading };
}
