import "../setup";

import { describe, expect, test } from "vitest";

import { launchDetailFixture } from "../fixtures/launchDetail";
import {
  createSyntheticTrajectory,
  hasValidLaunchCoordinates,
} from "../../frontend/src/utils/trajectory";

describe("trajectory generation", () => {
  test("generates deterministic trajectory output for same input", () => {
    const first = createSyntheticTrajectory(launchDetailFixture, 6, 60);
    const second = createSyntheticTrajectory(launchDetailFixture, 6, 60);

    expect(first).toEqual(second);
  });

  test("produces finite in-range coordinates and monotonic time", () => {
    const trajectory = createSyntheticTrajectory(launchDetailFixture, 7, 60);
    expect(trajectory).not.toBeNull();

    const points = trajectory!.points;
    expect(points.length).toBe(7);
    expect(points.every((point) => Number.isFinite(point.latitude))).toBe(true);
    expect(points.every((point) => Number.isFinite(point.longitude))).toBe(true);
    expect(points.every((point) => point.latitude >= -90 && point.latitude <= 90)).toBe(true);
    expect(points.every((point) => point.longitude >= -180 && point.longitude <= 180)).toBe(
      true,
    );
    expect(points.every((point, index) => index === 0 || point.time >= points[index - 1].time)).toBe(
      true,
    );
  });

  test("returns null for invalid coordinates or invalid generation params", () => {
    const invalidLaunch = {
      ...launchDetailFixture,
      padLatitude: 400,
    };

    expect(hasValidLaunchCoordinates(invalidLaunch)).toBe(false);
    expect(createSyntheticTrajectory(invalidLaunch)).toBeNull();
    expect(createSyntheticTrajectory(launchDetailFixture, 1, 60)).toBeNull();
    expect(createSyntheticTrajectory(launchDetailFixture, 5, 0)).toBeNull();
  });
});
