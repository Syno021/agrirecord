import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';

import { RoadmapStep } from '@/types/firestore';
import { db } from '@/lib/firebase';
import { patchDocument } from './base';

export async function setRoadmapStepCompleted(stepId: string, completed: boolean): Promise<void> {
  await patchDocument<RoadmapStep>('roadmapSteps', stepId, { isCompleted: completed });
}

export async function deleteRoadmapStepsForRoadmap(roadmapId: string): Promise<void> {
  const snap = await getDocs(
    query(collection(db, 'roadmapSteps'), where('roadmapId', '==', roadmapId)),
  );
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
