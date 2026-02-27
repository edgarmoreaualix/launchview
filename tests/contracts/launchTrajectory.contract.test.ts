import "../setup";

import { describe, expect, test } from "vitest";

import type { LaunchTrajectory } from "../../shared/types";
import {
  malformedTrajectoryInvalidPoint,
  malformedTrajectoryMissingLaunchId,
  malformedTrajectoryNonMonotonicTime,
  validLaunchTrajectoryFixture,
} from "../fixtures/trajectory";

function validateLaunchTrajectoryContract(value: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["not an object"] };
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.launchId !== "string") {
    errors.push("launchId must be string");
  }

  if (typeof candidate.durationSeconds !== "number") {
    errors.push("durationSeconds must be number");
  }

  if (!Array.isArray(candidate.points)) {
    errors.push("points must be array");
    return { valid: errors.length === 0, errors };
  }

  let previousTime = Number.NEGATIVE_INFINITY;

  candidate.points.forEach((point, index) => {
    if (typeof point !== "object" || point === null) {
      errors.push(`points[${index}] must be object`);
      return;
    }

    const p = point as Record<string, unknown>;

    if (typeof p.time !== "number" || !Number.isFinite(p.time)) {
      errors.push(`points[${index}].time must be finite number`);
    }

    if (typeof p.latitude !== "number" || !Number.isFinite(p.latitude)) {
      errors.push(`points[${index}].latitude must be finite number`);
    } else if (p.latitude < -90 || p.latitude > 90) {
      errors.push(`points[${index}].latitude out of range [-90,90]`);
    }

    if (typeof p.longitude !== "number" || !Number.isFinite(p.longitude)) {
      errors.push(`points[${index}].longitude must be finite number`);
    } else if (p.longitude < -180 || p.longitude > 180) {
      errors.push(`points[${index}].longitude out of range [-180,180]`);
    }

    if (typeof p.altitude !== "number" || !Number.isFinite(p.altitude)) {
      errors.push(`points[${index}].altitude must be finite number`);
    }

    if (typeof p.time === "number" && Number.isFinite(p.time)) {
      if (p.time < previousTime) {
        errors.push(`points[${index}].time must be monotonic`);
      }
      previousTime = p.time;
    }
  });

  return { valid: errors.length === 0, errors };
}

describe("LaunchTrajectory contract", () => {
  test("accepts compliant trajectory payload with additive fields", () => {
    const compliant: LaunchTrajectory & { source?: string } = {
      ...validLaunchTrajectoryFixture,
      source: "synthetic",
    };

    const result = validateLaunchTrajectoryContract(compliant);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("fails when required top-level fields are missing", () => {
    const result = validateLaunchTrajectoryContract(malformedTrajectoryMissingLaunchId);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("launchId must be string");
  });

  test("fails malformed points and non-monotonic time", () => {
    const invalidPointResult = validateLaunchTrajectoryContract(
      malformedTrajectoryInvalidPoint,
    );
    const nonMonotonicResult = validateLaunchTrajectoryContract(
      malformedTrajectoryNonMonotonicTime,
    );

    expect(invalidPointResult.valid).toBe(false);
    expect(invalidPointResult.errors).toContain(
      "points[1].latitude out of range [-90,90]",
    );
    expect(invalidPointResult.errors).toContain(
      "points[1].longitude must be finite number",
    );

    expect(nonMonotonicResult.valid).toBe(false);
    expect(nonMonotonicResult.errors).toContain("points[2].time must be monotonic");
  });
});
