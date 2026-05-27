import { useEffect, useState } from 'react';

import { subscribeCourseGuides } from '@/services/firestore/courseGuides';
import { CourseGuide, WithId } from '@/types/firestore';

export function useCourseGuides() {
  const [guides, setGuides] = useState<WithId<CourseGuide>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeCourseGuides(
      (data) => {
        setGuides([...data].sort((a, b) => a.title.localeCompare(b.title)));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  return { guides, loading, error };
}
