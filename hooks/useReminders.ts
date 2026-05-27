import { useEffect, useMemo, useState } from 'react';

import {
  formatDisplayDate,
  isOverdue,
  isThisWeek,
  isToday,
  toIsoString,
} from '@/lib/firebase/utils';
import { subscribeRemindersByUser } from '@/services/firestore/reminders';
import { Reminder, WithId } from '@/types/firestore';
import { useAuth } from './useAuth';

export type ReminderListItem = {
  id: string;
  title: string;
  due: string;
  status: 'overdue' | 'pending';
  completed: boolean;
  scheduledAt: string;
};

function toListItem(r: WithId<Reminder>): ReminderListItem {
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

export function useReminders() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<WithId<Reminder>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setReminders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeRemindersByUser(
      user.id,
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
  }, [user?.id]);

  const items = useMemo(() => reminders.map(toListItem), [reminders]);

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
    return [
      { title: 'Overdue', data: overdue },
      { title: 'Today', data: today },
      { title: 'This Week', data: week },
    ].filter((s) => s.data.length > 0);
  }, [items]);

  const urgentCount = useMemo(
    () => items.filter((r) => r.status === 'overdue' && !r.completed).length,
    [items],
  );

  const tasksDueCount = useMemo(
    () => items.filter((r) => !r.completed && r.status === 'pending').length,
    [items],
  );

  return { items, sections, loading, error, urgentCount, tasksDueCount };
}
