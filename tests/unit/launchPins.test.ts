import "../setup";

import { describe, expect, test } from "vitest";

import type { LaunchSummary } from "../../shared/types";
import { toLaunchPins } from "../../frontend/src/utils/launchPins";
import { launchPinFixtures } from "../fixtures/launchPins";

describe("launch pin mapping", () => {
  test("filters launches with invalid coordinates", () => {
    const pins = toLaunchPins(launchPinFixtures);

    expect(pins).toHaveLength(2);
    expect(pins.map((pin) => pin.launchId)).toEqual(["go-valid", "hold-valid"]);
  });

  test("derives deterministic style from status abbreviation", () => {
    const goLaunches: LaunchSummary[] = [
      { ...launchPinFixtures[0], id: "go-mixed", statusAbbrev: "Go" },
      { ...launchPinFixtures[0], id: "go-upper", statusAbbrev: "GO" },
      { ...launchPinFixtures[0], id: "go-unknown", statusAbbrev: "UNKNOWN" },
    ];

    const pins = toLaunchPins(goLaunches);
    const goMixed = pins.find((pin) => pin.launchId === "go-mixed");
    const goUpper = pins.find((pin) => pin.launchId === "go-upper");
    const goUnknown = pins.find((pin) => pin.launchId === "go-unknown");

    expect(goMixed?.style).toEqual(goUpper?.style);
    expect(goUnknown?.style).toEqual({
      colorCss: "#8da2c0",
      outlineCss: "#08111f",
      pixelSize: 12,
      selectedPixelSize: 16,
    });
  });

  test("returns a stable renderable output shape", () => {
    const [firstPin] = toLaunchPins(launchPinFixtures);

    expect(firstPin).toEqual({
      launchId: "go-valid",
      name: "Falcon 9 | Starlink",
      latitude: 28.5618571,
      longitude: -80.577366,
      statusAbbrev: "Go",
      statusName: "Go for Launch",
      style: {
        colorCss: "#40d88f",
        outlineCss: "#082f1f",
        pixelSize: 12,
        selectedPixelSize: 16,
      },
    });
  });
});
