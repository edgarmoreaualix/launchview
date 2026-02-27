import "../setup";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const FORBIDDEN_REIMPLEMENTATIONS = [
  "parseIsoTimestamp",
  "getCountdownState",
  "formatCountdown",
  "formatNetTime",
  "toLaunchPins",
  "hasValidLaunchCoordinates",
  "createSyntheticTrajectory",
  "sampleTrajectoryPoint",
] as const;

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const TESTS_ROOT = path.resolve(CURRENT_DIR, "..");

function hasForbiddenFunctionDefinition(source: string, functionName: string): boolean {
  const declarationPattern = new RegExp(`\\bfunction\\s+${functionName}\\s*\\(`);
  const arrowPattern = new RegExp(`\\b(?:const|let|var)\\s+${functionName}\\s*=\\s*(?:async\\s*)?\\(`);
  return declarationPattern.test(source) || arrowPattern.test(source);
}

async function findTestFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findTestFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith(".test.ts")) {
        return [fullPath];
      }
      return [];
    }),
  );
  return files.flat();
}

describe("test architecture contract", () => {
  test("does not reimplement production utility functions inside tests", async () => {
    const allTestFiles = await findTestFiles(TESTS_ROOT);
    const thisFile = fileURLToPath(import.meta.url);
    const candidateFiles = allTestFiles.filter((filePath) => filePath !== thisFile);

    const violations: string[] = [];

    for (const filePath of candidateFiles) {
      const source = await readFile(filePath, "utf8");
      for (const functionName of FORBIDDEN_REIMPLEMENTATIONS) {
        if (hasForbiddenFunctionDefinition(source, functionName)) {
          violations.push(`${path.relative(TESTS_ROOT, filePath)} defines ${functionName}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
