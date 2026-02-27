import type { Handler } from "@netlify/functions";

import { getLaunches } from "../services/launchService";
import type { LaunchSummary } from "../../shared/types";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
} as const;

function buildResponse(launches: LaunchSummary[], cacheControl: string) {
  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      "cache-control": cacheControl,
    },
    body: JSON.stringify(launches),
  };
}

export const handler: Handler = async () => {
  try {
    const launches = await getLaunches();
    return buildResponse(launches, "public, max-age=60");
  } catch {
    return buildResponse([], "no-store");
  }
};
