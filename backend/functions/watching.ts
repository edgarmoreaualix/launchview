import type { Handler } from "@netlify/functions";

import type { WatchingCount } from "../../shared/types";
import {
  getWatchingCount,
  incrementWatchingCount,
  listWatchingCounts,
  resetWatchingCount,
} from "../services/watchingService";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
} as const;

function response(statusCode: number, payload: unknown) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  };
}

function isValidLaunchId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseBody(body: string | null): Record<string, unknown> {
  if (!body) {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body) as unknown;
  } catch {
    throw new SyntaxError("Invalid JSON body");
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Invalid JSON body");
  }

  return parsed as Record<string, unknown>;
}

function parseDelta(input: unknown): number {
  if (typeof input !== "number" || !Number.isFinite(input) || !Number.isInteger(input)) {
    return 1;
  }

  return input;
}

async function handleGet(launchId: string | null): Promise<ReturnType<typeof response>> {
  if (launchId) {
    const count: WatchingCount = await getWatchingCount(launchId);
    return response(200, count);
  }

  return response(200, await listWatchingCounts());
}

async function handlePost(
  launchId: string,
  body: Record<string, unknown>,
): Promise<ReturnType<typeof response>> {
  const delta = parseDelta(body.delta);
  const updated = await incrementWatchingCount(launchId, delta);
  return response(200, updated);
}

async function handleDelete(launchId: string): Promise<ReturnType<typeof response>> {
  const updated = await resetWatchingCount(launchId);
  return response(200, updated);
}

export const handler: Handler = async (event) => {
  const method = event.httpMethod.toUpperCase();
  const launchIdQuery = event.queryStringParameters?.launchId ?? null;

  try {
    if (method === "GET") {
      return await handleGet(launchIdQuery);
    }

    if (method === "POST") {
      const body = parseBody(event.body);
      const launchId = body.launchId ?? launchIdQuery;

      if (!isValidLaunchId(launchId)) {
        return response(400, { error: "launchId is required" });
      }

      return await handlePost(launchId, body);
    }

    if (method === "DELETE") {
      if (!isValidLaunchId(launchIdQuery)) {
        return response(400, { error: "launchId is required" });
      }

      return await handleDelete(launchIdQuery);
    }

    return response(405, { error: "Method not allowed" });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return response(400, { error: "Invalid JSON body" });
    }

    return response(500, { error: "Internal server error" });
  }
};
