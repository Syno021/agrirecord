import { useCallback, useEffect, useState } from 'react';

import {
  createFarm,
  CreateFarmInput,
  subscribeFarmsByOwner,
  updateFarm,
} from '@/services/firestore/farms';
import { Farm, WithId } from '@/types/firestore';
import { useAuth } from './useAuth';

export function useFarms() {
  const { user } = useAuth();
  const [farms, setFarms] = useState<WithId<Farm>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setFarms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeFarmsByOwner(
      user.id,
      (data) => {
        setFarms([...data].sort((a, b) => a.name.localeCompare(b.name)));
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

  const addFarm = useCallback(
    async (data: CreateFarmInput) => {
      if (!user?.id) throw new Error('Not signed in');
      await createFarm(user.id, data);
    },
    [user?.id],
  );

  const editFarm = useCallback(
    async (farmId: string, data: CreateFarmInput) => {
      if (!user?.id) throw new Error('Not signed in');
      await updateFarm(farmId, {
        name: data.name,
        location: data.location,
        sizeHectares: data.sizeHectares,
        primaryCrop: data.primaryCrop,
        irrigationType: data.irrigationType,
        soilType: data.soilType,
        description: data.description,
      });
    },
    [user?.id],
  );

  return { farms, loading, error, addFarm, editFarm };
}
