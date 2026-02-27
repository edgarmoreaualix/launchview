import type { LaunchTrajectory } from "../../shared/types";

export const validLaunchTrajectoryFixture: LaunchTrajectory = {
  launchId: "launch-trajectory-1",
  durationSeconds: 40,
  points: [
    { time: 0, latitude: 28.5618571, longitude: -80.577366, altitude: 0 },
    { time: 10, latitude: 28.9, longitude: -80.1, altitude: 1200 },
    { time: 20, latitude: 29.3, longitude: -79.7, altitude: 3600 },
    { time: 30, latitude: 29.8, longitude: -79.2, altitude: 7600 },
    { time: 40, latitude: 30.4, longitude: -78.8, altitude: 14000 },
  ],
};

export const malformedTrajectoryMissingLaunchId = {
  durationSeconds: 40,
  points: validLaunchTrajectoryFixture.points,
};

export const malformedTrajectoryInvalidPoint = {
  launchId: "launch-trajectory-1",
  durationSeconds: 40,
  points: [
    { time: 0, latitude: 0, longitude: 0, altitude: 0 },
    { time: 5, latitude: 95, longitude: Number.NaN, altitude: 200 },
  ],
};

export const malformedTrajectoryNonMonotonicTime = {
  launchId: "launch-trajectory-1",
  durationSeconds: 20,
  points: [
    { time: 0, latitude: 0, longitude: 0, altitude: 0 },
    { time: 10, latitude: 1, longitude: 1, altitude: 100 },
    { time: 9, latitude: 2, longitude: 2, altitude: 200 },
  ],
};
