import { getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { ActivityLog, ActivityLogType, WithId } from '@/types/firestore';
import { addDocument, col, patchDocument, subscribeQuery } from './base';

export function subscribeActivityLogsByOwner(
  farmOwnerId: string,
  onData: (logs: WithId<ActivityLog>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<ActivityLog>(
    'activityLogs',
    [where('farmOwnerId', '==', farmOwnerId), where('isActive', '==', true)],
    onData,
    onError,
  );
}

export function subscribeActivityLogsByFarm(
  farmId: string,
  onData: (logs: WithId<ActivityLog>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<ActivityLog>(
    'activityLogs',
    [where('farmId', '==', farmId), where('isActive', '==', true)],
    onData,
    onError,
  );
}

export async function createActivityLog(input: {
  farmId: string;
  recordedBy: string;
  farmOwnerId: string;
  type?: ActivityLogType;
  cropName: string;
  notes?: string;
  productUsed?: string;
}): Promise<string> {
  return addDocument<ActivityLog>('activityLogs', {
    farmId: input.farmId,
    recordedBy: input.recordedBy,
    farmOwnerId: input.farmOwnerId,
    type: input.type ?? 'other',
    date: new Date().toISOString(),
    cropName: input.cropName,
    productUsed: input.productUsed ?? '',
    notes: input.notes ?? '',
    isActive: true,
  });
}

export async function updateActivityLog(
  id: string,
  input: Partial<Pick<ActivityLog, 'type' | 'cropName' | 'notes' | 'productUsed' | 'date'>>,
): Promise<void> {
  await patchDocument<ActivityLog>('activityLogs', id, {
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.cropName !== undefined ? { cropName: input.cropName.trim() } : {}),
    ...(input.productUsed !== undefined ? { productUsed: input.productUsed?.trim() || '' } : {}),
    ...(input.notes !== undefined ? { notes: input.notes?.trim() || '' } : {}),
    ...(input.date !== undefined ? { date: input.date } : {}),
  });
}

export async function archiveActivityLog(id: string): Promise<void> {
  await patchDocument<ActivityLog>('activityLogs', id, { isActive: false });
}

export async function getRecentActivityLogsByUser(
  userId: string,
  max = 10,
): Promise<WithId<ActivityLog>[]> {
  const q = query(
    col('activityLogs'),
    where('recordedBy', '==', userId),
    where('isActive', '==', true),
    orderBy('date', 'desc'),
    limit(max),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ActivityLog) }));
}
