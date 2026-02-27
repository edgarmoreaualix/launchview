import "../setup";

import { describe, expect, test } from "vitest";

import type { LaunchTrajectory, TrajectoryPoint } from "../../shared/types";

interface GenerateInput {
  launchId: string;
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  durationSeconds: number;
  pointCount: number;
}

function generateTrajectory(input: GenerateInput): LaunchTrajectory {
  if (input.pointCount < 2) {
    throw new Error("pointCount must be >= 2");
  }

  const points: TrajectoryPoint[] = [];
  const timeStep = input.durationSeconds / (input.pointCount - 1);

  for (let i = 0; i < input.pointCount; i += 1) {
    const t = i / (input.pointCount - 1);
    points.push({
      time: Math.round(i * timeStep),
      latitude: input.startLat + (input.endLat - input.startLat) * t,
      longitude: input.startLon + (input.endLon - input.startLon) * t,
      altitude: Math.round(12_000 * t * t),
    });
  }

  return {
    launchId: input.launchId,
    durationSeconds: input.durationSeconds,
    points,
  };
}

function trajectoryHasValidCoordinates(trajectory: LaunchTrajectory): boolean {
  return trajectory.points.every(
    (point) =>
      Number.isFinite(point.latitude) &&
      Number.isFinite(point.longitude) &&
      point.latitude >= -90 &&
      point.latitude <= 90 &&
      point.longitude >= -180 &&
      point.longitude <= 180,
  );
}

function isMonotonicByTime(trajectory: LaunchTrajectory): boolean {
  for (let i = 1; i < trajectory.points.length; i += 1) {
    if (trajectory.points[i].time < trajectory.points[i - 1].time) {
      return false;
    }
  }

  return true;
}

describe("trajectory generation", () => {
  test("generates deterministic trajectory output for same input", () => {
    const input: GenerateInput = {
      launchId: "launch-1",
      startLat: 28.56,
      startLon: -80.57,
      endLat: 30.12,
      endLon: -78.93,
      durationSeconds: 40,
      pointCount: 5,
    };

    const first = generateTrajectory(input);
    const second = generateTrajectory(input);

    expect(first).toEqual(second);
  });

  test("produces finite in-range coordinates and monotonic time", () => {
    const trajectory = generateTrajectory({
      launchId: "launch-2",
      startLat: 28.56,
      startLon: -80.57,
      endLat: 29.2,
      endLon: -79.1,
      durationSeconds: 60,
      pointCount: 7,
    });

    expect(trajectoryHasValidCoordinates(trajectory)).toBe(true);
    expect(isMonotonicByTime(trajectory)).toBe(true);
  });

  test("rejects invalid point count below 2", () => {
    expect(() =>
      generateTrajectory({
        launchId: "launch-3",
        startLat: 28.56,
        startLon: -80.57,
        endLat: 29,
        endLon: -79,
        durationSeconds: 20,
        pointCount: 1,
      }),
    ).toThrow("pointCount must be >= 2");
  });
});
