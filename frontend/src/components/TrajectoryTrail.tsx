import { useEffect, useMemo, useRef } from 'react';
import { CallbackPositionProperty, CallbackProperty, Cartesian3, Color } from 'cesium';
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
  const activePointRef = useRef<TrajectoryPoint | null>(activePoint);
  const elapsedSecondsRef = useRef(elapsedSeconds);

  useEffect(() => {
    activePointRef.current = activePoint;
    elapsedSecondsRef.current = elapsedSeconds;
  }, [activePoint, elapsedSeconds]);

  const fullPositions = useMemo(() => {
    if (!trajectory || trajectory.points.length < 2) {
      return null;
    }

    return toCartesianPositions(trajectory.points);
  }, [trajectory]);

  const traveledPositions = useMemo(() => {
    if (!trajectory || !fullPositions) {
      return null;
    }

    return new CallbackProperty(() => {
      const elapsed = elapsedSecondsRef.current;
      const marker = activePointRef.current;
      const basePoint = trajectory.points[0];
      const activeMarker = marker ?? basePoint;
      const positions: Cartesian3[] = [
        fullPositions[0],
        Cartesian3.fromDegrees(
          activeMarker.longitude,
          activeMarker.latitude,
          activeMarker.altitude,
        ),
      ];

      for (let index = 1; index < trajectory.points.length; index += 1) {
        const point = trajectory.points[index];
        if (point.time > elapsed) {
          break;
        }
        positions.splice(positions.length - 1, 0, fullPositions[index]);
      }

      return positions;
    }, false);
  }, [fullPositions, trajectory]);

  const markerPosition = useMemo(() => {
    if (!trajectory) {
      return null;
    }

    return new CallbackPositionProperty(() => {
      const marker = activePointRef.current ?? trajectory.points[0];
      return Cartesian3.fromDegrees(marker.longitude, marker.latitude, marker.altitude);
    }, false);
  }, [trajectory]);

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
      {markerPosition ? (
        <Entity
          id={`trajectory-marker-${trajectory.launchId}`}
          position={markerPosition}
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
