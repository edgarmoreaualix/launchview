import type { Handler } from "@netlify/functions";

import { getLaunches } from "../services/launchService";
import type { LaunchSummary } from "../../shared/types";

export const handler: Handler = async () => {
  try {
    const launches = await getLaunches();

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, max-age=60",
      },
      body: JSON.stringify(launches),
    };
  } catch {
    const empty: LaunchSummary[] = [];

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
      body: JSON.stringify(empty),
    };
  }
};
