import { useEffect, useState } from 'react';

import { subscribeFarmers } from '@/services/firestore/users-list';
import { UserProfile, WithId } from '@/types/firestore';

export type FarmerListItem = {
  id: string;
  name: string;
  farm: string;
  location: string;
};

export function useFarmers() {
  const [farmers, setFarmers] = useState<FarmerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeFarmers(
      (users: WithId<UserProfile>[]) => {
        setFarmers(
          users.map((u) => ({
            id: u.id,
            name: u.name,
            farm: u.farmName ?? '—',
            location: 'Kenya',
          })),
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  return { farmers, loading, error };
}
