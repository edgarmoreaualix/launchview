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

describe("getLaunches", () => {
  beforeEach(async () => {
    vi.resetModules();
    const { clearLaunchesCache } = await loadService();
    clearLaunchesCache();
  });

  test("transforms LL2 payload into LaunchSummary with edge-case handling", async () => {
    const fs = await import("node:fs/promises");
    const readFileMock = vi.mocked(fs.readFile);
    readFileMock.mockResolvedValueOnce(JSON.stringify(ll2ResponseFixture));

    const { getLaunches } = await loadService();
    const launches = await getLaunches();

    expect(launches).toHaveLength(2);

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

    const { getLaunches } = await loadService();

    const first = await getLaunches();
    const second = await getLaunches();

    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  test("bypasses cache when forceRefresh is true", async () => {
    const fs = await import("node:fs/promises");
    const readFileMock = vi.mocked(fs.readFile);
    readFileMock.mockResolvedValue(JSON.stringify(ll2ResponseFixture));

    const { getLaunches } = await loadService();

    await getLaunches();
    await getLaunches(true);

    expect(readFileMock).toHaveBeenCalledTimes(2);
  });

  test("falls back to mock launches when network request fails in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("USE_MOCK_LAUNCHES", "false");
    vi.stubEnv("CONTEXT", "production");
    vi.stubEnv("NETLIFY_DEV", "false");

    const fs = await import("node:fs/promises");
    const readFileMock = vi.mocked(fs.readFile);
    readFileMock.mockResolvedValue(JSON.stringify(ll2ResponseFixture));

    const fetchModule = await import("node-fetch");
    const fetchMock = vi.mocked(fetchModule.default);
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    const { getLaunches } = await loadService();
    const launches = await getLaunches(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(launches).toHaveLength(2);
  });
});
