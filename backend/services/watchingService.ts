import type { WatchingCount } from "../../shared/types";

const countsByLaunchId = new Map<string, number>();

function toWatchingCount(launchId: string): WatchingCount {
  return {
    launchId,
    count: countsByLaunchId.get(launchId) ?? 0,
  };
}

export function getWatchingCount(launchId: string): WatchingCount {
  return toWatchingCount(launchId);
}

export function listWatchingCounts(): WatchingCount[] {
  return Array.from(countsByLaunchId.entries())
    .map(([launchId, count]) => ({ launchId, count }))
    .sort((a, b) => a.launchId.localeCompare(b.launchId));
}

export function incrementWatchingCount(launchId: string, delta = 1): WatchingCount {
  const current = countsByLaunchId.get(launchId) ?? 0;
  const next = Math.max(0, current + delta);
  countsByLaunchId.set(launchId, next);
  return toWatchingCount(launchId);
}

export function resetWatchingCount(launchId: string): WatchingCount {
  countsByLaunchId.set(launchId, 0);
  return toWatchingCount(launchId);
}
