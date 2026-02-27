import "../setup";

import { describe, expect, test } from "vitest";

function parseNet(net: string): number | null {
  const parsed = Date.parse(net);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNetUtc(net: string): string {
  const parsed = parseNet(net);
  if (parsed === null) {
    return "Invalid NET";
  }

  return new Date(parsed).toISOString();
}

describe("time utilities", () => {
  test("parses valid ISO net string into timestamp", () => {
    const timestamp = parseNet("2026-04-05T14:30:45.000Z");

    expect(timestamp).toBe(1775399445000);
  });

  test("returns null for malformed net values", () => {
    expect(parseNet("not-a-date")).toBeNull();
    expect(parseNet("")).toBeNull();
  });

  test("formats valid net into canonical UTC output", () => {
    const formatted = formatNetUtc("2026-04-05T14:30:45.000Z");
    expect(formatted).toBe("2026-04-05T14:30:45.000Z");
  });

  test("degrades gracefully for invalid net during formatting", () => {
    const formatted = formatNetUtc("invalid-net");
    expect(formatted).toBe("Invalid NET");
  });
});
