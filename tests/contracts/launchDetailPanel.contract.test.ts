import "../setup";

import { describe, expect, test } from "vitest";

import type { LaunchSummary } from "../../shared/types";
import {
  launchDetailFixture,
  malformedNetLaunchDetailFixture,
} from "../fixtures/launchDetail";

const REQUIRED_DETAIL_FIELDS: Array<keyof LaunchSummary> = [
  "id",
  "name",
  "statusName",
  "statusAbbrev",
  "net",
  "rocketName",
  "padName",
  "locationName",
];

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function validateDetailPanelContract(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["not an object"] };
  }

  const candidate = value as Record<string, unknown>;

  for (const key of REQUIRED_DETAIL_FIELDS) {
    if (!(key in candidate)) {
      errors.push(`missing required key: ${String(key)}`);
    }
  }

  if (typeof candidate.id !== "string") errors.push("id must be string");
  if (typeof candidate.name !== "string") errors.push("name must be string");
  if (typeof candidate.statusName !== "string") errors.push("statusName must be string");
  if (typeof candidate.statusAbbrev !== "string") errors.push("statusAbbrev must be string");
  if (typeof candidate.net !== "string") {
    errors.push("net must be string");
  } else if (!Number.isFinite(Date.parse(candidate.net))) {
    errors.push("net must be parseable ISO date");
  }
  if (typeof candidate.rocketName !== "string") errors.push("rocketName must be string");
  if (typeof candidate.padName !== "string") errors.push("padName must be string");
  if (typeof candidate.locationName !== "string") errors.push("locationName must be string");

  if (!isNullableString(candidate.missionName)) errors.push("missionName must be string|null");
  if (!isNullableString(candidate.missionDescription)) {
    errors.push("missionDescription must be string|null");
  }

  return { valid: errors.length === 0, errors };
}

describe("Launch detail panel contract", () => {
  test("accepts contract-compliant payload with additive fields", () => {
    const compliant = {
      ...launchDetailFixture,
      futureField: "allowed",
    };

    const result = validateDetailPanelContract(compliant);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("fails when required fields are missing or wrong type", () => {
    const invalid = {
      id: 123,
      statusName: "Go",
      statusAbbrev: "Go",
      net: "2026-04-05T14:30:45.000Z",
      rocketName: "Falcon 9",
      padName: "SLC-40",
    };

    const result = validateDetailPanelContract(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("missing required key: name");
    expect(result.errors).toContain("missing required key: locationName");
    expect(result.errors).toContain("id must be string");
  });

  test("fails malformed net used by countdown-driving field", () => {
    const result = validateDetailPanelContract(malformedNetLaunchDetailFixture);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("net must be parseable ISO date");
  });
});
