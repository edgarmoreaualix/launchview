import { useMemo } from 'react';
import { Cartesian3, Color, ClassificationType } from 'cesium';
import { Entity } from 'resium';
import type { GroundTrackPoint } from '../../../shared/types';

interface SatelliteGroundTrackProps {
  segments: GroundTrackPoint[][];
  noradId: number;
}

export function SatelliteGroundTrack({
  segments,
  noradId,
}: SatelliteGroundTrackProps) {
  const segmentPositions = useMemo(() => {
    return segments.map((seg) =>
      seg.map((pt) => Cartesian3.fromDegrees(pt.longitude, pt.latitude)),
    );
  }, [segments]);

  if (segmentPositions.length === 0) {
    return null;
  }

  return (
    <>
      {segmentPositions.map((positions, index) => (
        <Entity
          key={`ground-track-${noradId}-${index}`}
          id={`ground-track-${noradId}-${index}`}
          polyline={{
            positions,
            width: 1.5,
            material: Color.fromCssColorString('#c88aff').withAlpha(0.45),
            clampToGround: true,
            classificationType: ClassificationType.BOTH,
          }}
        />
      ))}
    </>
  );
}
