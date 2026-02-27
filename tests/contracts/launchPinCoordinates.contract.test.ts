import "../setup";

import { describe, expect, test } from "vitest";

import type { LaunchSummary } from "../../shared/types";
import { toLaunchPins } from "../../frontend/src/utils/launchPins";
import { hasValidLaunchCoordinates } from "../../frontend/src/utils/trajectory";
import { launchPinFixtures } from "../fixtures/launchPins";

const REQUIRED_PIN_FIELDS: Array<keyof LaunchSummary> = [
  "id",
  "name",
  "statusAbbrev",
  "padLatitude",
  "padLongitude",
];

function validatePinDrivingRequiredFields(value: unknown): {
  valid: boolean;
  errors: string[];
} {
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

  return { valid: errors.length === 0, errors };
}

describe("Launch pin coordinate contract", () => {
  test("accepts valid pin-driving fields and ignores additive fields", () => {
    const compliant: LaunchSummary & { additionalFutureField: string } = {
      ...launchPinFixtures[0],
      additionalFutureField: "allowed",
    };

    const requiredFieldResult = validatePinDrivingRequiredFields(compliant);
    expect(requiredFieldResult.valid).toBe(true);
    expect(requiredFieldResult.errors).toEqual([]);
    expect(hasValidLaunchCoordinates(compliant)).toBe(true);
    expect(toLaunchPins([compliant])).toHaveLength(1);
  });

  test("fails on non-finite or out-of-range coordinates", () => {
    const invalid: LaunchSummary = {
      ...launchPinFixtures[0],
      id: "invalid-coordinates",
      padLatitude: 100,
      padLongitude: Number.POSITIVE_INFINITY,
    };

    expect(hasValidLaunchCoordinates(invalid)).toBe(false);
    expect(toLaunchPins([invalid])).toHaveLength(0);
  });

  test("fails when required pin-driving fields are missing or invalid type", () => {
    const invalid = {
      id: "launch-3",
      statusAbbrev: 123,
      padLatitude: "28.5",
      padLongitude: -80,
    };

    const result = validatePinDrivingRequiredFields(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("missing required key: name");
    expect(result.errors).toContain("statusAbbrev must be string");
    expect(result.errors).toContain("padLatitude must be number");
  });
});
