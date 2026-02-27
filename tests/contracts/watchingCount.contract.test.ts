import "../setup";

import { describe, expect, test } from "vitest";

import type { WatchingCount } from "../../shared/types";
import { watchingCountFixtures } from "../fixtures/watching";

function validateWatchingCountContract(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["not an object"] };
  }

  const candidate = value as Record<string, unknown>;

  if (!("launchId" in candidate)) {
    errors.push("missing required key: launchId");
  }

  if (!("count" in candidate)) {
    errors.push("missing required key: count");
  }

  if (typeof candidate.launchId !== "string") {
    errors.push("launchId must be string");
  }

  if (typeof candidate.count !== "number") {
    errors.push("count must be number");
  } else {
    if (!Number.isFinite(candidate.count)) {
      errors.push("count must be finite number");
    }
    if (!Number.isInteger(candidate.count)) {
      errors.push("count must be integer");
    }
    if (candidate.count < 0) {
      errors.push("count must be >= 0");
    }
  }

  return { valid: errors.length === 0, errors };
}

describe("WatchingCount contract", () => {
  test("accepts valid payload and tolerates additive fields", () => {
    const compliant: WatchingCount & { source: string } = {
      ...watchingCountFixtures[0],
      source: "memory-store",
    };

    const result = validateWatchingCountContract(compliant);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("fails when required fields are missing", () => {
    const invalid = {
      count: 3,
    };

    const result = validateWatchingCountContract(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("missing required key: launchId");
    expect(result.errors).toContain("launchId must be string");
  });

  test("fails when count is malformed", () => {
    const invalid = {
      launchId: "launch-1",
      count: -2.5,
    };

    const result = validateWatchingCountContract(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("count must be integer");
    expect(result.errors).toContain("count must be >= 0");
  });
});
