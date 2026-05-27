import { collection, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';

import { Roadmap, RoadmapStatus, RoadmapStep, WithId } from '@/types/firestore';
import { addDocument, getDocument, patchDocument, subscribeQuery } from './base';
import { db } from '@/lib/firebase';
import type { RoadmapStepDraft } from '@/lib/ai/roadmap';
function addDaysToIso(start: Date, days: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function subscribeRoadmapsByCreator(
  createdBy: string,
  onData: (items: WithId<Roadmap>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<Roadmap>(
    'roadmaps',
    [where('createdBy', '==', createdBy), where('isActive', '==', true)],
    onData,
    onError,
  );
}

export function subscribeRoadmapSteps(
  roadmapId: string,
  onData: (steps: WithId<RoadmapStep>[]) => void,
  onError?: (error: Error) => void,
) {
  return subscribeQuery<RoadmapStep>(
    'roadmapSteps',
    [where('roadmapId', '==', roadmapId)],
    onData,
    onError,
  );
}

export async function getRoadmap(id: string): Promise<WithId<Roadmap> | null> {
  return getDocument<Roadmap>('roadmaps', id);
}

export async function createRoadmap(input: {
  farmId: string;
  createdBy: string;
  title: string;
  cropName: string;
  plantingEnvironment: Roadmap['plantingEnvironment'];
  status?: RoadmapStatus;
  additionalNotes?: string;
  aiGeneratedPlan?: string;
  imageUrl?: string;
  steps?: RoadmapStepDraft[];
  /** Create matching reminders (legacy web behavior) */
  withReminders?: boolean;
}): Promise<string> {
  const startDate = new Date();
  const roadmapId = await addDocument<Roadmap>('roadmaps', {
    farmId: input.farmId,
    createdBy: input.createdBy,
    title: input.title.trim(),
    cropName: input.cropName.trim(),
    plantingEnvironment: input.plantingEnvironment,
    status: input.status ?? 'active',
    promptUsed: input.additionalNotes?.trim() || '',
    aiGeneratedPlan: input.aiGeneratedPlan ?? '',
    ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    isActive: true,
  });

  if (input.steps?.length) {
    const batch = writeBatch(db);
    input.steps.forEach((s) => {
      const stepRef = doc(collection(db, 'roadmapSteps'));
      const due = addDaysToIso(startDate, s.daysFromStart);
      batch.set(stepRef, {
        roadmapId,
        stepNumber: s.stepNumber,
        title: s.title,
        description: s.description,
        dueDate: due,
        isCompleted: false,
        category: s.category ?? 'preparation',
      } satisfies RoadmapStep);

      if (input.withReminders) {
        const reminderRef = doc(collection(db, 'reminders'));
        const remindAt = addDaysToIso(startDate, Math.max(0, s.daysFromStart - 2));
        batch.set(reminderRef, {
          userId: input.createdBy,
          farmId: input.farmId,
          roadmapStepId: stepRef.id,
          type: 'custom',
          message: `Reminder: ${s.title} for your ${input.cropName} roadmap is due soon.`,
          scheduledAt: remindAt,
          isSent: false,
          isRead: false,
        });
      }
    });
    await batch.commit();
  }
  return roadmapId;
}

export async function archiveRoadmap(id: string): Promise<void> {
  await patchDocument<Roadmap>('roadmaps', id, { isActive: false });
}

export async function deleteRoadmap(id: string): Promise<void> {
  const stepsSnap = await getDocs(
    query(collection(db, 'roadmapSteps'), where('roadmapId', '==', id)),
  );
  const batch = writeBatch(db);
  for (const stepDoc of stepsSnap.docs) {
    const remindersSnap = await getDocs(
      query(collection(db, 'reminders'), where('roadmapStepId', '==', stepDoc.id)),
    );
    remindersSnap.docs.forEach((r) => batch.delete(r.ref));
    batch.delete(stepDoc.ref);
  }
  await batch.commit();
  await archiveRoadmap(id);
  console.log('[Roadmaps] deleted roadmap', { id, steps: stepsSnap.size });
}
