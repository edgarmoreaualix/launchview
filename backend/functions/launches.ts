import type { Handler } from "@netlify/functions";

import type { LaunchSummary } from "../../shared/types";
import {
  getLaunches,
  LaunchServiceError,
} from "../services/launchService";
import type {
  LaunchCacheStatus,
  LaunchDataSource,
  LaunchSourceMode,
} from "../services/launchService";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
} as const;

function buildSuccessResponse(
  launches: LaunchSummary[],
  source: LaunchDataSource,
  sourceMode: LaunchSourceMode,
  cacheStatus: LaunchCacheStatus,
  cacheControl: string,
) {
  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      "cache-control": cacheControl,
      "x-launch-source": source,
      "x-launch-source-mode": sourceMode,
      "x-launch-cache-status": cacheStatus,
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
    const { launches, source, sourceMode, cacheStatus } = await getLaunches();
    return buildSuccessResponse(
      launches,
      source,
      sourceMode,
      cacheStatus,
      "public, max-age=60",
    );
  } catch (error) {
    if (error instanceof LaunchServiceError) {
      return buildErrorResponse(503, error.code, error.message);
    }
    return buildErrorResponse(500, "INTERNAL_ERROR", "Unexpected error");
  }
};
