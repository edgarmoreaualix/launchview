import "../setup";

import { describe, expect, test } from "vitest";

import type { WatchingCount } from "../../shared/types";
import {
  malformedWatchingCountFixtures,
  watchingCountFixtures,
} from "../fixtures/watching";

function isValidWatchingCount(value: unknown): value is WatchingCount {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.launchId === "string" &&
    typeof candidate.count === "number" &&
    Number.isFinite(candidate.count) &&
    Number.isInteger(candidate.count) &&
    candidate.count >= 0
  );
}

function sanitizeWatchingPayload(payload: unknown[]): WatchingCount[] {
  return payload.filter(isValidWatchingCount);
}

function incrementWatchingCount(current: WatchingCount[], launchId: string): WatchingCount[] {
  const existing = current.find((item) => item.launchId === launchId);

  if (!existing) {
    return [...current, { launchId, count: 1 }];
  }

  return current.map((item) =>
    item.launchId === launchId ? { ...item, count: item.count + 1 } : item,
  );
}

describe("watching counter behavior", () => {
  test("sanitizes malformed watching payload entries", () => {
    const payload = [...watchingCountFixtures, ...malformedWatchingCountFixtures];

    const sanitized = sanitizeWatchingPayload(payload);

    expect(sanitized).toEqual(watchingCountFixtures);
  });

  test("increments existing launch watching count", () => {
    const result = incrementWatchingCount(watchingCountFixtures, "launch-1");

    expect(result).toEqual([
      { launchId: "launch-1", count: 13 },
      { launchId: "launch-2", count: 0 },
      { launchId: "launch-3", count: 3 },
    ]);
  });

  test("starts new launch watching count at 1 when missing", () => {
    const result = incrementWatchingCount(watchingCountFixtures, "launch-99");

    expect(result).toContainEqual({ launchId: "launch-99", count: 1 });
    expect(result).toHaveLength(4);
  });
});
