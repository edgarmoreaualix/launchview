import type { Handler } from "@netlify/functions";

import { getLaunches } from "../services/launchService";
import type { LaunchSummary } from "../../shared/types";
import type { LaunchDataSource } from "../services/launchService";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
} as const;

function buildSuccessResponse(
  launches: LaunchSummary[],
  source: LaunchDataSource,
  cacheControl: string,
) {
  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      "cache-control": cacheControl,
      "x-launch-source": source,
    },
    body: JSON.stringify(launches),
  };
}

function buildErrorResponse(statusCode: number, code: string, message: string) {
  return {
    statusCode,
    headers: {
      ...JSON_HEADERS,
      "cache-control": "no-store",
    },
    body: JSON.stringify({
      ok: false,
      error: {
        code,
        message,
      },
    }),
  };
}

export const handler: Handler = async () => {
  try {
    const { launches, source } = await getLaunches();
    return buildSuccessResponse(launches, source, "public, max-age=60");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return buildErrorResponse(500, "LAUNCHES_FETCH_FAILED", message);
  }
};
