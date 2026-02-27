import "../setup";

import { describe, expect, test } from "vitest";

import {
  malformedWatchingCountFixtures,
  watchingCountFixtures,
} from "../fixtures/watching";
import {
  getWatchingCount,
  incrementWatchingCount,
  resetWatchingCount,
} from "../../backend/services/watchingService";

describe("watching counter behavior", () => {
  test("accepts only valid watching fixtures for service-driven expectations", () => {
    const validLaunchIds = watchingCountFixtures.map((entry) => entry.launchId);
    const malformedLaunchIds = malformedWatchingCountFixtures
      .map((entry) => (typeof entry.launchId === "string" ? entry.launchId : null))
      .filter((value): value is string => value !== null);

    expect(validLaunchIds).toEqual(["launch-1", "launch-2", "launch-3"]);
    expect(malformedLaunchIds).toEqual(["launch-1", "launch-2", "launch-4"]);
  });

  test("increments existing launch watching count", () => {
    const launchId = "watching-test-existing";
    resetWatchingCount(launchId);

    incrementWatchingCount(launchId, 12);
    const result = incrementWatchingCount(launchId, 1);

    expect(result).toEqual({ launchId, count: 13 });
    expect(getWatchingCount(launchId)).toEqual({ launchId, count: 13 });

    resetWatchingCount(launchId);
  });

  test("starts new launch watching count at 1 when missing", () => {
    const launchId = "watching-test-new";
    resetWatchingCount(launchId);

    const result = incrementWatchingCount(launchId, 1);

    expect(result).toEqual({ launchId, count: 1 });
    expect(getWatchingCount(launchId)).toEqual({ launchId, count: 1 });

    resetWatchingCount(launchId);
  });
});
