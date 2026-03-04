import type {
  SatelliteCategory,
  SatelliteSummary,
  SatelliteTLE,
} from "../../shared/types";
import { TTLCache } from "../utils/cache";

const CELESTRAK_BASE =
  "https://celestrak.org/NORAD/elements/gp.php";
const DEFAULT_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

interface CatalogEntry {
  noradId: number;
  name: string;
  category: SatelliteCategory;
  country: string;
}

const SATELLITE_CATALOG: CatalogEntry[] = [
  { noradId: 25544, name: "ISS", category: "station", country: "Intl" },
  { noradId: 48274, name: "Tiangong", category: "station", country: "CN" },
  { noradId: 20580, name: "Hubble", category: "telescope", country: "US" },
  { noradId: 43435, name: "TESS", category: "science", country: "US" },
  { noradId: 27424, name: "Aqua", category: "earth-observation", country: "US" },
  { noradId: 25994, name: "Terra", category: "earth-observation", country: "US" },
  { noradId: 39084, name: "Landsat 8", category: "earth-observation", country: "US" },
  { noradId: 48859, name: "GPS III SV05", category: "navigation", country: "US" },
  { noradId: 41019, name: "Galileo-14", category: "navigation", country: "EU" },
  { noradId: 44238, name: "Starlink-24", category: "communications", country: "US" },
  { noradId: 56172, name: "OneWeb-0373", category: "communications", country: "UK" },
  { noradId: 43226, name: "GOES-17", category: "weather", country: "US" },
  { noradId: 41866, name: "GOES-16", category: "weather", country: "US" },
  { noradId: 43013, name: "USA-276", category: "reconnaissance", country: "US" },
  { noradId: 36516, name: "COSMO-SkyMed 4", category: "reconnaissance", country: "IT" },
];

const satelliteCache = new TTLCache<SatelliteSummary[]>(DEFAULT_TTL_MS);

export class SatelliteServiceError extends Error {
  readonly code = "SATELLITES_UNAVAILABLE";

  constructor(message = "Unable to load satellite data") {
    super(message);
    this.name = "SatelliteServiceError";
  }
}

function parseTLE(raw: string): SatelliteTLE | null {
  const lines = raw.trim().split("\n").map((line) => line.trim());
  if (lines.length < 2) {
    return null;
  }

  // CelesTrak returns 3 lines: name, line1, line2 — or 2 lines: line1, line2
  const line1 = lines.find((l) => l.startsWith("1 "));
  const line2 = lines.find((l) => l.startsWith("2 "));

  if (!line1 || !line2) {
    return null;
  }

  return { line1, line2 };
}

function parseOrbitalElements(line2: string): {
  inclination: number;
  period: number;
  apogee: number;
  perigee: number;
} {
  // TLE line 2 format:
  // Col 09-16: Inclination (degrees)
  // Col 18-25: RAAN (degrees)
  // Col 27-33: Eccentricity (decimal assumed)
  // Col 35-42: Argument of Perigee (degrees)
  // Col 44-51: Mean Anomaly (degrees)
  // Col 53-63: Mean Motion (revs/day)
  const inclination = Number.parseFloat(line2.substring(8, 16).trim());
  const eccentricityStr = line2.substring(26, 33).trim();
  const eccentricity = Number.parseFloat(`0.${eccentricityStr}`);
  const meanMotion = Number.parseFloat(line2.substring(52, 63).trim());

  const EARTH_RADIUS_KM = 6371;
  const periodMinutes = meanMotion > 0 ? 1440 / meanMotion : 0;

  // Semi-major axis from period (Kepler's third law)
  const periodSeconds = periodMinutes * 60;
  const mu = 398600.4418; // km³/s²
  const semiMajorAxis =
    periodSeconds > 0
      ? Math.cbrt((mu * periodSeconds * periodSeconds) / (4 * Math.PI * Math.PI))
      : EARTH_RADIUS_KM;

  const apogee = Math.round(semiMajorAxis * (1 + eccentricity) - EARTH_RADIUS_KM);
  const perigee = Math.round(semiMajorAxis * (1 - eccentricity) - EARTH_RADIUS_KM);

  return {
    inclination: Math.round(inclination * 100) / 100,
    period: Math.round(periodMinutes * 100) / 100,
    apogee: Math.max(apogee, 0),
    perigee: Math.max(perigee, 0),
  };
}

async function fetchTLE(noradId: number): Promise<SatelliteTLE | null> {
  const url = `${CELESTRAK_BASE}?CATNR=${noradId}&FORMAT=tle`;
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const text = await response.text();
  return parseTLE(text);
}

function toSatelliteSummary(
  entry: CatalogEntry,
  tle: SatelliteTLE,
): SatelliteSummary {
  const orbital = parseOrbitalElements(tle.line2);

  return {
    noradId: entry.noradId,
    name: entry.name,
    category: entry.category,
    country: entry.country,
    tle,
    inclination: orbital.inclination,
    period: orbital.period,
    apogee: orbital.apogee,
    perigee: orbital.perigee,
  };
}

export async function getSatellites(): Promise<SatelliteSummary[]> {
  const cached = satelliteCache.get();
  if (cached) {
    return cached;
  }

  const results = await Promise.allSettled(
    SATELLITE_CATALOG.map(async (entry) => {
      const tle = await fetchTLE(entry.noradId);
      if (!tle) {
        return null;
      }
      return toSatelliteSummary(entry, tle);
    }),
  );

  const satellites = results
    .filter(
      (r): r is PromiseFulfilledResult<SatelliteSummary | null> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((s): s is SatelliteSummary => s !== null);

  if (satellites.length === 0) {
    const stale = satelliteCache.peek();
    if (stale) {
      return stale;
    }
    throw new SatelliteServiceError();
  }

  satelliteCache.set(satellites);
  return satellites;
}
