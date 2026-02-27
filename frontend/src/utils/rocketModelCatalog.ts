import type { LaunchSummary } from '../../../shared/types';

export interface RocketModelRoute {
  key: string;
  uri: string;
  scale: number;
  minimumPixelSize: number;
  maximumScale: number;
  towerOffsetEastMeters: number;
  towerHeightMeters: number;
}

export interface RocketModelResolution {
  primary: RocketModelRoute;
  fallback: RocketModelRoute;
  matchSource: 'rocketName' | 'rocketFamily' | 'default';
}

const FALCON_ROUTE: RocketModelRoute = {
  key: 'falcon',
  uri: '/models/rocket-falcon.gltf',
  scale: 1,
  minimumPixelSize: 68,
  maximumScale: 160,
  towerOffsetEastMeters: 19,
  towerHeightMeters: 56,
};

const ARIANE_ROUTE: RocketModelRoute = {
  key: 'ariane',
  uri: '/models/rocket-ariane.gltf',
  scale: 1,
  minimumPixelSize: 74,
  maximumScale: 170,
  towerOffsetEastMeters: 21,
  towerHeightMeters: 60,
};

const SOYUZ_ROUTE: RocketModelRoute = {
  key: 'soyuz',
  uri: '/models/rocket-soyuz.gltf',
  scale: 1,
  minimumPixelSize: 66,
  maximumScale: 150,
  towerOffsetEastMeters: 17,
  towerHeightMeters: 52,
};

const GENERIC_ROUTE: RocketModelRoute = {
  key: 'generic',
  uri: '/models/rocket-generic.gltf',
  scale: 1,
  minimumPixelSize: 64,
  maximumScale: 150,
  towerOffsetEastMeters: 16,
  towerHeightMeters: 52,
};

const ROUTE_MATCHERS: ReadonlyArray<{ route: RocketModelRoute; aliases: readonly string[] }> = [
  {
    route: FALCON_ROUTE,
    aliases: ['falcon', 'starship', 'heavy', 'atlas', 'vulcan', 'new glenn'],
  },
  {
    route: ARIANE_ROUTE,
    aliases: ['ariane', 'h3', 'long march', 'delta'],
  },
  {
    route: SOYUZ_ROUTE,
    aliases: ['soyuz', 'electron', 'pslv', 'lvm', 'gslv', 'antares'],
  },
];

function normalizeRocketLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function findRoute(value: string): RocketModelRoute | null {
  const normalized = normalizeRocketLabel(value);
  if (!normalized) {
    return null;
  }

  const match = ROUTE_MATCHERS.find(({ aliases }) =>
    aliases.some((alias) => normalized.includes(alias)),
  );

  return match?.route ?? null;
}

export function getGenericRocketModelRoute(): RocketModelRoute {
  return GENERIC_ROUTE;
}

export function resolveRocketModelRoute(
  launch: Pick<LaunchSummary, 'rocketName' | 'rocketFamily'>,
): RocketModelResolution {
  const byRocketName = findRoute(launch.rocketName);
  if (byRocketName) {
    return {
      primary: byRocketName,
      fallback: GENERIC_ROUTE,
      matchSource: 'rocketName',
    };
  }

  const byRocketFamily = findRoute(launch.rocketFamily);
  if (byRocketFamily) {
    return {
      primary: byRocketFamily,
      fallback: GENERIC_ROUTE,
      matchSource: 'rocketFamily',
    };
  }

  return {
    primary: GENERIC_ROUTE,
    fallback: GENERIC_ROUTE,
    matchSource: 'default',
  };
}
