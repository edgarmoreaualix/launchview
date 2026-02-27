import "../setup";

import { describe, expect, test } from "vitest";

import type { LaunchSummary } from "../../shared/types";
import { launchPinFixtures } from "../fixtures/launchPins";

interface PinStyle {
  color: string;
  pixelSize: number;
}

interface LaunchPinViewModel {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  statusAbbrev: string;
  style: PinStyle;
}

function hasRenderableCoordinates(launch: LaunchSummary): boolean {
  return (
    Number.isFinite(launch.padLatitude) &&
    Number.isFinite(launch.padLongitude) &&
    launch.padLatitude >= -90 &&
    launch.padLatitude <= 90 &&
    launch.padLongitude >= -180 &&
    launch.padLongitude <= 180
  );
}

function styleForStatus(statusAbbrev: string): PinStyle {
  const normalized = statusAbbrev.toLowerCase();

  if (normalized === "go") {
    return { color: "#2ecc71", pixelSize: 14 };
  }

  if (normalized === "hold") {
    return { color: "#f39c12", pixelSize: 13 };
  }

  if (normalized === "failure") {
    return { color: "#e74c3c", pixelSize: 13 };
  }

  return { color: "#7f8c8d", pixelSize: 12 };
}

function mapLaunchesToPins(launches: LaunchSummary[]): LaunchPinViewModel[] {
  return launches
    .filter(hasRenderableCoordinates)
    .map((launch) => ({
      id: launch.id,
      name: launch.name,
      latitude: launch.padLatitude,
      longitude: launch.padLongitude,
      statusAbbrev: launch.statusAbbrev,
      style: styleForStatus(launch.statusAbbrev),
    }));
}

describe("launch pin mapping", () => {
  test("filters launches with invalid coordinates", () => {
    const pins = mapLaunchesToPins(launchPinFixtures);

    expect(pins).toHaveLength(2);
    expect(pins.map((pin) => pin.id)).toEqual(["go-valid", "hold-valid"]);
  });

  test("derives deterministic style from status abbreviation", () => {
    const goStyleA = styleForStatus("Go");
    const goStyleB = styleForStatus("GO");
    const holdStyle = styleForStatus("Hold");
    const fallbackStyle = styleForStatus("Unknown");

    expect(goStyleA).toEqual({ color: "#2ecc71", pixelSize: 14 });
    expect(goStyleB).toEqual(goStyleA);
    expect(holdStyle).toEqual({ color: "#f39c12", pixelSize: 13 });
    expect(fallbackStyle).toEqual({ color: "#7f8c8d", pixelSize: 12 });
  });

  test("returns a stable renderable output shape", () => {
    const [firstPin] = mapLaunchesToPins(launchPinFixtures);

    expect(firstPin).toEqual({
      id: "go-valid",
      name: "Falcon 9 | Starlink",
      latitude: 28.5618571,
      longitude: -80.577366,
      statusAbbrev: "Go",
      style: {
        color: "#2ecc71",
        pixelSize: 14,
      },
    });
  });
});
