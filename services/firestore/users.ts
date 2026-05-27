import { serverTimestamp } from 'firebase/firestore';

import { BlueprintUserRole, UserProfile, WithId } from '@/types/firestore';
import { getDocument, setDocument } from './base';

export async function getUserProfile(uid: string): Promise<WithId<UserProfile> | null> {
  return getDocument<UserProfile>('users', uid);
}

export async function upsertUserProfile(
  uid: string,
  data: {
    name: string;
    email: string;
    role: BlueprintUserRole;
    farmName?: string;
  },
): Promise<void> {
  const existing = await getUserProfile(uid);
  await setDocument(
    'users',
    uid,
    {
      name: data.name,
      email: data.email,
      role: data.role,
      isActive: true,
      ...(data.farmName ? { farmName: data.farmName } : {}),
      ...(existing ? {} : { createdAt: serverTimestamp() }),
      updatedAt: serverTimestamp(),
    },
    true,
  );
}
