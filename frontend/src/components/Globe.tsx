import { useEffect, useRef } from 'react';
import { Ion, OpenStreetMapImageryProvider } from 'cesium';
import type { Viewer as CesiumViewer } from 'cesium';
import { type CesiumComponentRef, Viewer } from 'resium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const cesiumIonToken = import.meta.env.VITE_CESIUM_ION_TOKEN?.trim() ?? '';

if (cesiumIonToken) {
  Ion.defaultAccessToken = cesiumIonToken;
}

export function Globe() {
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
      />
    </div>
  );
}
