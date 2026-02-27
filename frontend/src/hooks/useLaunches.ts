import { useEffect, useState } from 'react';
import type { LaunchSummary } from '../../../shared/types';
import { fetchLaunches } from '../services/launchApi';

export interface UseLaunchesState {
  data: LaunchSummary[];
  isLoading: boolean;
  error: string | null;
}

export function useLaunches(): UseLaunchesState {
  const [data, setData] = useState<LaunchSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLaunches = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const launches = await fetchLaunches();

        if (!isMounted) {
          return;
        }

        setData(launches);
      } catch (caughtError: unknown) {
        if (!isMounted) {
          return;
        }

        const message =
          caughtError instanceof Error ? caughtError.message : 'Failed to load launches';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadLaunches();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading, error };
}
