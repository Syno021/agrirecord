import { where } from 'firebase/firestore';

import { UserProfile, WithId } from '@/types/firestore';
import { subscribeQuery } from './base';

export function subscribeFarmers(
  onData: (users: WithId<UserProfile>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<UserProfile>(
    'users',
    [where('role', '==', 'farmer'), where('isActive', '==', true)],
    onData,
    onError,
  );
}
