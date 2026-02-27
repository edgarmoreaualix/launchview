import type { LL2Launch } from "../../shared/types";

export const ll2LaunchFixtures = [
  {
    id: "launch-1",
    name: "Falcon 9 | Starlink Group 1",
    net: "2026-03-01T12:00:00Z",
    status: { id: 1, name: "Go for Launch", abbrev: "Go" },
    rocket: {
      id: 100,
      configuration: {
        name: "Falcon 9",
        full_name: "Falcon 9 Block 5",
        family: "Falcon",
        image_url: "https://example.com/f9.png",
      },
    },
    pad: {
      id: 30,
      name: "SLC-40",
      latitude: "28.5618571",
      longitude: "-80.577366",
      location: { name: "Cape Canaveral", country_code: "USA" },
    },
    mission: {
      name: "Starlink",
      description: "Deploy satellites",
      orbit: { name: "Low Earth Orbit", abbrev: "LEO" },
    },
    vidURLs: [
      { priority: 5, title: "Alt feed", url: "https://stream.example/alt" },
      { priority: 1, title: "Primary", url: "https://stream.example/main" },
    ],
    image: "https://example.com/launch-1.jpg",
    webcast_live: true,
  },
  {
    id: "launch-2",
    name: "Electron | Test Mission",
    net: "2026-03-02T16:30:00Z",
    status: { id: 2, name: "To Be Confirmed", abbrev: "TBC" },
    rocket: {
      id: 101,
      configuration: {
        name: "Electron",
        full_name: "Electron",
        family: "Electron",
        image_url: null,
      },
    },
    pad: {
      id: 31,
      name: "LC-1A",
      latitude: "not-a-number",
      longitude: "also-not-a-number",
      location: { name: "Mahia Peninsula", country_code: "NZL" },
    },
    mission: null,
    vidURLs: [],
    image: null,
    webcast_live: false,
  },
] satisfies LL2Launch[];

export const ll2ResponseFixture = {
  results: ll2LaunchFixtures,
};
