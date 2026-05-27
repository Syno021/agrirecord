import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getRoadmap,
  createRoadmap,
  deleteRoadmap,
  subscribeRoadmapsByCreator,
  subscribeRoadmapSteps,
} from '@/services/firestore/roadmaps';
import { getRecentActivityLogsByUser } from '@/services/firestore/activities';
import { Roadmap, RoadmapStep, WithId } from '@/types/firestore';
import { useAuth } from './useAuth';
import { generateRoadmapWithMeta } from '@/lib/ai/roadmap';

export type RoadmapListItem = {
  id: string;
  crop: string;
  season: string;
  completedSteps: number;
  totalSteps: number;
};

export type RoadmapStepView = {
  id: string;
  title: string;
  description: string;
  status: 'done' | 'active' | 'pending';
};

export type RoadmapDetail = {
  id: string;
  crop: string;
  insight: string;
  imageUrl?: string;
  steps: RoadmapStepView[];
};

export function useRoadmaps() {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<WithId<Roadmap>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setRoadmaps([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeRoadmapsByCreator(
      user.id,
      (data) => {
        setRoadmaps(data);
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

  const list = useMemo<RoadmapListItem[]>(
    () =>
      roadmaps.map((r) => ({
        id: r.id,
        crop: r.cropName,
        season: r.status,
        completedSteps: 0,
        totalSteps: 1,
      })),
    [roadmaps],
  );

  const addRoadmap = useCallback(
    async (input: {
      farmId: string;
      cropName: string;
      plantingEnvironment: Roadmap['plantingEnvironment'];
      additionalNotes?: string;
    }) => {
      if (!user?.id) throw new Error('Not signed in');

      console.log('[useRoadmaps] addRoadmap start', input);

      let activityHistory: { cropName: string; type: string; date: string; notes?: string }[] = [];
      try {
        const logs = await getRecentActivityLogsByUser(user.id, 10);
        activityHistory = logs.map((l) => ({
          cropName: l.cropName,
          type: l.type,
          date: l.date,
          notes: l.notes,
        }));
        console.log('[useRoadmaps] activity history', activityHistory.length);
      } catch (e) {
        console.warn('[useRoadmaps] activity history skipped', e);
      }

      const generated = await generateRoadmapWithMeta({
        cropName: input.cropName,
        plantingEnvironment: input.plantingEnvironment,
        additionalNotes: input.additionalNotes,
        activityHistory,
      });

      const roadmapId = await createRoadmap({
        farmId: input.farmId,
        createdBy: user.id,
        title: `${input.cropName} Planting Plan`,
        cropName: input.cropName,
        plantingEnvironment: input.plantingEnvironment,
        status: 'active',
        additionalNotes: input.additionalNotes,
        aiGeneratedPlan: generated.insight,
        imageUrl: generated.imageUrl,
        steps: generated.steps,
        withReminders: true,
      });

      console.log('[useRoadmaps] addRoadmap done', { roadmapId });
      return roadmapId;
    },
    [user?.id],
  );

  const removeRoadmap = useCallback(async (roadmapId: string) => {
    console.log('[useRoadmaps] deleteRoadmap', roadmapId);
    await deleteRoadmap(roadmapId);
  }, []);

  return { roadmaps: list, rawRoadmaps: roadmaps, loading, error, addRoadmap, removeRoadmap };
}

export function useRoadmapDetail(roadmapId: string | undefined) {
  const [roadmap, setRoadmap] = useState<WithId<Roadmap> | null>(null);
  const [steps, setSteps] = useState<WithId<RoadmapStep>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roadmapId) return;
    let cancelled = false;
    getRoadmap(roadmapId).then((doc) => {
      if (!cancelled) setRoadmap(doc);
    });
    return () => {
      cancelled = true;
    };
  }, [roadmapId]);

  useEffect(() => {
    if (!roadmapId) return;
    setLoading(true);
    const unsub = subscribeRoadmapSteps(
      roadmapId,
      (data) => {
        setSteps([...data].sort((a, b) => a.stepNumber - b.stepNumber));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [roadmapId]);

  const detail = useMemo<RoadmapDetail | null>(() => {
    if (!roadmap) return null;
    const firstIncomplete = steps.findIndex((s) => !s.isCompleted);
    const stepViews: RoadmapStepView[] = steps.map((s, i) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? '',
      status: s.isCompleted ? 'done' : i === firstIncomplete ? 'active' : 'pending',
    }));
    return {
      id: roadmap.id,
      crop: roadmap.cropName,
      insight: roadmap.aiGeneratedPlan ?? 'No AI insight available for this plan yet.',
      imageUrl: roadmap.imageUrl,
      steps: stepViews,
    };
  }, [roadmap, steps]);

  return { detail, loading, error };
}

/** Subscribe step counts for list progress bars */
export function useRoadmapStepCounts(roadmapIds: string[]) {
  const [counts, setCounts] = useState<Record<string, { done: number; total: number }>>({});

  useEffect(() => {
    if (roadmapIds.length === 0) return;
    const unsubs = roadmapIds.map((id) =>
      subscribeRoadmapSteps(id, (steps) => {
        const done = steps.filter((s) => s.isCompleted).length;
        setCounts((prev) => ({ ...prev, [id]: { done, total: steps.length } }));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [roadmapIds.join(',')]);

  return counts;
}
