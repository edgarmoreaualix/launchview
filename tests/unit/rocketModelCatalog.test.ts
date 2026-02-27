import "../setup";

import { describe, expect, test } from "vitest";

import {
  getGenericRocketModelRoute,
  resolveRocketModelRoute,
} from "../../frontend/src/utils/rocketModelCatalog";
import type { LaunchSummary } from "../../shared/types";

function createLaunch(rocketName: string, rocketFamily: string): Pick<
  LaunchSummary,
  "rocketName" | "rocketFamily"
> {
  return {
    rocketName,
    rocketFamily,
  };
}

describe("rocket model catalog resolver", () => {
  test("maps known rocket names/families to expected .gltf routes", () => {
    const falconByName = resolveRocketModelRoute(createLaunch("Falcon 9", "Unknown"));
    expect(falconByName.primary.key).toBe("falcon");
    expect(falconByName.primary.uri).toBe("/models/rocket-falcon.gltf");
    expect(falconByName.matchSource).toBe("rocketName");

    const arianeByFamily = resolveRocketModelRoute(createLaunch("Vehicle X", "Ariane"));
    expect(arianeByFamily.primary.key).toBe("ariane");
    expect(arianeByFamily.primary.uri).toBe("/models/rocket-ariane.gltf");
    expect(arianeByFamily.matchSource).toBe("rocketFamily");

    const soyuzAlias = resolveRocketModelRoute(createLaunch("Electron", "Unknown"));
    expect(soyuzAlias.primary.key).toBe("soyuz");
    expect(soyuzAlias.primary.uri).toBe("/models/rocket-soyuz.gltf");
    expect(soyuzAlias.matchSource).toBe("rocketName");
  });

  test("falls back to generic route for unknown labels", () => {
    const unknown = resolveRocketModelRoute(createLaunch("Experimental Vehicle", "Custom"));

    expect(unknown.primary.key).toBe("generic");
    expect(unknown.primary.uri).toBe("/models/rocket-generic.gltf");
    expect(unknown.fallback.key).toBe("generic");
    expect(unknown.fallback.uri).toBe("/models/rocket-generic.gltf");
    expect(unknown.matchSource).toBe("default");
  });

  test("returns stable generic route metadata", () => {
    const generic = getGenericRocketModelRoute();

    expect(generic).toMatchObject({
      key: "generic",
      uri: "/models/rocket-generic.gltf",
      scale: 1,
      minimumPixelSize: 64,
      maximumScale: 150,
    });
  });
});
