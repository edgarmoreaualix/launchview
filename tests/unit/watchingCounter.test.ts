import "../setup";

import { describe, expect, test } from "vitest";

import {
  malformedWatchingCountFixtures,
  watchingCountFixtures,
} from "../fixtures/watching";
import {
  clearWatchingCountsForTests,
  getWatchingCount,
  incrementWatchingCount,
  resetWatchingCount,
} from "../../backend/services/watchingService";
import { beforeEach } from "vitest";

beforeEach(async () => {
  await clearWatchingCountsForTests();
});

describe("watching counter behavior", () => {
  test("accepts only valid watching fixtures for service-driven expectations", () => {
    const validLaunchIds = watchingCountFixtures.map((entry) => entry.launchId);
    const malformedLaunchIds = malformedWatchingCountFixtures
      .map((entry) => (typeof entry.launchId === "string" ? entry.launchId : null))
      .filter((value): value is string => value !== null);

    expect(validLaunchIds).toEqual(["launch-1", "launch-2", "launch-3"]);
    expect(malformedLaunchIds).toEqual(["launch-1", "launch-2", "launch-4"]);
  });

  test("increments existing launch watching count", async () => {
    const launchId = "watching-test-existing";
    await resetWatchingCount(launchId);

    await incrementWatchingCount(launchId, 12);
    const result = await incrementWatchingCount(launchId, 1);

    expect(result).toEqual({ launchId, count: 13 });
    expect(await getWatchingCount(launchId)).toEqual({ launchId, count: 13 });

    await resetWatchingCount(launchId);
  });

  test("starts new launch watching count at 1 when missing", async () => {
    const launchId = "watching-test-new";
    await resetWatchingCount(launchId);

    const result = await incrementWatchingCount(launchId, 1);

    expect(result).toEqual({ launchId, count: 1 });
    expect(await getWatchingCount(launchId)).toEqual({ launchId, count: 1 });

    await resetWatchingCount(launchId);
  });
});
