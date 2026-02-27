import "../setup";

import { describe, expect, test } from "vitest";

interface CountdownState {
  kind: "countdown" | "elapsed" | "invalid";
  label: string;
}

function toDhhmmss(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return `${days} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatCountdown(net: string, nowMs: number): CountdownState {
  const targetMs = Date.parse(net);
  if (!Number.isFinite(targetMs)) {
    return { kind: "invalid", label: "Invalid NET" };
  }

  const diffSeconds = Math.floor((targetMs - nowMs) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (diffSeconds >= 0) {
    return { kind: "countdown", label: `T-${toDhhmmss(absSeconds)}` };
  }

  return { kind: "elapsed", label: `T+${toDhhmmss(absSeconds)}` };
}

describe("countdown formatting", () => {
  test("formats future launch time as T- with D HH:MM:SS", () => {
    const nowMs = Date.parse("2026-04-05T14:30:00.000Z");
    const net = "2026-04-06T16:35:08.000Z";

    const result = formatCountdown(net, nowMs);

    expect(result).toEqual({
      kind: "countdown",
      label: "T-1 02:05:08",
    });
  });

  test("formats near-zero launch time deterministically", () => {
    const nowMs = Date.parse("2026-04-05T14:30:44.400Z");
    const net = "2026-04-05T14:30:45.000Z";

    const result = formatCountdown(net, nowMs);

    expect(result).toEqual({
      kind: "countdown",
      label: "T-0 00:00:00",
    });
  });

  test("formats past launch time as elapsed T+", () => {
    const nowMs = Date.parse("2026-04-05T14:40:45.000Z");
    const net = "2026-04-05T14:30:45.000Z";

    const result = formatCountdown(net, nowMs);

    expect(result).toEqual({
      kind: "elapsed",
      label: "T+0 00:10:00",
    });
  });

  test("returns explicit invalid state for malformed net", () => {
    const nowMs = Date.parse("2026-04-05T14:30:45.000Z");

    const result = formatCountdown("bad-net", nowMs);

    expect(result).toEqual({
      kind: "invalid",
      label: "Invalid NET",
    });
  });
});
