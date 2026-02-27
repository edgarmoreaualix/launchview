import { useMemo } from 'react';
import { Cartesian3, Color } from 'cesium';
import { Entity } from 'resium';
import type { LaunchSummary } from '../../../shared/types';
import { toLaunchPins } from '../utils/launchPins';

interface LaunchPinsProps {
  launches: LaunchSummary[];
  selectedLaunchId: string | null;
  onSelectLaunch: (launchId: string) => void;
}

export function LaunchPins({
  launches,
  selectedLaunchId,
  onSelectLaunch,
}: LaunchPinsProps) {
  const pins = useMemo(() => toLaunchPins(launches), [launches]);

  if (pins.length === 0) {
    return null;
  }

  return (
    <>
      {pins.map((pin) => {
        const isSelected = selectedLaunchId === pin.launchId;

        return (
          <Entity
            key={pin.launchId}
            id={`launch-pin-${pin.launchId}`}
            name={pin.name}
            position={Cartesian3.fromDegrees(pin.longitude, pin.latitude)}
            selected={isSelected}
            point={{
              color: Color.fromCssColorString(pin.style.colorCss),
              outlineColor: Color.fromCssColorString(pin.style.outlineCss),
              outlineWidth: 2,
              pixelSize: isSelected ? pin.style.selectedPixelSize : pin.style.pixelSize,
            }}
            onClick={() => {
              onSelectLaunch(pin.launchId);
            }}
          />
        );
      })}
    </>
  );
}
