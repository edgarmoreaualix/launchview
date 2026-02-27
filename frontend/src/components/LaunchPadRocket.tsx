import { useMemo } from 'react';
import {
  Cartesian3,
  Color,
  HeadingPitchRoll,
  Quaternion,
} from 'cesium';
import { Entity } from 'resium';
import type { LaunchSummary, LaunchTrajectory } from '../../../shared/types';

interface LaunchPadRocketProps {
  selectedLaunch: LaunchSummary | null;
  trajectory: LaunchTrajectory | null;
}

const METERS_PER_LAT_DEGREE = 111_320;

function toDegreesOffset(latitude: number, northMeters: number, eastMeters: number) {
  const latitudeRadians = (latitude * Math.PI) / 180;
  const longitudeScale = Math.max(Math.cos(latitudeRadians), 0.15);

  return {
    latitudeDelta: northMeters / METERS_PER_LAT_DEGREE,
    longitudeDelta: eastMeters / (METERS_PER_LAT_DEGREE * longitudeScale),
  };
}

function headingFromTrajectory(trajectory: LaunchTrajectory | null): number {
  if (!trajectory || trajectory.points.length < 2) {
    return 0;
  }

  const from = trajectory.points[0];
  const to = trajectory.points[1];
  const latitudeMean = (((from.latitude + to.latitude) / 2) * Math.PI) / 180;
  const deltaLongitude = (to.longitude - from.longitude) * Math.cos(latitudeMean);
  const deltaLatitude = to.latitude - from.latitude;

  if (Math.abs(deltaLongitude) < 1e-6 && Math.abs(deltaLatitude) < 1e-6) {
    return 0;
  }

  return Math.atan2(deltaLongitude, deltaLatitude);
}

export function LaunchPadRocket({ selectedLaunch, trajectory }: LaunchPadRocketProps) {
  const rocketPose = useMemo(() => {
    if (!selectedLaunch) {
      return null;
    }

    const heading = headingFromTrajectory(trajectory);
    const orientation = Quaternion.fromHeadingPitchRoll(new HeadingPitchRoll(heading, 0, 0));

    const bodyLength = 48;
    const bodyRadius = 2.2;
    const noseLength = 12;
    const towerHeight = 52;
    const towerOffset = toDegreesOffset(selectedLaunch.padLatitude, 0, 16);

    return {
      orientation,
      bodyPosition: Cartesian3.fromDegrees(
        selectedLaunch.padLongitude,
        selectedLaunch.padLatitude,
        bodyLength / 2,
      ),
      nosePosition: Cartesian3.fromDegrees(
        selectedLaunch.padLongitude,
        selectedLaunch.padLatitude,
        bodyLength + noseLength / 2,
      ),
      towerPosition: Cartesian3.fromDegrees(
        selectedLaunch.padLongitude + towerOffset.longitudeDelta,
        selectedLaunch.padLatitude + towerOffset.latitudeDelta,
        towerHeight / 2,
      ),
      padPosition: Cartesian3.fromDegrees(
        selectedLaunch.padLongitude,
        selectedLaunch.padLatitude,
        0.8,
      ),
      bodyLength,
      bodyRadius,
      noseLength,
      towerHeight,
    };
  }, [selectedLaunch, trajectory]);

  if (!selectedLaunch || !rocketPose) {
    return null;
  }

  return (
    <>
      <Entity
        id={`launch-pad-${selectedLaunch.id}`}
        position={rocketPose.padPosition}
        orientation={rocketPose.orientation}
        ellipsoid={{
          radii: new Cartesian3(8.5, 8.5, 0.8),
          material: Color.fromCssColorString('#37485f').withAlpha(0.9),
          outline: true,
          outlineColor: Color.fromCssColorString('#89b4dd').withAlpha(0.7),
        }}
      />
      <Entity
        id={`launch-rocket-body-${selectedLaunch.id}`}
        position={rocketPose.bodyPosition}
        orientation={rocketPose.orientation}
        cylinder={{
          length: rocketPose.bodyLength,
          topRadius: rocketPose.bodyRadius,
          bottomRadius: rocketPose.bodyRadius * 1.05,
          material: Color.fromCssColorString('#f3f7ff').withAlpha(0.97),
        }}
      />
      <Entity
        id={`launch-rocket-nose-${selectedLaunch.id}`}
        position={rocketPose.nosePosition}
        orientation={rocketPose.orientation}
        cylinder={{
          length: rocketPose.noseLength,
          topRadius: 0.1,
          bottomRadius: rocketPose.bodyRadius * 0.94,
          material: Color.fromCssColorString('#ffd87a').withAlpha(0.96),
        }}
      />
      <Entity
        id={`launch-tower-${selectedLaunch.id}`}
        position={rocketPose.towerPosition}
        orientation={rocketPose.orientation}
        box={{
          dimensions: new Cartesian3(5.5, 5.5, rocketPose.towerHeight),
          material: Color.fromCssColorString('#30455c').withAlpha(0.92),
          outline: true,
          outlineColor: Color.fromCssColorString('#6b92b6').withAlpha(0.75),
        }}
      />
    </>
  );
}
