import type { SatelliteSummary } from '../../../shared/types';

const SATELLITES_ENDPOINT = '/api/satellites';

function isSatelliteSummaryArray(value: unknown): value is SatelliteSummary[] {
  return Array.isArray(value);
}

export async function fetchSatellites(): Promise<SatelliteSummary[]> {
  const response = await fetch(SATELLITES_ENDPOINT);

  if (!response.ok) {
    throw new Error(`Failed to fetch satellites (${response.status})`);
  }

  const payload: unknown = await response.json();

  if (!isSatelliteSummaryArray(payload)) {
    throw new Error('Invalid satellites payload: expected an array');
  }

  return payload;
}
