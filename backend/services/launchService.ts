import fetch from "node-fetch";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { LL2Launch, LaunchSummary } from "../../shared/types";
import { TTLCache } from "../utils/cache";

const LL2_URL = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=20";
const DEFAULT_TTL_MS = 60_000;

const launchesCache = new TTLCache<LaunchSummary[]>(DEFAULT_TTL_MS);

interface LL2Response {
  results: LL2Launch[];
}

function shouldUseMockData(): boolean {
  return (
    process.env.USE_MOCK_LAUNCHES === "true" ||
    process.env.NODE_ENV !== "production" ||
    process.env.CONTEXT === "dev" ||
    process.env.NETLIFY_DEV === "true"
  );
}

function parseCoordinate(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickWebcastUrl(vidURLs: LL2Launch["vidURLs"]): string | null {
  if (vidURLs.length === 0) {
    return null;
  }

  const sorted = [...vidURLs].sort((a, b) => a.priority - b.priority);
  return sorted[0]?.url ?? null;
}

function toLaunchSummary(launch: LL2Launch): LaunchSummary {
  return {
    id: launch.id,
    name: launch.name,
    net: launch.net,
    statusAbbrev: launch.status.abbrev,
    statusName: launch.status.name,
    rocketName: launch.rocket.configuration.name,
    rocketFamily: launch.rocket.configuration.family,
    rocketImageUrl: launch.rocket.configuration.image_url,
    padName: launch.pad.name,
    padLatitude: parseCoordinate(launch.pad.latitude),
    padLongitude: parseCoordinate(launch.pad.longitude),
    locationName: launch.pad.location.name,
    countryCode: launch.pad.location.country_code,
    missionName: launch.mission?.name ?? null,
    missionDescription: launch.mission?.description ?? null,
    orbitName: launch.mission?.orbit?.name ?? null,
    orbitAbbrev: launch.mission?.orbit?.abbrev ?? null,
    webcastUrl: pickWebcastUrl(launch.vidURLs),
    webcastLive: launch.webcast_live,
    imageUrl: launch.image,
  };
}

async function readMockLaunches(): Promise<LL2Launch[]> {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const mockFilePath = path.resolve(currentDir, "../../data/mock-launches.json");
  const raw = await readFile(mockFilePath, "utf8");
  const parsed = JSON.parse(raw) as LL2Response;
  return parsed.results;
}

async function fetchLL2Launches(): Promise<LL2Launch[]> {
  const response = await fetch(LL2_URL);

  if (!response.ok) {
    throw new Error(`LL2 request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as LL2Response;
  return payload.results;
}

export async function getLaunches(forceRefresh = false): Promise<LaunchSummary[]> {
  if (!forceRefresh) {
    const cached = launchesCache.get();
    if (cached) {
      return cached;
    }
  }

  let launches: LL2Launch[];

  if (shouldUseMockData()) {
    launches = await readMockLaunches();
  } else {
    try {
      launches = await fetchLL2Launches();
    } catch {
      launches = await readMockLaunches();
    }
  }

  const summaries = launches.map(toLaunchSummary);
  launchesCache.set(summaries);
  return summaries;
}

export function clearLaunchesCache(): void {
  launchesCache.clear();
}
