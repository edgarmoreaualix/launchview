import "../setup";

import { createElement } from "../../frontend/node_modules/react/index.js";
import { renderToStaticMarkup } from "../../frontend/node_modules/react-dom/server.js";
import { describe, expect, test, vi } from "vitest";

import { LaunchDetailPanel } from "../../frontend/src/components/LaunchDetailPanel";
import { createSyntheticTrajectory } from "../../frontend/src/utils/trajectory";
import { launchPinFixtures } from "../fixtures/launchPins";

describe("selected launch flow regression", () => {
  test("selected launch still produces trajectory and detail output", () => {
    const selectedLaunch = launchPinFixtures[0];
    const trajectory = createSyntheticTrajectory(selectedLaunch, 6, 60);

    expect(trajectory).not.toBeNull();
    expect(trajectory!.launchId).toBe(selectedLaunch.id);
    expect(trajectory!.points.length).toBe(6);

    const markup = renderToStaticMarkup(
      createElement(LaunchDetailPanel, {
        selectedLaunch,
        isLoading: false,
        error: null,
        isEmpty: false,
        watchingCount: 42,
        watchingLoading: false,
        watchingError: null,
        isJoiningWatching: false,
        onJoinWatching: vi.fn(),
      }),
    );

    expect(markup).toContain(selectedLaunch.name);
    expect(markup).toContain("Falcon 9 (Falcon)");
    expect(markup).toContain("Deploy satellites");
    expect(markup).toContain("42");
  });
});
