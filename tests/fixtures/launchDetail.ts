import type { LaunchSummary } from "../../shared/types";

export const launchDetailFixture: LaunchSummary = {
  id: "detail-1",
  name: "Falcon 9 | Starlink 7-2",
  net: "2026-04-05T14:30:45.000Z",
  statusAbbrev: "Go",
  statusName: "Go for Launch",
  rocketName: "Falcon 9",
  rocketFamily: "Falcon",
  rocketImageUrl: null,
  padName: "SLC-40",
  padLatitude: 28.5618571,
  padLongitude: -80.577366,
  locationName: "Cape Canaveral",
  countryCode: "USA",
  missionName: "Starlink",
  missionDescription: "Deploy satellites",
  orbitName: "Low Earth Orbit",
  orbitAbbrev: "LEO",
  webcastUrl: "https://example.com/webcast",
  webcastLive: true,
  imageUrl: null,
};

export const malformedNetLaunchDetailFixture: LaunchSummary = {
  ...launchDetailFixture,
  id: "detail-invalid-net",
  net: "not-an-iso-date",
};
