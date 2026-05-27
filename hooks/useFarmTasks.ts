import { useEffect, useMemo, useState } from 'react';

import {
  formatDisplayDate,
  isOverdue,
  isThisWeek,
  isToday,
  toIsoString,
} from '@/lib/firebase/utils';
import { subscribeRemindersByFarm } from '@/services/firestore/reminders';
import { Reminder, WithId } from '@/types/firestore';
import { useAuth } from './useAuth';

export type TaskListItem = {
  id: string;
  title: string;
  due: string;
  status: 'overdue' | 'pending';
  completed: boolean;
  scheduledAt: string;
};

function toTask(r: WithId<Reminder>): TaskListItem {
  const scheduledAt = toIsoString(r.scheduledAt);
  const overdue = isOverdue(scheduledAt) && !r.isRead;
  return {
    id: r.id,
    title: r.message,
    due: formatDisplayDate(scheduledAt),
    status: overdue ? 'overdue' : 'pending',
    completed: r.isRead,
    scheduledAt,
  };
}

export function useFarmTasks(farmId: string | undefined) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<WithId<Reminder>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !farmId) {
      setReminders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeRemindersByFarm(
      user.id,
      farmId,
      (data) => {
        setReminders(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [user?.id, farmId]);

  const items = useMemo(() => reminders.map(toTask), [reminders]);

  const sections = useMemo(() => {
    const overdue = items.filter((r) => r.status === 'overdue' && !r.completed);
    const today = items.filter(
      (r) => r.status === 'pending' && !r.completed && isToday(r.scheduledAt),
    );
    const week = items.filter(
      (r) =>
        r.status === 'pending' &&
        !r.completed &&
        isThisWeek(r.scheduledAt) &&
        !isToday(r.scheduledAt),
    );
    const completed = items
      .filter((r) => r.completed)
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
    return [
      { title: 'Overdue', data: overdue },
      { title: 'Today', data: today },
      { title: 'This Week', data: week },
      { title: 'Completed', data: completed },
    ].filter((s) => s.data.length > 0);
  }, [items]);

  return { items, sections, loading, error };
}

