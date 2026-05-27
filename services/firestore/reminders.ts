import { where } from 'firebase/firestore';

import { Reminder, ReminderType, WithId } from '@/types/firestore';
import { addDocument, deleteDocument, patchDocument, subscribeQuery } from './base';

export function subscribeRemindersByUser(
  userId: string,
  onData: (items: WithId<Reminder>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<Reminder>(
    'reminders',
    [where('userId', '==', userId)],
    onData,
    onError,
  );
}

export function subscribeRemindersByFarm(
  userId: string,
  farmId: string,
  onData: (items: WithId<Reminder>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<Reminder>(
    'reminders',
    [where('userId', '==', userId), where('farmId', '==', farmId)],
    onData,
    onError,
  );
}

export async function createReminder(input: {
  userId: string;
  farmId: string;
  message: string;
  scheduledAt: string;
  type?: ReminderType;
}): Promise<string> {
  return addDocument<Reminder>('reminders', {
    userId: input.userId,
    farmId: input.farmId,
    type: input.type ?? 'custom',
    message: input.message,
    scheduledAt: input.scheduledAt,
    isSent: false,
    isRead: false,
  });
}

export async function markReminderRead(id: string): Promise<void> {
  await patchDocument<Reminder>('reminders', id, { isRead: true });
}

export async function setReminderCompleted(id: string, completed: boolean): Promise<void> {
  await patchDocument<Reminder>('reminders', id, { isRead: completed });
}

export async function updateReminder(
  id: string,
  input: Partial<Pick<Reminder, 'message' | 'scheduledAt' | 'type' | 'farmId'>>,
): Promise<void> {
  await patchDocument<Reminder>('reminders', id, {
    ...(input.message !== undefined ? { message: input.message.trim() } : {}),
    ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.farmId !== undefined ? { farmId: input.farmId } : {}),
  });
}

export async function deleteReminder(id: string): Promise<void> {
  await deleteDocument('reminders', id);
}
