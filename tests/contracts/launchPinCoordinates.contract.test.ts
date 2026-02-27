import "../setup";

import { describe, expect, test } from "vitest";

import type { LaunchSummary } from "../../shared/types";

const REQUIRED_PIN_FIELDS: Array<keyof LaunchSummary> = [
  "id",
  "name",
  "statusAbbrev",
  "padLatitude",
  "padLongitude",
];

function validatePinDrivingFields(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof value !== "object" || value === null) {
    return { valid: false, errors: ["not an object"] };
  }

  const candidate = value as Record<string, unknown>;

  for (const key of REQUIRED_PIN_FIELDS) {
    if (!(key in candidate)) {
      errors.push(`missing required key: ${String(key)}`);
    }
  }

  if (typeof candidate.id !== "string") errors.push("id must be string");
  if (typeof candidate.name !== "string") errors.push("name must be string");
  if (typeof candidate.statusAbbrev !== "string") errors.push("statusAbbrev must be string");
  if (typeof candidate.padLatitude !== "number") errors.push("padLatitude must be number");
  if (typeof candidate.padLongitude !== "number") errors.push("padLongitude must be number");

  if (typeof candidate.padLatitude === "number") {
    if (!Number.isFinite(candidate.padLatitude)) {
      errors.push("padLatitude must be finite");
    } else if (candidate.padLatitude < -90 || candidate.padLatitude > 90) {
      errors.push("padLatitude out of range [-90,90]");
    }
  }

  if (typeof candidate.padLongitude === "number") {
    if (!Number.isFinite(candidate.padLongitude)) {
      errors.push("padLongitude must be finite");
    } else if (candidate.padLongitude < -180 || candidate.padLongitude > 180) {
      errors.push("padLongitude out of range [-180,180]");
    }
  }

  return { valid: errors.length === 0, errors };
}

describe("Launch pin coordinate contract", () => {
  test("accepts valid pin-driving fields and ignores additive fields", () => {
    const compliant = {
      id: "launch-1",
      name: "Falcon 9",
      statusAbbrev: "Go",
      padLatitude: 28.5618571,
      padLongitude: -80.577366,
      additionalFutureField: "allowed",
    };

    const result = validatePinDrivingFields(compliant);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("fails on non-finite or out-of-range coordinates", () => {
    const invalid = {
      id: "launch-2",
      name: "Invalid Mission",
      statusAbbrev: "TBC",
      padLatitude: 100,
      padLongitude: Number.POSITIVE_INFINITY,
    };

    const result = validatePinDrivingFields(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("padLatitude out of range [-90,90]");
    expect(result.errors).toContain("padLongitude must be finite");
  });

  test("fails when required pin-driving fields are missing or invalid type", () => {
    const invalid = {
      id: "launch-3",
      statusAbbrev: 123,
      padLatitude: "28.5",
      padLongitude: -80,
    };

    const result = validatePinDrivingFields(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("missing required key: name");
    expect(result.errors).toContain("statusAbbrev must be string");
    expect(result.errors).toContain("padLatitude must be number");
  });
});
