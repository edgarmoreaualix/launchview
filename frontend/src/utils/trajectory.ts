import type {
  LaunchSummary,
  LaunchTrajectory,
  TrajectoryPoint,
} from '../../../shared/types';
import {
  hasValidCoordinates,
  MAX_LATITUDE,
  MAX_LONGITUDE,
  MIN_LATITUDE,
  MIN_LONGITUDE,
} from './coordinates';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function hasValidLaunchCoordinates(launch: LaunchSummary): boolean {
  return hasValidCoordinates(launch.padLatitude, launch.padLongitude);
}

export function createSyntheticTrajectory(
  launch: LaunchSummary,
  pointCount = 120,
  durationSeconds = 600,
): LaunchTrajectory | null {
  if (!hasValidLaunchCoordinates(launch) || pointCount < 2 || durationSeconds <= 0) {
    return null;
  }

  const latitudeDrift = launch.padLatitude >= 0 ? 2.6 : -2.6;
  const longitudeDrift = launch.padLongitude >= 0 ? 4.4 : -4.4;

  const points: TrajectoryPoint[] = Array.from({ length: pointCount }, (_, index) => {
    const progress = index / (pointCount - 1);
    const wave = Math.sin(progress * Math.PI * 2) * 0.22;
    const altitude = Math.max(0, Math.sin(progress * Math.PI) * 220000 + progress * 90000);

    return {
      time: progress * durationSeconds,
      latitude: clamp(
        launch.padLatitude + latitudeDrift * progress + wave,
        MIN_LATITUDE,
        MAX_LATITUDE,
      ),
      longitude: clamp(
        launch.padLongitude + longitudeDrift * progress,
        MIN_LONGITUDE,
        MAX_LONGITUDE,
      ),
      altitude,
    };
  });

  return {
    launchId: launch.id,
    points,
    durationSeconds,
  };
}

export function sampleTrajectoryPoint(
  trajectory: LaunchTrajectory,
  elapsedSeconds: number,
): TrajectoryPoint | null {
  if (!trajectory.points.length || !Number.isFinite(elapsedSeconds)) {
    return null;
  }

  if (elapsedSeconds <= trajectory.points[0].time) {
    return trajectory.points[0];
  }

  const lastPoint = trajectory.points[trajectory.points.length - 1];
  if (elapsedSeconds >= lastPoint.time) {
    return lastPoint;
  }

  for (let index = 1; index < trajectory.points.length; index += 1) {
    const previousPoint = trajectory.points[index - 1];
    const nextPoint = trajectory.points[index];

    if (elapsedSeconds <= nextPoint.time) {
      const segmentDuration = nextPoint.time - previousPoint.time;
      const segmentProgress =
        segmentDuration === 0 ? 0 : (elapsedSeconds - previousPoint.time) / segmentDuration;

      return {
        time: elapsedSeconds,
        latitude:
          previousPoint.latitude +
          (nextPoint.latitude - previousPoint.latitude) * segmentProgress,
        longitude:
          previousPoint.longitude +
          (nextPoint.longitude - previousPoint.longitude) * segmentProgress,
        altitude:
          previousPoint.altitude +
          (nextPoint.altitude - previousPoint.altitude) * segmentProgress,
      };
    }
  }

  return lastPoint;
}
