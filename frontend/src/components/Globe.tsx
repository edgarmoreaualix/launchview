import { useEffect, useRef } from 'react';
import {
  ArcGisMapServerImageryProvider,
  BoundingSphere,
  Cartesian3,
  HeadingPitchRange,
  Ion,
  IonWorldImageryStyle,
  OpenStreetMapImageryProvider,
  createWorldImageryAsync,
} from 'cesium';
import type { Viewer as CesiumViewer } from 'cesium';
import { type CesiumComponentRef, Viewer } from 'resium';
import type {
  LaunchSummary,
  LaunchTrajectory,
  TrajectoryPoint,
} from '../../../shared/types';
import { LaunchPins } from './LaunchPins';
import { TrajectoryTrail } from './TrajectoryTrail';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const cesiumIonToken = import.meta.env.VITE_CESIUM_ION_TOKEN?.trim() ?? '';

if (cesiumIonToken) {
  Ion.defaultAccessToken = cesiumIonToken;
}

interface GlobeProps {
  launches: LaunchSummary[];
  selectedLaunchId: string | null;
  onSelectLaunch: (launchId: string) => void;
  trajectory: LaunchTrajectory | null;
  trajectoryPoint: TrajectoryPoint | null;
  trajectoryElapsedSeconds: number;
}

export function Globe({
  launches,
  selectedLaunchId,
  onSelectLaunch,
  trajectory,
  trajectoryPoint,
  trajectoryElapsedSeconds,
}: GlobeProps) {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);
  const hasInitializedViewRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const applyImageryChain = async (): Promise<void> => {
      const viewer = viewerRef.current?.cesiumElement;
      if (!viewer) {
        if (!isCancelled) {
          window.setTimeout(() => {
            void applyImageryChain();
          }, 80);
        }
        return;
      }

      viewer.imageryLayers.removeAll();

      if (cesiumIonToken) {
        try {
          const ionProvider = await createWorldImageryAsync({
            style: IonWorldImageryStyle.AERIAL,
          });
          if (!isCancelled) {
            viewer.imageryLayers.addImageryProvider(ionProvider);
            return;
          }
        } catch {
          // Continue to ArcGIS fallback if Ion imagery is unavailable.
        }
      }

      try {
        const satelliteProvider = await ArcGisMapServerImageryProvider.fromUrl(
          'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        );

        if (!isCancelled) {
          viewer.imageryLayers.addImageryProvider(satelliteProvider);
        }
        return;
      } catch {
        // Continue with OSM fallback if ArcGIS imagery is unavailable.
      }

      if (!isCancelled) {
        viewer.imageryLayers.addImageryProvider(
          new OpenStreetMapImageryProvider({
            url: 'https://tile.openstreetmap.org/',
          }),
        );
      }
    };

    void applyImageryChain();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || hasInitializedViewRef.current) {
      return;
    }

    hasInitializedViewRef.current = true;

    const launchPositions = launches
      .filter(
        (launch) =>
          Number.isFinite(launch.padLatitude) && Number.isFinite(launch.padLongitude),
      )
      .map((launch) => Cartesian3.fromDegrees(launch.padLongitude, launch.padLatitude));

    if (launchPositions.length > 1) {
      const launchCluster = BoundingSphere.fromPoints(launchPositions);
      viewer.camera.flyToBoundingSphere(launchCluster, {
        duration: 2.8,
        offset: new HeadingPitchRange(
          0,
          -1.15,
          Math.max(launchCluster.radius * 5, 7_500_000),
        ),
      });
      return;
    }

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(-20, 25, 18_000_000),
      duration: 2.8,
    });
  });

  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || !selectedLaunchId) {
      return;
    }

    const selectedLaunch =
      launches.find((launch) => launch.id === selectedLaunchId) ?? null;

    if (!selectedLaunch) {
      return;
    }

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        selectedLaunch.padLongitude,
        selectedLaunch.padLatitude,
        1_200_000,
      ),
      duration: 1.9,
    });
  }, [launches, selectedLaunchId]);

  return (
    <div className="globe-shell" role="presentation" aria-hidden="true">
      <Viewer
        ref={viewerRef}
        className="globe-viewer"
        full
        animation={false}
        timeline={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        navigationHelpButton={false}
        sceneModePicker={false}
        infoBox={false}
        selectionIndicator={false}
        baseLayer={false}
      >
        <LaunchPins
          launches={launches}
          selectedLaunchId={selectedLaunchId}
          onSelectLaunch={onSelectLaunch}
        />
        <TrajectoryTrail
          trajectory={trajectory}
          activePoint={trajectoryPoint}
          elapsedSeconds={trajectoryElapsedSeconds}
        />
      </Viewer>
    </div>
  );
}
