import type { WatchingCount } from "../../shared/types";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const countsByLaunchId = new Map<string, number>();
const STORE_PATH =
  process.env.WATCHING_STORE_PATH ?? "/tmp/launchview-watching-counts.json";
let hasLoadedFromStore = false;
let mutationQueue: Promise<void> = Promise.resolve();

function toWatchingCount(launchId: string): WatchingCount {
  return {
    launchId,
    count: countsByLaunchId.get(launchId) ?? 0,
  };
}

function normalizeCount(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value < 0
  ) {
    return null;
  }

  return value;
}

async function loadStore(): Promise<void> {
  if (hasLoadedFromStore) {
    return;
  }

  hasLoadedFromStore = true;

  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== "object" || parsed === null) {
      return;
    }

    for (const [launchId, value] of Object.entries(parsed)) {
      const normalized = normalizeCount(value);
      if (normalized === null) {
        continue;
      }

      countsByLaunchId.set(launchId, normalized);
    }
  } catch (error) {
    const maybeCode = (error as { code?: string }).code;
    if (maybeCode === "ENOENT") {
      return;
    }

    throw error;
  }
}

async function persistStore(): Promise<void> {
  const parentDir = path.dirname(STORE_PATH);
  const tempPath = `${STORE_PATH}.tmp`;
  await mkdir(parentDir, { recursive: true });

  const payload = Object.fromEntries(countsByLaunchId.entries());
  await writeFile(tempPath, JSON.stringify(payload), "utf8");
  await rename(tempPath, STORE_PATH);
}

async function runMutation<T>(fn: () => Promise<T>): Promise<T> {
  const next = mutationQueue.then(fn, fn);
  mutationQueue = next.then(
    () => undefined,
    () => undefined,
  );

  return next;
}

export async function getWatchingCount(launchId: string): Promise<WatchingCount> {
  await loadStore();
  return toWatchingCount(launchId);
}

export async function listWatchingCounts(): Promise<WatchingCount[]> {
  await loadStore();
  return Array.from(countsByLaunchId.entries())
    .map(([launchId, count]) => ({ launchId, count }))
    .sort((a, b) => a.launchId.localeCompare(b.launchId));
}

export async function incrementWatchingCount(
  launchId: string,
  delta = 1,
): Promise<WatchingCount> {
  return runMutation(async () => {
    await loadStore();

    const current = countsByLaunchId.get(launchId) ?? 0;
    const next = Math.max(0, current + delta);
    countsByLaunchId.set(launchId, next);
    await persistStore();

    return toWatchingCount(launchId);
  });
}

export async function resetWatchingCount(launchId: string): Promise<WatchingCount> {
  return runMutation(async () => {
    await loadStore();

    countsByLaunchId.set(launchId, 0);
    await persistStore();
    return toWatchingCount(launchId);
  });
}

export async function clearWatchingCountsForTests(): Promise<void> {
  await runMutation(async () => {
    countsByLaunchId.clear();
    await persistStore();
  });
}
