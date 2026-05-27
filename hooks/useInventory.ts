import { useCallback, useEffect, useState } from 'react';

import {
  createInventoryItem,
  CreateInventoryInput,
  subscribeInventoryByUser,
  updateInventoryItem,
} from '@/services/firestore/inventory';
import { InventoryItem, WithId } from '@/types/firestore';
import { useAuth } from './useAuth';
import { useFarms } from './useFarms';

export function useInventory() {
  const { user } = useAuth();
  const { farms } = useFarms();
  const [items, setItems] = useState<WithId<InventoryItem>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeInventoryByUser(
      user.id,
      (data) => {
        setItems([...data].sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [user?.id]);

  const addItem = useCallback(
    async (data: Omit<CreateInventoryInput, 'userId'>) => {
      if (!user?.id) throw new Error('Not signed in');
      await createInventoryItem({ ...data, userId: user.id });
    },
    [user?.id],
  );

  const editItem = useCallback(
    async (id: string, data: Omit<CreateInventoryInput, 'userId'>) => {
      if (!user?.id) throw new Error('Not signed in');
      await updateInventoryItem(id, data);
    },
    [user?.id],
  );

  return { items, farms, loading, error, addItem, editItem };
}
