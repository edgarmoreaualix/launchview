// LL2 upstream API shapes
export interface LL2Pad {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  location: { name: string; country_code: string };
}

export interface LL2Launch {
  id: string;
  name: string;
  net: string;
  status: { id: number; name: string; abbrev: string };
  rocket: {
    id: number;
    configuration: {
      name: string;
      full_name: string;
      family: string;
      image_url: string | null;
    };
  };
  pad: LL2Pad;
  mission: {
    name: string;
    description: string;
    orbit: { name: string; abbrev: string } | null;
  } | null;
  vidURLs: { priority: number; title: string; url: string }[];
  image: string | null;
  webcast_live: boolean;
}

// App domain type (what frontend consumes)
export interface LaunchSummary {
  id: string;
  name: string;
  net: string;
  statusAbbrev: string;
  statusName: string;
  rocketName: string;
  rocketFamily: string;
  rocketImageUrl: string | null;
  padName: string;
  padLatitude: number;
  padLongitude: number;
  locationName: string;
  countryCode: string;
  missionName: string | null;
  missionDescription: string | null;
  orbitName: string | null;
  orbitAbbrev: string | null;
  webcastUrl: string | null;
  webcastLive: boolean;
  imageUrl: string | null;
  rocketFamilyKey: string;
  rocketModelKey: string;
}

// Trajectory
export interface TrajectoryPoint {
  time: number;
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface LaunchTrajectory {
  launchId: string;
  points: TrajectoryPoint[];
  durationSeconds: number;
}

// Watching counter
export interface WatchingCount {
  launchId: string;
  count: number;
}
