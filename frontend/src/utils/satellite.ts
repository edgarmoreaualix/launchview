import {
  twoline2satrec,
  propagate,
  gstime,
  eciToGeodetic,
  degreesLong,
  degreesLat,
} from "satellite.js";

import type { SatelliteSummary, SatellitePosition, GroundTrackPoint } from "../../../shared/types";

export function propagatePosition(
  sat: SatelliteSummary,
  date: Date,
): SatellitePosition | null {
  const satrec = twoline2satrec(sat.tle.line1, sat.tle.line2);
  const result = propagate(satrec, date);

  if (
    !result ||
    typeof result.position === "boolean" ||
    !result.position ||
    typeof result.velocity === "boolean" ||
    !result.velocity
  ) {
    return null;
  }

  const gmst = gstime(date);
  const position = result.position;
  const geo = eciToGeodetic(position, gmst);

  const velocity = result.velocity;
  const speed = Math.sqrt(
    velocity.x * velocity.x +
    velocity.y * velocity.y +
    velocity.z * velocity.z,
  );

  return {
    noradId: sat.noradId,
    latitude: degreesLat(geo.latitude),
    longitude: degreesLong(geo.longitude),
    altitude: geo.height,
    velocity: speed,
  };
}

export function computeGroundTrack(
  sat: SatelliteSummary,
  start: Date,
  durationMinutes: number,
  stepSeconds = 30,
): GroundTrackPoint[][] {
  const segments: GroundTrackPoint[][] = [];
  let currentSegment: GroundTrackPoint[] = [];
  let prevLon: number | null = null;

  const totalSteps = Math.floor((durationMinutes * 60) / stepSeconds);

  for (let i = 0; i <= totalSteps; i++) {
    const time = new Date(start.getTime() + i * stepSeconds * 1000);
    const pos = propagatePosition(sat, time);
    if (!pos) {
      continue;
    }

    // Split at antimeridian crossing (longitude jump > 180°)
    if (prevLon !== null && Math.abs(pos.longitude - prevLon) > 180) {
      if (currentSegment.length > 0) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    }

    currentSegment.push({
      latitude: pos.latitude,
      longitude: pos.longitude,
    });
    prevLon = pos.longitude;
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
}
