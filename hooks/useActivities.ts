import { useCallback, useEffect, useMemo, useState } from 'react';

import { formatDisplayDate, relativeTime, toIsoString } from '@/lib/firebase/utils';
import { createActivityLog, subscribeActivityLogsByOwner } from '@/services/firestore/activities';
import { ActivityLog, WithId } from '@/types/firestore';
import { useAuth } from './useAuth';
import { useFarms } from './useFarms';

export type ActivityListItem = {
  id: string;
  title: string;
  farm: string;
  date: string;
  type: string;
  sortDate: string;
};

function toListItem(log: WithId<ActivityLog>, farmName: string): ActivityListItem {
  const iso = toIsoString(log.date);
  const title = log.notes?.trim() || log.productUsed?.trim() || `${log.type} — ${log.cropName}`;
  return {
    id: log.id,
    title,
    farm: farmName,
    date: formatDisplayDate(iso),
    type: log.type,
    sortDate: iso,
  };
}

export function useActivities() {
  const { user } = useAuth();
  const { farms } = useFarms();
  const [logs, setLogs] = useState<WithId<ActivityLog>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const farmMap = useMemo(
    () => Object.fromEntries(farms.map((f) => [f.id, f.name])),
    [farms],
  );

  useEffect(() => {
    if (!user?.id) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeActivityLogsByOwner(
      user.id,
      (data) => {
        setLogs(data);
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

  const activities = useMemo(
    () =>
      [...logs]
        .map((log) => toListItem(log, farmMap[log.farmId] ?? 'Farm'))
        .sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
    [logs, farmMap],
  );

  const recentForDashboard = useMemo(
    () =>
      activities.slice(0, 5).map((a) => ({
        id: a.id,
        title: a.title,
        farm: a.farm,
        time: relativeTime(a.sortDate),
      })),
    [activities],
  );

  const addActivity = useCallback(
    async (title: string, farmId?: string) => {
      if (!user?.id) throw new Error('Not signed in');
      const targetFarmId = farmId ?? farms[0]?.id;
      if (!targetFarmId) throw new Error('Add a farm before logging activities');
      await createActivityLog({
        farmId: targetFarmId,
        recordedBy: user.id,
        farmOwnerId: user.id,
        cropName: title,
        notes: title,
      });
    },
    [user?.id, farms],
  );

  return { activities, recentForDashboard, loading, error, addActivity, farms };
}
