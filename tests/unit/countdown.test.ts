import "../setup";

import { describe, expect, test } from "vitest";
import {
  formatCountdown,
  getCountdownState,
  parseIsoTimestamp,
} from "../../frontend/src/utils/time";

describe("countdown formatting", () => {
  test("formats future launch time as T- with D HH:MM:SS", () => {
    const nowMs = Date.parse("2026-04-05T14:30:00.000Z");
    const targetMs = parseIsoTimestamp("2026-04-06T16:35:08.000Z");
    expect(targetMs).not.toBeNull();

    const state = getCountdownState(targetMs!, nowMs);

    expect(state.isPast).toBe(false);
    expect(formatCountdown(state.diffMs)).toBe("1 02:05:08");
  });

  test("formats near-zero launch time deterministically", () => {
    const nowMs = Date.parse("2026-04-05T14:30:44.400Z");
    const targetMs = parseIsoTimestamp("2026-04-05T14:30:45.000Z");
    expect(targetMs).not.toBeNull();

    const state = getCountdownState(targetMs!, nowMs);

    expect(state.isPast).toBe(false);
    expect(formatCountdown(state.diffMs)).toBe("0 00:00:00");
  });

  test("formats past launch time as elapsed T+", () => {
    const nowMs = Date.parse("2026-04-05T14:40:45.000Z");
    const targetMs = parseIsoTimestamp("2026-04-05T14:30:45.000Z");
    expect(targetMs).not.toBeNull();

    const state = getCountdownState(targetMs!, nowMs);

    expect(state.isPast).toBe(true);
    expect(formatCountdown(state.diffMs)).toBe("0 00:10:00");
  });

  test("returns null for malformed net parse", () => {
    expect(parseIsoTimestamp("bad-net")).toBeNull();
  });
});
