import "../setup";

import { describe, expect, test } from "vitest";

function advanceTrajectoryIndex(
  currentIndex: number,
  pointCount: number,
  isActive: boolean,
): number {
  if (!isActive || pointCount <= 0) {
    return currentIndex;
  }

  const next = currentIndex + 1;
  return next >= pointCount ? pointCount - 1 : next;
}

function indexForElapsedTime(
  elapsedMs: number,
  stepMs: number,
  pointCount: number,
): number {
  if (pointCount <= 0) {
    return 0;
  }

  if (stepMs <= 0) {
    throw new Error("stepMs must be > 0");
  }

  const rawIndex = Math.floor(elapsedMs / stepMs);
  if (rawIndex < 0) {
    return 0;
  }

  return rawIndex >= pointCount ? pointCount - 1 : rawIndex;
}

describe("trajectory animation progression", () => {
  test("advances index by one while active", () => {
    expect(advanceTrajectoryIndex(0, 5, true)).toBe(1);
    expect(advanceTrajectoryIndex(3, 5, true)).toBe(4);
  });

  test("stops at final index and does not overflow", () => {
    expect(advanceTrajectoryIndex(4, 5, true)).toBe(4);
    expect(advanceTrajectoryIndex(10, 5, true)).toBe(4);
  });

  test("does not advance when animation is inactive or no points", () => {
    expect(advanceTrajectoryIndex(2, 5, false)).toBe(2);
    expect(advanceTrajectoryIndex(0, 0, true)).toBe(0);
  });

  test("maps elapsed time into monotonic bounded indices", () => {
    const indices = [0, 250, 999, 1_000, 1_999, 5_500].map((elapsed) =>
      indexForElapsedTime(elapsed, 1_000, 5),
    );

    expect(indices).toEqual([0, 0, 0, 1, 1, 4]);
  });

  test("throws on invalid animation step interval", () => {
    expect(() => indexForElapsedTime(100, 0, 5)).toThrow("stepMs must be > 0");
  });
});
