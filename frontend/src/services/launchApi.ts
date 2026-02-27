import type { LaunchSummary } from '../../../shared/types';

const LAUNCHES_ENDPOINT = '/api/launches';

function isLaunchSummaryArray(value: unknown): value is LaunchSummary[] {
  return Array.isArray(value);
}

export async function fetchLaunches(): Promise<LaunchSummary[]> {
  const response = await fetch(LAUNCHES_ENDPOINT);

  if (!response.ok) {
    throw new Error(`Failed to fetch launches (${response.status})`);
  }

  const payload: unknown = await response.json();

  if (!isLaunchSummaryArray(payload)) {
    throw new Error('Invalid launches payload: expected an array');
  }

  return payload;
}
