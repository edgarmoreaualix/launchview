import { useEffect, useRef } from 'react';
import { Ion, OpenStreetMapImageryProvider } from 'cesium';
import type { Viewer as CesiumViewer } from 'cesium';
import { type CesiumComponentRef, Viewer } from 'resium';
import type { LaunchSummary } from '../../../shared/types';
import { LaunchPins } from './LaunchPins';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const cesiumIonToken = import.meta.env.VITE_CESIUM_ION_TOKEN?.trim() ?? '';

if (cesiumIonToken) {
  Ion.defaultAccessToken = cesiumIonToken;
}

interface GlobeProps {
  launches: LaunchSummary[];
  selectedLaunchId: string | null;
  onSelectLaunch: (launchId: string) => void;
}

export function Globe({ launches, selectedLaunchId, onSelectLaunch }: GlobeProps) {
  const viewerRef = useRef<CesiumComponentRef<CesiumViewer>>(null);

  useEffect(() => {
    if (cesiumIonToken) {
      return;
    }

    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) {
      return;
    }

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(
      new OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/',
      }),
    );
  }, []);

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
        baseLayer={cesiumIonToken ? undefined : false}
      >
        <LaunchPins
          launches={launches}
          selectedLaunchId={selectedLaunchId}
          onSelectLaunch={onSelectLaunch}
        />
      </Viewer>
    </div>
  );
}
