import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Cartesian3,
  Color,
  ColorBlendMode,
  Ellipsoid,
  HeadingPitchRoll,
  Matrix3,
  Quaternion,
  Transforms,
} from 'cesium';
import { Entity } from 'resium';
import type {
  LaunchSummary,
  LaunchTrajectory,
  TrajectoryPoint,
} from '../../../shared/types';
import {
  getGenericRocketModelRoute,
  resolveRocketModelRoute,
  type RocketModelRoute,
} from '../utils/rocketModelCatalog';
import { sampleTrajectoryPoint } from '../utils/trajectory';

interface LaunchPadRocketProps {
  selectedLaunch: LaunchSummary | null;
  trajectory: LaunchTrajectory | null;
  activePoint: TrajectoryPoint | null;
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

function directionFromTrajectory(
  trajectory: LaunchTrajectory | null,
  activePoint: TrajectoryPoint | null,
): Cartesian3 | null {
  if (!trajectory || !activePoint || trajectory.points.length < 2) {
    return null;
  }

  const previousPoint = sampleTrajectoryPoint(
    trajectory,
    Math.max(activePoint.time - 1, 0),
  );
  const nextPoint = sampleTrajectoryPoint(
    trajectory,
    Math.min(activePoint.time + 1, trajectory.durationSeconds),
  );

  if (!previousPoint || !nextPoint) {
    return null;
  }

  const previousPosition = Cartesian3.fromDegrees(
    previousPoint.longitude,
    previousPoint.latitude,
    previousPoint.altitude,
  );
  const nextPosition = Cartesian3.fromDegrees(
    nextPoint.longitude,
    nextPoint.latitude,
    nextPoint.altitude,
  );
  const velocity = Cartesian3.subtract(nextPosition, previousPosition, new Cartesian3());
  const speed = Cartesian3.magnitude(velocity);
  if (speed < 1e-3) {
    return null;
  }

  return Cartesian3.normalize(velocity, velocity);
}

function orientationFromDirection(position: Cartesian3, direction: Cartesian3): Quaternion {
  const surfaceNormal = Ellipsoid.WGS84.geodeticSurfaceNormal(position, new Cartesian3());
  let right = Cartesian3.cross(direction, surfaceNormal, new Cartesian3());
  if (Cartesian3.magnitude(right) < 1e-6) {
    right = Cartesian3.cross(direction, Cartesian3.UNIT_X, right);
  }
  right = Cartesian3.normalize(right, right);

  const up = Cartesian3.normalize(
    Cartesian3.cross(right, direction, new Cartesian3()),
    new Cartesian3(),
  );

  const rotation = new Matrix3(
    right.x,
    up.x,
    direction.x,
    right.y,
    up.y,
    direction.y,
    right.z,
    up.z,
    direction.z,
  );
  return Quaternion.fromRotationMatrix(rotation, new Quaternion());
}

function offsetAlongDirection(
  basePosition: Cartesian3,
  direction: Cartesian3,
  meters: number,
): Cartesian3 {
  const offset = Cartesian3.multiplyByScalar(direction, meters, new Cartesian3());
  return Cartesian3.add(basePosition, offset, new Cartesian3());
}

async function canLoadModel(route: RocketModelRoute, cache: Map<string, boolean>): Promise<boolean> {
  const cached = cache.get(route.uri);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const response = await fetch(route.uri, {
      method: 'GET',
      cache: 'force-cache',
    });

    const canLoad = response.ok;
    cache.set(route.uri, canLoad);
    return canLoad;
  } catch {
    cache.set(route.uri, false);
    return false;
  }
}

export function LaunchPadRocket({
  selectedLaunch,
  trajectory,
  activePoint,
}: LaunchPadRocketProps) {
  const modelHealthCacheRef = useRef<Map<string, boolean>>(new Map());
  const [activeRoute, setActiveRoute] = useState<RocketModelRoute | null>(null);
  const [renderMarkerOnly, setRenderMarkerOnly] = useState(false);

  const modelResolution = useMemo(
    () => (selectedLaunch ? resolveRocketModelRoute(selectedLaunch) : null),
    [selectedLaunch?.rocketFamily, selectedLaunch?.rocketName],
  );

  useEffect(() => {
    if (!selectedLaunch || !modelResolution) {
      setActiveRoute(null);
      setRenderMarkerOnly(false);
      return;
    }

    setActiveRoute(modelResolution.primary);
    setRenderMarkerOnly(false);

    let isCancelled = false;

    const validateModelRoute = async (): Promise<void> => {
      const primaryAvailable = await canLoadModel(
        modelResolution.primary,
        modelHealthCacheRef.current,
      );
      if (isCancelled || primaryAvailable) {
        return;
      }

      const fallbackAvailable =
        modelResolution.fallback.uri === modelResolution.primary.uri
          ? primaryAvailable
          : await canLoadModel(modelResolution.fallback, modelHealthCacheRef.current);

      if (isCancelled) {
        return;
      }

      if (fallbackAvailable) {
        setActiveRoute(modelResolution.fallback);
        setRenderMarkerOnly(false);
        return;
      }

      setActiveRoute(null);
      setRenderMarkerOnly(true);
    };

    void validateModelRoute();

    return () => {
      isCancelled = true;
    };
  }, [modelResolution, selectedLaunch?.id]);

  const poseRoute = activeRoute ?? modelResolution?.primary ?? getGenericRocketModelRoute();

  const rocketPose = useMemo(() => {
    if (!selectedLaunch) {
      return null;
    }

    const inFlight = Boolean(activePoint);
    const bodyLength = 48;
    const bodyRadius = 2.2;
    const noseLength = 12;
    const towerHeight = poseRoute.towerHeightMeters;
    const towerOffset = toDegreesOffset(selectedLaunch.padLatitude, 0, poseRoute.towerOffsetEastMeters);
    const rocketLongitude = activePoint?.longitude ?? selectedLaunch.padLongitude;
    const rocketLatitude = activePoint?.latitude ?? selectedLaunch.padLatitude;
    const rocketAltitude = Math.max(activePoint?.altitude ?? 0, 6) + (inFlight ? 45 : 0.8);
    const rocketPosition = Cartesian3.fromDegrees(
      rocketLongitude,
      rocketLatitude,
      rocketAltitude,
    );
    const flightDirection = directionFromTrajectory(trajectory, activePoint);
    const launchpadUp = Ellipsoid.WGS84.geodeticSurfaceNormal(rocketPosition, new Cartesian3());
    const padOrientation = orientationFromDirection(rocketPosition, launchpadUp);
    const towerPosition = Cartesian3.fromDegrees(
      selectedLaunch.padLongitude + towerOffset.longitudeDelta,
      selectedLaunch.padLatitude + towerOffset.latitudeDelta,
      towerHeight / 2,
    );
    const orientation =
      inFlight && flightDirection
        ? orientationFromDirection(rocketPosition, flightDirection)
        : padOrientation;
    const towerOrientation = Transforms.headingPitchRollQuaternion(
      towerPosition,
      new HeadingPitchRoll(0, 0, 0),
    );

    return {
      inFlight,
      orientation,
      towerOrientation,
      bodyPosition: rocketPosition,
      nosePosition: offsetAlongDirection(
        rocketPosition,
        inFlight && flightDirection ? flightDirection : launchpadUp,
        bodyLength / 2 + noseLength / 2,
      ),
      plumePosition: offsetAlongDirection(
        rocketPosition,
        inFlight && flightDirection ? flightDirection : launchpadUp,
        -(bodyLength / 2 + 8),
      ),
      rocketPosition,
      towerPosition,
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
  }, [
    activePoint,
    poseRoute.towerHeightMeters,
    poseRoute.towerOffsetEastMeters,
    selectedLaunch,
    trajectory,
  ]);

  if (!selectedLaunch || !rocketPose) {
    return null;
  }

  return (
    <>
      {!rocketPose.inFlight ? (
        <>
          <Entity
            id={`launch-pad-${selectedLaunch.id}`}
            position={rocketPose.padPosition}
            ellipsoid={{
              radii: new Cartesian3(8.5, 8.5, 0.8),
              material: Color.fromCssColorString('#37485f').withAlpha(0.9),
              outline: true,
              outlineColor: Color.fromCssColorString('#89b4dd').withAlpha(0.7),
            }}
          />
          <Entity
            id={`launch-tower-${selectedLaunch.id}`}
            position={rocketPose.towerPosition}
            orientation={rocketPose.towerOrientation}
            box={{
              dimensions: new Cartesian3(5.5, 5.5, rocketPose.towerHeight),
              material: Color.fromCssColorString('#30455c').withAlpha(0.92),
              outline: true,
              outlineColor: Color.fromCssColorString('#6b92b6').withAlpha(0.75),
            }}
          />
        </>
      ) : null}
      {renderMarkerOnly || !activeRoute ? (
        <>
          <Entity
            id={`launch-rocket-fallback-body-${selectedLaunch.id}`}
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
            id={`launch-rocket-fallback-nose-${selectedLaunch.id}`}
            position={rocketPose.nosePosition}
            orientation={rocketPose.orientation}
            cylinder={{
              length: rocketPose.noseLength,
              topRadius: 0.1,
              bottomRadius: rocketPose.bodyRadius * 0.94,
              material: Color.fromCssColorString('#ffd87a').withAlpha(0.96),
            }}
          />
          {rocketPose.inFlight ? (
            <Entity
              id={`launch-rocket-exhaust-${selectedLaunch.id}`}
              position={rocketPose.plumePosition}
              orientation={rocketPose.orientation}
              cylinder={{
                length: 16,
                topRadius: 1.6,
                bottomRadius: 0.12,
                material: Color.fromCssColorString('#8be7ff').withAlpha(0.72),
              }}
            />
          ) : null}
        </>
      ) : (
        <Entity
          id={`launch-rocket-model-${selectedLaunch.id}-${activeRoute.key}`}
          position={rocketPose.rocketPosition}
          orientation={rocketPose.orientation}
          model={{
            uri: activeRoute.uri,
            scale: activeRoute.scale,
            minimumPixelSize: activeRoute.minimumPixelSize,
            maximumScale: activeRoute.maximumScale,
            colorBlendMode: ColorBlendMode.HIGHLIGHT,
            color: Color.WHITE.withAlpha(0.98),
          }}
        />
      )}
    </>
  );
}
