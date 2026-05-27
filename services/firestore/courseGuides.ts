import { where } from 'firebase/firestore';

import { CourseGuide, WithId } from '@/types/firestore';
import { subscribeQuery } from './base';

export function subscribeCourseGuides(
  onData: (guides: WithId<CourseGuide>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<CourseGuide>(
    'courseGuides',
    [where('isActive', '==', true)],
    onData,
    onError,
  );
}
