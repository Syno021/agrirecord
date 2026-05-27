import { where } from 'firebase/firestore';

import { Farm, WithId } from '@/types/firestore';
import { addDocument, patchDocument, subscribeQuery } from './base';

export type CreateFarmInput = {
  name: string;
  location: string;
  sizeHectares: number;
  primaryCrop: string;
  irrigationType: string;
  soilType?: string;
  description?: string;
};

export function subscribeFarmsByOwner(
  ownerId: string,
  onData: (farms: WithId<Farm>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<Farm>(
    'farms',
    [where('ownerId', '==', ownerId), where('isActive', '==', true)],
    onData,
    onError,
  );
}

export function subscribeAllActiveFarms(
  onData: (farms: WithId<Farm>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<Farm>(
    'farms',
    [where('isActive', '==', true)],
    onData,
    onError,
  );
}

export async function createFarm(ownerId: string, data: CreateFarmInput): Promise<string> {
  const descriptionParts = [
    data.description?.trim(),
    data.soilType ? `Soil: ${data.soilType}` : '',
  ].filter(Boolean);

  return addDocument<Farm>('farms', {
    ownerId,
    name: data.name.trim(),
    location: data.location.trim(),
    sizeHectares: data.sizeHectares,
    primaryCrop: data.primaryCrop.trim(),
    irrigationType: data.irrigationType,
    soilType: data.soilType ?? '',
    description: descriptionParts.join('\n') || '',
    isActive: true,
    collaborators: [],
  });
}

export async function archiveFarm(farmId: string): Promise<void> {
  await patchDocument<Farm>('farms', farmId, { isActive: false });
}

export async function updateFarm(
  farmId: string,
  data: Partial<Omit<Farm, 'ownerId'>>,
): Promise<void> {
  await patchDocument<Farm>('farms', farmId, {
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.location !== undefined ? { location: data.location?.trim() || '' } : {}),
    ...(data.sizeHectares !== undefined ? { sizeHectares: data.sizeHectares } : {}),
    ...(data.primaryCrop !== undefined ? { primaryCrop: data.primaryCrop?.trim() || '' } : {}),
    ...(data.irrigationType !== undefined ? { irrigationType: data.irrigationType ?? '' } : {}),
    ...(data.soilType !== undefined ? { soilType: data.soilType?.trim() || '' } : {}),
    ...(data.description !== undefined ? { description: data.description?.trim() || '' } : {}),
    ...(data.collaborators !== undefined ? { collaborators: data.collaborators ?? [] } : {}),
  });
}
