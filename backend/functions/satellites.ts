import type { Handler } from "@netlify/functions";

import {
  getSatellites,
  SatelliteServiceError,
} from "../services/satelliteService";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
} as const;

function buildSuccessResponse(body: string, cacheControl: string) {
  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      "cache-control": cacheControl,
    },
    body,
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
      error: { code, message },
    }),
  };
}

export const handler: Handler = async () => {
  try {
    const satellites = await getSatellites();
    return buildSuccessResponse(
      JSON.stringify(satellites),
      "public, max-age=3600",
    );
  } catch (error) {
    if (error instanceof SatelliteServiceError) {
      return buildErrorResponse(503, error.code, error.message);
    }
    return buildErrorResponse(500, "INTERNAL_ERROR", "Unexpected error");
  }
};
