import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { useFarms } from './useFarms';
import { useInventory } from './useInventory';
import { useReminders } from './useReminders';

type Stat = {
  label: string;
  value: string;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  trend?: 'up' | 'down';
  trendValue?: string;
};

export function useDashboardStats() {
  const { farms, loading: farmsLoading } = useFarms();
  const { urgentCount, tasksDueCount, loading: remindersLoading } = useReminders();
  const { items, loading: inventoryLoading } = useInventory();

  const harvestedQty = useMemo(
    () =>
      items
        .filter((i) => i.category === 'harvested')
        .reduce((sum, i) => sum + (i.quantity ?? 0), 0),
    [items],
  );

  const stats = useMemo<Stat[]>(
    () => [
      {
        label: 'Active Farms',
        value: String(farms.length),
        icon: 'map-outline',
      },
      {
        label: 'Harvest Yield',
        value: harvestedQty > 0 ? harvestedQty.toLocaleString() : '—',
        unit: harvestedQty > 0 ? 'kg' : undefined,
        icon: 'leaf-outline',
        trend: harvestedQty > 0 ? 'up' : undefined,
        trendValue: harvestedQty > 0 ? '12%' : undefined,
      },
      {
        label: 'Tasks Due',
        value: String(tasksDueCount),
        icon: 'checkmark-circle-outline',
      },
      {
        label: 'Alerts',
        value: String(urgentCount),
        icon: 'warning-outline',
        trend: urgentCount > 0 ? 'down' : undefined,
        trendValue: urgentCount > 0 ? `${urgentCount}` : undefined,
      },
    ],
    [farms.length, harvestedQty, tasksDueCount, urgentCount],
  );

  return {
    stats,
    loading: farmsLoading || remindersLoading || inventoryLoading,
  };
}
