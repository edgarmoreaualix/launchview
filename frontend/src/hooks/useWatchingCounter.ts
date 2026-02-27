import { useCallback, useEffect, useState } from 'react';
import {
  fetchWatchingCount,
  incrementWatchingCount,
} from '../services/watchingApi';

export interface WatchingCounterState {
  count: number | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  joinWatching: () => Promise<void>;
}

export function useWatchingCounter(launchId: string | null): WatchingCounterState {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!launchId) {
      setCount(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    void fetchWatchingCount(launchId)
      .then((watching) => {
        if (!isMounted) {
          return;
        }

        setCount(watching.count);
      })
      .catch((caughtError: unknown) => {
        if (!isMounted) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Unable to load watching count';
        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [launchId]);

  const joinWatching = useCallback(async () => {
    if (!launchId || isUpdating) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updated = await incrementWatchingCount(launchId, 1);
      setCount(updated.count);
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Unable to update watching count';
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, launchId]);

  return {
    count,
    isLoading,
    isUpdating,
    error,
    joinWatching,
  };
}
