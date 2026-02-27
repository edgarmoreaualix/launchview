import "../setup";

import { describe, expect, test } from "vitest";
import { formatNetTime, parseIsoTimestamp } from "../../frontend/src/utils/time";

describe("time utilities", () => {
  test("parses valid ISO net string into timestamp", () => {
    const timestamp = parseIsoTimestamp("2026-04-05T14:30:45.000Z");

    expect(timestamp).toBe(1775399445000);
  });

  test("returns null for malformed net values", () => {
    expect(parseIsoTimestamp("not-a-date")).toBeNull();
    expect(parseIsoTimestamp("")).toBeNull();
  });

  test("formats valid net into displayable string", () => {
    const formatted = formatNetTime("2026-04-05T14:30:45.000Z");
    expect(formatted).not.toBe("NET unavailable");
    expect(formatted.length).toBeGreaterThan(0);
  });

  test("degrades gracefully for invalid net during formatting", () => {
    const formatted = formatNetTime("invalid-net");
    expect(formatted).toBe("NET unavailable");
  });
});
