import type { LaunchSummary } from '../../../shared/types';
import { hasValidCoordinates } from './coordinates';

export interface LaunchPinStyle {
  colorCss: string;
  outlineCss: string;
  pixelSize: number;
  selectedPixelSize: number;
}

export interface LaunchPin {
  launchId: string;
  name: string;
  statusAbbrev: string;
  statusName: string;
  latitude: number;
  longitude: number;
  style: LaunchPinStyle;
}

const DEFAULT_PIN_STYLE: LaunchPinStyle = {
  colorCss: '#8da2c0',
  outlineCss: '#08111f',
  pixelSize: 12,
  selectedPixelSize: 16,
};

const STATUS_STYLE_MAP: Record<string, LaunchPinStyle> = {
  GO: {
    colorCss: '#40d88f',
    outlineCss: '#082f1f',
    pixelSize: 12,
    selectedPixelSize: 16,
  },
  HOLD: {
    colorCss: '#f5a03b',
    outlineCss: '#2f1907',
    pixelSize: 12,
    selectedPixelSize: 16,
  },
  TBC: {
    colorCss: '#57b8ff',
    outlineCss: '#0b2035',
    pixelSize: 11,
    selectedPixelSize: 15,
  },
  TBD: {
    colorCss: '#57b8ff',
    outlineCss: '#0b2035',
    pixelSize: 11,
    selectedPixelSize: 15,
  },
  FAILURE: {
    colorCss: '#ff6363',
    outlineCss: '#3a0f12',
    pixelSize: 12,
    selectedPixelSize: 16,
  },
  SUCCESS: {
    colorCss: '#c4d933',
    outlineCss: '#28330b',
    pixelSize: 11,
    selectedPixelSize: 15,
  },
};

function getPinStyle(statusAbbrev: string): LaunchPinStyle {
  const key = statusAbbrev.trim().toUpperCase();
  return STATUS_STYLE_MAP[key] ?? DEFAULT_PIN_STYLE;
}

export function toLaunchPins(launches: LaunchSummary[]): LaunchPin[] {
  return launches
    .filter((launch) => hasValidCoordinates(launch.padLatitude, launch.padLongitude))
    .map((launch) => ({
      launchId: launch.id,
      name: launch.name,
      statusAbbrev: launch.statusAbbrev,
      statusName: launch.statusName,
      latitude: launch.padLatitude,
      longitude: launch.padLongitude,
      style: getPinStyle(launch.statusAbbrev),
    }));
}
