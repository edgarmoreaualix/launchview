import fetch from "node-fetch";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { LL2Launch, LaunchSummary } from "../../shared/types";
import { TTLCache } from "../utils/cache";

const LL2_URL = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=20";
const DEFAULT_TTL_MS = 60_000;
const MOCK_FILE_PATH = path.resolve(process.cwd(), "data/mock-launches.json");

export type LaunchDataSource = "ll2" | "mock";
export type LaunchSourceMode = "live" | "forced-mock" | "fallback-mock";
export type LaunchCacheStatus = "hit" | "miss" | "stale";

export interface LaunchesResult {
  launches: LaunchSummary[];
  source: LaunchDataSource;
  sourceMode: LaunchSourceMode;
  cacheStatus: LaunchCacheStatus;
}

export class LaunchServiceError extends Error {
  readonly code = "LAUNCHES_UNAVAILABLE";

  constructor() {
    super("Unable to load launches");
    this.name = "LaunchServiceError";
  }
}

const launchesCache = new TTLCache<LaunchesResult>(DEFAULT_TTL_MS);

interface LL2Response {
  results: LL2Launch[];
}

const ROCKET_MODEL_KEYWORDS: Array<{ key: string; keywords: string[] }> = [
  { key: "falcon-9", keywords: ["falcon 9"] },
  { key: "falcon-heavy", keywords: ["falcon heavy"] },
  { key: "starship", keywords: ["starship", "super heavy"] },
  { key: "electron", keywords: ["electron"] },
  { key: "new-shepard", keywords: ["new shepard"] },
  { key: "new-glenn", keywords: ["new glenn"] },
  { key: "vulcan-centaur", keywords: ["vulcan"] },
  { key: "atlas-v", keywords: ["atlas v"] },
  { key: "ariane-6", keywords: ["ariane 6"] },
  { key: "ariane-5", keywords: ["ariane 5"] },
  { key: "soyuz-2", keywords: ["soyuz"] },
  { key: "long-march", keywords: ["long march", "chang zheng", "cz-"] },
  { key: "pslv", keywords: ["pslv"] },
  { key: "gslv", keywords: ["gslv", "lvm3"] },
  { key: "h3", keywords: [" h3", " h-3", " h-iiia", " h3 "] },
  { key: "vega", keywords: ["vega"] },
  { key: "antares", keywords: ["antares"] },
];

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

function normalizeRocketKey(value: string | null | undefined): string {
  if (!value) {
    return "unknown";
  }

  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "unknown";
}

function resolveRocketModelKey(name: string, family: string): string {
  const normalizedName = name.toLowerCase();
  const normalizedFamily = family.toLowerCase();
  const merged = `${normalizedName} ${normalizedFamily}`;

  for (const candidate of ROCKET_MODEL_KEYWORDS) {
    if (candidate.keywords.some((keyword) => merged.includes(keyword))) {
      return candidate.key;
    }
  }

  const fallbackFromName = normalizeRocketKey(name);
  if (fallbackFromName !== "unknown") {
    return fallbackFromName;
  }

  const fallbackFromFamily = normalizeRocketKey(family);
  if (fallbackFromFamily !== "unknown") {
    return fallbackFromFamily;
  }

  return "generic";
}

function pickWebcastUrl(vidURLs: LL2Launch["vidURLs"]): string | null {
  if (vidURLs.length === 0) {
    return null;
  }

  const sorted = [...vidURLs].sort((a, b) => a.priority - b.priority);
  return sorted[0]?.url ?? null;
}

function toLaunchSummary(launch: LL2Launch): LaunchSummary {
  const rocketFamilyKey = normalizeRocketKey(launch.rocket.configuration.family);
  const rocketModelKey = resolveRocketModelKey(
    launch.rocket.configuration.name,
    launch.rocket.configuration.family,
  );

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
    rocketFamilyKey,
    rocketModelKey,
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
      return {
        ...cached,
        cacheStatus: "hit",
      };
    }
  }

  let launches: LL2Launch[];
  let source: LaunchDataSource;
  let sourceMode: LaunchSourceMode;

  if (shouldUseMockData()) {
    try {
      launches = await readMockLaunches();
      source = "mock";
      sourceMode = "forced-mock";
    } catch {
      const stale = launchesCache.peek();
      if (stale) {
        return {
          ...stale,
          cacheStatus: "stale",
        };
      }
      throw new LaunchServiceError();
    }
  } else {
    try {
      launches = await fetchLL2Launches();
      source = "ll2";
      sourceMode = "live";
    } catch {
      try {
        launches = await readMockLaunches();
        source = "mock";
        sourceMode = "fallback-mock";
      } catch {
        const stale = launchesCache.peek();
        if (stale) {
          return {
            ...stale,
            cacheStatus: "stale",
          };
        }
        throw new LaunchServiceError();
      }
    }
  }

  const result: LaunchesResult = {
    launches: launches.map(toLaunchSummary),
    source,
    sourceMode,
    cacheStatus: "miss",
  };
  launchesCache.set(result);
  return result;
}

export function clearLaunchesCache(): void {
  launchesCache.clear();
}
