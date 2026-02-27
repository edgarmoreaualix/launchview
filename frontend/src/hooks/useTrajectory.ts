import { useEffect, useMemo, useState } from 'react';
import type {
  LaunchSummary,
  LaunchTrajectory,
  TrajectoryPoint,
} from '../../../shared/types';
import {
  createSyntheticTrajectory,
  sampleTrajectoryPoint,
} from '../utils/trajectory';

export interface UseTrajectoryResult {
  trajectory: LaunchTrajectory | null;
  activePoint: TrajectoryPoint | null;
  elapsedSeconds: number;
  status: 'idle' | 'invalid' | 'ready';
}

const TICK_MS = 100;

export function useTrajectory(selectedLaunch: LaunchSummary | null): UseTrajectoryResult {
  const trajectory = useMemo(() => {
    if (!selectedLaunch) {
      return null;
    }

    return createSyntheticTrajectory(selectedLaunch);
  }, [selectedLaunch]);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!trajectory) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const looped = elapsed % trajectory.durationSeconds;
      setElapsedSeconds(looped);
    }, TICK_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [trajectory]);

  const activePoint = useMemo(() => {
    if (!trajectory) {
      return null;
    }

    return sampleTrajectoryPoint(trajectory, elapsedSeconds);
  }, [elapsedSeconds, trajectory]);

  if (!selectedLaunch) {
    return {
      trajectory: null,
      activePoint: null,
      elapsedSeconds: 0,
      status: 'idle',
    };
  }

  if (!trajectory) {
    return {
      trajectory: null,
      activePoint: null,
      elapsedSeconds: 0,
      status: 'invalid',
    };
  }

  return {
    trajectory,
    activePoint,
    elapsedSeconds,
    status: 'ready',
  };
}
