import "../setup";

import { createElement } from "../../frontend/node_modules/react/index.js";
import { renderToStaticMarkup } from "../../frontend/node_modules/react-dom/server.js";
import { describe, expect, test, vi } from "vitest";

import { LaunchDetailPanel } from "../../frontend/src/components/LaunchDetailPanel";

function renderDetailPanel(props: Partial<Parameters<typeof LaunchDetailPanel>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(LaunchDetailPanel, {
      selectedLaunch: null,
      isLoading: false,
      error: null,
      watchingCount: null,
      watchingLoading: false,
      watchingError: null,
      isJoiningWatching: false,
      onJoinWatching: vi.fn(),
      ...props,
    }),
  );
}

describe("LaunchDetailPanel resilience states", () => {
  test("renders loading state copy", () => {
    const markup = renderDetailPanel({ isLoading: true });
    expect(markup).toContain("Loading launch details...");
  });

  test("renders error state copy", () => {
    const markup = renderDetailPanel({ error: "request timed out" });
    expect(markup).toContain("Unable to load launches: request timed out");
  });

  test("renders empty state copy when no launch is selected", () => {
    const markup = renderDetailPanel();
    expect(markup).toContain("Select a launch pin to view mission details.");
  });
});
