import { useMemo } from 'react';
import { Cartesian3, Color } from 'cesium';
import { Entity } from 'resium';
import type { LaunchTrajectory, TrajectoryPoint } from '../../../shared/types';

interface TrajectoryTrailProps {
  trajectory: LaunchTrajectory | null;
  activePoint: TrajectoryPoint | null;
  elapsedSeconds: number;
}

function toCartesianPositions(points: TrajectoryPoint[]) {
  return points.map((point) =>
    Cartesian3.fromDegrees(point.longitude, point.latitude, point.altitude),
  );
}

export function TrajectoryTrail({
  trajectory,
  activePoint,
  elapsedSeconds,
}: TrajectoryTrailProps) {
  const fullPositions = useMemo(() => {
    if (!trajectory || trajectory.points.length < 2) {
      return null;
    }

    return toCartesianPositions(trajectory.points);
  }, [trajectory]);

  const traveledPositions = useMemo(() => {
    if (!trajectory || trajectory.points.length < 2 || !activePoint) {
      return null;
    }

    const trailPoints = trajectory.points.filter((point) => point.time <= elapsedSeconds);
    const pathPoints = [...trailPoints, activePoint];
    if (pathPoints.length < 2) {
      return null;
    }

    return toCartesianPositions(pathPoints);
  }, [activePoint, elapsedSeconds, trajectory]);

  if (!trajectory || !fullPositions) {
    return null;
  }

  return (
    <>
      <Entity
        id={`trajectory-path-${trajectory.launchId}`}
        polyline={{
          positions: fullPositions,
          width: 1.7,
          material: Color.fromCssColorString('#82d3ff').withAlpha(0.35),
        }}
      />
      {traveledPositions ? (
        <Entity
          id={`trajectory-trail-${trajectory.launchId}`}
          polyline={{
            positions: traveledPositions,
            width: 3,
            material: Color.fromCssColorString('#75e1ff'),
          }}
        />
      ) : null}
      {activePoint ? (
        <Entity
          id={`trajectory-marker-${trajectory.launchId}`}
          position={Cartesian3.fromDegrees(
            activePoint.longitude,
            activePoint.latitude,
            activePoint.altitude,
          )}
          point={{
            pixelSize: 11,
            color: Color.fromCssColorString('#ffe46b'),
            outlineWidth: 2,
            outlineColor: Color.fromCssColorString('#2d2f11'),
          }}
        />
      ) : null}
    </>
  );
}
