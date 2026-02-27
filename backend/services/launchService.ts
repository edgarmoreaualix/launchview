import fetch from "node-fetch";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { LL2Launch, LaunchSummary } from "../../shared/types";
import { TTLCache } from "../utils/cache";

const LL2_URL = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=20";
const DEFAULT_TTL_MS = 60_000;
const MOCK_FILE_PATH = path.resolve(process.cwd(), "data/mock-launches.json");

export type LaunchDataSource = "ll2" | "mock";

export interface LaunchesResult {
  launches: LaunchSummary[];
  source: LaunchDataSource;
}

const launchesCache = new TTLCache<LaunchesResult>(DEFAULT_TTL_MS);

interface LL2Response {
  results: LL2Launch[];
}

function parseLL2Response(payload: unknown): LL2Response {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("results" in payload) ||
    !Array.isArray((payload as { results: unknown }).results)
  ) {
    throw new Error("Invalid LL2 payload: expected results array");
  }

  return payload as LL2Response;
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
  const raw = await readFile(MOCK_FILE_PATH, "utf8");
  const parsed = parseLL2Response(JSON.parse(raw));
  return parsed.results;
}

async function fetchLL2Launches(): Promise<LL2Launch[]> {
  const response = await fetch(LL2_URL);

  if (!response.ok) {
    throw new Error(`LL2 request failed with status ${response.status}`);
  }

  const payload = parseLL2Response(await response.json());
  return payload.results;
}

export async function getLaunches(forceRefresh = false): Promise<LaunchesResult> {
  if (!forceRefresh) {
    const cached = launchesCache.get();
    if (cached) {
      return cached;
    }
  }

  let launches: LL2Launch[];
  let source: LaunchDataSource;

  if (shouldUseMockData()) {
    launches = await readMockLaunches();
    source = "mock";
  } else {
    try {
      launches = await fetchLL2Launches();
      source = "ll2";
    } catch {
      launches = await readMockLaunches();
      source = "mock";
    }
  }

  const result: LaunchesResult = {
    launches: launches.map(toLaunchSummary),
    source,
  };
  launchesCache.set(result);
  return result;
}

export function clearLaunchesCache(): void {
  launchesCache.clear();
}
