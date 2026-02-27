import "../setup";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { launchDetailFixture } from "../fixtures/launchDetail";

vi.mock("../../backend/services/launchService", () => ({
  getLaunches: vi.fn(),
}));

async function loadHandler() {
  return import("../../backend/functions/launches");
}

async function loadService() {
  return import("../../backend/services/launchService");
}

describe("launches function", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("returns launch payload with ll2 source metadata header", async () => {
    const service = await loadService();
    vi.mocked(service.getLaunches).mockResolvedValue({
      launches: [launchDetailFixture],
      source: "ll2",
    });

    const { handler } = await loadHandler();
    const response = await handler({} as never, {} as never);

    expect(response?.statusCode).toBe(200);
    expect(response?.headers?.["x-launch-source"]).toBe("ll2");
    expect(response?.headers?.["cache-control"]).toBe("public, max-age=60");
    expect(JSON.parse(response?.body ?? "null")).toEqual([launchDetailFixture]);
  });

  test("returns launch payload with mock source metadata header", async () => {
    const service = await loadService();
    vi.mocked(service.getLaunches).mockResolvedValue({
      launches: [launchDetailFixture],
      source: "mock",
    });

    const { handler } = await loadHandler();
    const response = await handler({} as never, {} as never);

    expect(response?.statusCode).toBe(200);
    expect(response?.headers?.["x-launch-source"]).toBe("mock");
    expect(JSON.parse(response?.body ?? "null")).toEqual([launchDetailFixture]);
  });

  test("returns structured error response when launch retrieval fails", async () => {
    const service = await loadService();
    vi.mocked(service.getLaunches).mockRejectedValue(new Error("upstream unavailable"));

    const { handler } = await loadHandler();
    const response = await handler({} as never, {} as never);
    const body = JSON.parse(response?.body ?? "{}");

    expect(response?.statusCode).toBe(500);
    expect(response?.headers?.["cache-control"]).toBe("no-store");
    expect(body.ok).toBe(false);
    expect(body.error).toEqual(
      expect.objectContaining({
        code: "LAUNCHES_FETCH_FAILED",
      }),
    );
    expect(typeof body.error.message).toBe("string");
    expect(body.error.message.length).toBeGreaterThan(0);
  });
});
