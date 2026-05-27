import { where } from 'firebase/firestore';

import { InventoryCategory, InventoryItem, WithId } from '@/types/firestore';
import { addDocument, deleteDocument, patchDocument, subscribeQuery } from './base';

export type CreateInventoryInput = {
  userId: string;
  farmId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  lotBatchId?: string;
  expiryDate?: string;
  storageLocation?: string;
  notes?: string;
};

export function subscribeInventoryByUser(
  userId: string,
  onData: (items: WithId<InventoryItem>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<InventoryItem>(
    'inventoryItems',
    [where('userId', '==', userId)],
    onData,
    onError,
  );
}

export async function createInventoryItem(input: CreateInventoryInput): Promise<string> {
  const now = new Date().toISOString();
  return addDocument<InventoryItem>('inventoryItems', {
    userId: input.userId,
    farmId: input.farmId,
    name: input.name.trim(),
    category: input.category,
    quantity: input.quantity,
    unit: input.unit,
    minThreshold: input.minThreshold,
    costPerUnit: input.costPerUnit,
    lotBatchId: input.lotBatchId?.trim() || undefined,
    expiryDate: input.expiryDate?.trim() || undefined,
    storageLocation: input.storageLocation?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    lastUpdated: now,
  });
}

export async function updateInventoryItem(
  id: string,
  input: Partial<Omit<CreateInventoryInput, 'userId'>> & {
    farmId?: string;
    name?: string;
  },
): Promise<void> {
  const now = new Date().toISOString();
  await patchDocument<InventoryItem>('inventoryItems', id, {
    ...(input.farmId !== undefined ? { farmId: input.farmId } : {}),
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
    ...(input.unit !== undefined ? { unit: input.unit } : {}),
    ...(input.minThreshold !== undefined ? { minThreshold: input.minThreshold } : {}),
    ...(input.costPerUnit !== undefined ? { costPerUnit: input.costPerUnit } : {}),
    ...(input.lotBatchId !== undefined ? { lotBatchId: input.lotBatchId?.trim() || undefined } : {}),
    ...(input.expiryDate !== undefined ? { expiryDate: input.expiryDate?.trim() || undefined } : {}),
    ...(input.storageLocation !== undefined
      ? { storageLocation: input.storageLocation?.trim() || undefined }
      : {}),
    ...(input.notes !== undefined ? { notes: input.notes?.trim() || undefined } : {}),
    lastUpdated: now,
  });
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await deleteDocument('inventoryItems', id);
}
