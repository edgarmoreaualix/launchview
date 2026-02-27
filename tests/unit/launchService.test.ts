import "../setup";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ll2ResponseFixture } from "../fixtures/launches";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
}));

vi.mock("node-fetch", () => ({
  default: vi.fn(),
}));

async function loadService() {
  return import("../../backend/services/launchService");
}

async function loadFreshService() {
  const service = await loadService();
  service.clearLaunchesCache();
  return service;
}

describe("getLaunches", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("transforms LL2 payload into LaunchSummary with edge-case handling", async () => {
    const fs = await import("node:fs/promises");
    const readFileMock = vi.mocked(fs.readFile);
    readFileMock.mockResolvedValueOnce(JSON.stringify(ll2ResponseFixture));

    const { getLaunches } = await loadFreshService();
    const result = await getLaunches();
    const launches = result.launches;

    expect(launches).toHaveLength(2);
    expect(result.source).toBe("mock");

    expect(launches[0]).toMatchObject({
      id: "launch-1",
      statusAbbrev: "Go",
      rocketFamily: "Falcon",
      padLatitude: 28.5618571,
      padLongitude: -80.577366,
      missionName: "Starlink",
      orbitAbbrev: "LEO",
      webcastUrl: "https://stream.example/main",
      webcastLive: true,
    });

    expect(launches[1]).toMatchObject({
      id: "launch-2",
      padLatitude: 0,
      padLongitude: 0,
      missionName: null,
      missionDescription: null,
      orbitName: null,
      orbitAbbrev: null,
      webcastUrl: null,
      imageUrl: null,
    });
  });

  test("returns cached launches on second call without forceRefresh", async () => {
    const fs = await import("node:fs/promises");
    const readFileMock = vi.mocked(fs.readFile);
    readFileMock.mockResolvedValue(JSON.stringify(ll2ResponseFixture));

    const { getLaunches } = await loadFreshService();

    const first = await getLaunches();
    const second = await getLaunches();

    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  test("bypasses cache when forceRefresh is true", async () => {
    const fs = await import("node:fs/promises");
    const readFileMock = vi.mocked(fs.readFile);
    readFileMock.mockResolvedValue(JSON.stringify(ll2ResponseFixture));

    const { getLaunches } = await loadFreshService();

    await getLaunches();
    await getLaunches(true);

    expect(readFileMock).toHaveBeenCalledTimes(2);
  });

  test("uses mock launches when USE_MOCK_LAUNCHES is enabled", async () => {
    const previousEnv = {
      NODE_ENV: process.env.NODE_ENV,
      USE_MOCK_LAUNCHES: process.env.USE_MOCK_LAUNCHES,
      CONTEXT: process.env.CONTEXT,
      NETLIFY_DEV: process.env.NETLIFY_DEV,
    };

    try {
      process.env.NODE_ENV = "production";
      process.env.USE_MOCK_LAUNCHES = "true";
      process.env.CONTEXT = "production";
      process.env.NETLIFY_DEV = "false";

      const fs = await import("node:fs/promises");
      const readFileMock = vi.mocked(fs.readFile);
      readFileMock.mockResolvedValue(JSON.stringify(ll2ResponseFixture));

      const fetchModule = await import("node-fetch");
      const fetchMock = vi.mocked(fetchModule.default);

      const { getLaunches } = await loadFreshService();
      const result = await getLaunches(true);
      const launches = result.launches;

      expect(fetchMock).toHaveBeenCalledTimes(0);
      expect(readFileMock).toHaveBeenCalledTimes(1);
      expect(launches).toHaveLength(2);
      expect(result.source).toBe("mock");
    } finally {
      process.env.NODE_ENV = previousEnv.NODE_ENV;
      process.env.USE_MOCK_LAUNCHES = previousEnv.USE_MOCK_LAUNCHES;
      process.env.CONTEXT = previousEnv.CONTEXT;
      process.env.NETLIFY_DEV = previousEnv.NETLIFY_DEV;
    }
  });

});
