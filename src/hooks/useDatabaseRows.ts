import { useEffect, useState } from 'react';
import { subscribeToDatabaseRows } from '@/services/items';
import { useAuth } from '@/contexts/AuthContext';
import type { Item } from '@/types';

export function useDatabaseRows(databaseId: string | undefined) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !databaseId) {
      setRows([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDatabaseRows(user.uid, databaseId, (rows) => {
      setRows(rows);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, databaseId]);

  return { rows, loading };
}
