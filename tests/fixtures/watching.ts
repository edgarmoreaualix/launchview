import type { WatchingCount } from "../../shared/types";

export const watchingCountFixtures: WatchingCount[] = [
  { launchId: "launch-1", count: 12 },
  { launchId: "launch-2", count: 0 },
  { launchId: "launch-3", count: 3 },
];

export const malformedWatchingCountFixtures = [
  { launchId: "launch-1", count: -1 },
  { launchId: "launch-2", count: Number.NaN },
  { launchId: 123, count: 2 },
  { count: 4 },
  { launchId: "launch-4" },
];
