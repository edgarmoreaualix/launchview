import "../setup";
import { describe, expect, test } from "vitest";

import type { LaunchSummary } from "../../shared/types";
import { isNullableString } from "./helpers/typeGuards";

const REQUIRED_KEYS: Array<keyof LaunchSummary> = [
  "id",
  "name",
  "net",
  "statusAbbrev",
  "statusName",
  "rocketName",
  "rocketFamily",
  "rocketImageUrl",
  "padName",
  "padLatitude",
  "padLongitude",
  "locationName",
  "countryCode",
  "missionName",
  "missionDescription",
  "orbitName",
  "orbitAbbrev",
  "webcastUrl",
  "webcastLive",
  "imageUrl",
];

function validateLaunchSummaryContract(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["not an object"] };
  }

  const candidate = value as Record<string, unknown>;

  for (const key of REQUIRED_KEYS) {
    if (!(key in candidate)) {
      errors.push(`missing required key: ${String(key)}`);
    }
  }

  if (typeof candidate.id !== "string") errors.push("id must be string");
  if (typeof candidate.name !== "string") errors.push("name must be string");
  if (typeof candidate.net !== "string") errors.push("net must be string");
  if (typeof candidate.statusAbbrev !== "string") errors.push("statusAbbrev must be string");
  if (typeof candidate.statusName !== "string") errors.push("statusName must be string");
  if (typeof candidate.rocketName !== "string") errors.push("rocketName must be string");
  if (typeof candidate.rocketFamily !== "string") errors.push("rocketFamily must be string");
  if (!isNullableString(candidate.rocketImageUrl)) errors.push("rocketImageUrl must be string|null");
  if (typeof candidate.padName !== "string") errors.push("padName must be string");
  if (typeof candidate.padLatitude !== "number") errors.push("padLatitude must be number");
  if (typeof candidate.padLongitude !== "number") errors.push("padLongitude must be number");
  if (typeof candidate.locationName !== "string") errors.push("locationName must be string");
  if (typeof candidate.countryCode !== "string") errors.push("countryCode must be string");
  if (!isNullableString(candidate.missionName)) errors.push("missionName must be string|null");
  if (!isNullableString(candidate.missionDescription)) errors.push("missionDescription must be string|null");
  if (!isNullableString(candidate.orbitName)) errors.push("orbitName must be string|null");
  if (!isNullableString(candidate.orbitAbbrev)) errors.push("orbitAbbrev must be string|null");
  if (!isNullableString(candidate.webcastUrl)) errors.push("webcastUrl must be string|null");
  if (typeof candidate.webcastLive !== "boolean") errors.push("webcastLive must be boolean");
  if (!isNullableString(candidate.imageUrl)) errors.push("imageUrl must be string|null");

  return { valid: errors.length === 0, errors };
}

describe("LaunchSummary contract", () => {
  test("accepts a contract-compliant payload with additional fields", () => {
    const compliantWithExtraField = {
      id: "launch-1",
      name: "Falcon 9 | Starlink Group 1",
      net: "2026-03-01T12:00:00Z",
      statusAbbrev: "Go",
      statusName: "Go for Launch",
      rocketName: "Falcon 9",
      rocketFamily: "Falcon",
      rocketImageUrl: null,
      padName: "SLC-40",
      padLatitude: 28.56,
      padLongitude: -80.57,
      locationName: "Cape Canaveral",
      countryCode: "USA",
      missionName: "Starlink",
      missionDescription: "Deploy satellites",
      orbitName: "Low Earth Orbit",
      orbitAbbrev: "LEO",
      webcastUrl: "https://stream.example/main",
      webcastLive: true,
      imageUrl: null,
      extraFieldFromFutureVersion: "allowed",
    };

    const result = validateLaunchSummaryContract(compliantWithExtraField);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("fails when required fields are missing", () => {
    const invalid = {
      id: "launch-1",
      net: "2026-03-01T12:00:00Z",
      statusAbbrev: "Go",
    };

    const result = validateLaunchSummaryContract(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("missing required key: name");
    expect(result.errors).toContain("missing required key: webcastLive");
  });

  test("fails when required field types are invalid", () => {
    const invalid = {
      id: "launch-1",
      name: "Mission",
      net: "2026-03-01T12:00:00Z",
      statusAbbrev: "Go",
      statusName: "Go",
      rocketName: "Falcon 9",
      rocketFamily: "Falcon",
      rocketImageUrl: null,
      padName: "SLC-40",
      padLatitude: "28.56",
      padLongitude: -80.57,
      locationName: "Cape Canaveral",
      countryCode: "USA",
      missionName: null,
      missionDescription: null,
      orbitName: null,
      orbitAbbrev: null,
      webcastUrl: null,
      webcastLive: "yes",
      imageUrl: null,
    };

    const result = validateLaunchSummaryContract(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("padLatitude must be number");
    expect(result.errors).toContain("webcastLive must be boolean");
  });
});
