import { useMemo } from 'react';
import { Cartesian3, Color } from 'cesium';
import { Entity } from 'resium';
import type { SatelliteCategory, SatellitePosition, SatelliteSummary } from '../../../shared/types';

interface SatelliteMarkersProps {
  satellites: SatelliteSummary[];
  positions: Map<number, SatellitePosition>;
  selectedSatelliteId: number | null;
  onSelectSatellite: (noradId: number) => void;
}

const CATEGORY_COLORS: Record<SatelliteCategory, string> = {
  station: '#ff6bdf',
  telescope: '#c88aff',
  science: '#7eb8ff',
  'earth-observation': '#40d88f',
  navigation: '#f5a03b',
  communications: '#57b8ff',
  weather: '#ffe46b',
  reconnaissance: '#ff6363',
};

const DEFAULT_PIXEL_SIZE = 7;
const SELECTED_PIXEL_SIZE = 12;

export function SatelliteMarkers({
  satellites,
  positions,
  selectedSatelliteId,
  onSelectSatellite,
}: SatelliteMarkersProps) {
  const satelliteMap = useMemo(() => {
    const map = new Map<number, SatelliteSummary>();
    for (const sat of satellites) {
      map.set(sat.noradId, sat);
    }
    return map;
  }, [satellites]);

  if (positions.size === 0) {
    return null;
  }

  return (
    <>
      {Array.from(positions.values()).map((pos) => {
        const sat = satelliteMap.get(pos.noradId);
        if (!sat) {
          return null;
        }

        const isSelected = selectedSatelliteId === pos.noradId;
        const colorCss = CATEGORY_COLORS[sat.category] ?? '#8da2c0';

        return (
          <Entity
            key={pos.noradId}
            id={`satellite-${pos.noradId}`}
            name={sat.name}
            position={Cartesian3.fromDegrees(
              pos.longitude,
              pos.latitude,
              pos.altitude * 1000,
            )}
            point={{
              color: Color.fromCssColorString(colorCss),
              outlineColor: isSelected
                ? Color.WHITE
                : Color.fromCssColorString(colorCss).withAlpha(0.4),
              outlineWidth: isSelected ? 2.5 : 1,
              pixelSize: isSelected ? SELECTED_PIXEL_SIZE : DEFAULT_PIXEL_SIZE,
            }}
            label={
              isSelected
                ? {
                    text: sat.name,
                    font: '12px IBM Plex Sans, sans-serif',
                    fillColor: Color.WHITE,
                    outlineColor: Color.BLACK,
                    outlineWidth: 2,
                    pixelOffset: { x: 0, y: -18 } as unknown as Cartesian3,
                    style: 2, // FILL_AND_OUTLINE
                  }
                : undefined
            }
            onClick={() => {
              onSelectSatellite(pos.noradId);
            }}
          />
        );
      })}
    </>
  );
}
