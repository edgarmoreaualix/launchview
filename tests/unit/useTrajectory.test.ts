import "../setup";

import { describe, expect, test } from "vitest";
import { sampleTrajectoryPoint } from "../../frontend/src/utils/trajectory";
import { validLaunchTrajectoryFixture } from "../fixtures/trajectory";

describe("trajectory animation progression", () => {
  test("returns first point when elapsed time is before start", () => {
    const point = sampleTrajectoryPoint(validLaunchTrajectoryFixture, -1);
    expect(point).toEqual(validLaunchTrajectoryFixture.points[0]);
  });

  test("returns final point when elapsed time exceeds trajectory duration", () => {
    const point = sampleTrajectoryPoint(validLaunchTrajectoryFixture, 999);
    expect(point).toEqual(
      validLaunchTrajectoryFixture.points[validLaunchTrajectoryFixture.points.length - 1],
    );
  });

  test("interpolates a point between neighboring trajectory samples", () => {
    const point = sampleTrajectoryPoint(validLaunchTrajectoryFixture, 15);
    expect(point).not.toBeNull();
    expect(point!.time).toBe(15);
    expect(point!.latitude).toBeGreaterThan(validLaunchTrajectoryFixture.points[1].latitude);
    expect(point!.latitude).toBeLessThan(validLaunchTrajectoryFixture.points[2].latitude);
    expect(point!.longitude).toBeGreaterThan(validLaunchTrajectoryFixture.points[1].longitude);
    expect(point!.longitude).toBeLessThan(validLaunchTrajectoryFixture.points[2].longitude);
  });

  test("returns null when elapsed time is non-finite", () => {
    const point = sampleTrajectoryPoint(validLaunchTrajectoryFixture, Number.NaN);
    expect(point).toBeNull();
  });

  test("returns null for empty trajectory points", () => {
    const point = sampleTrajectoryPoint(
      { ...validLaunchTrajectoryFixture, points: [] },
      1,
    );
    expect(point).toBeNull();
  });
});
