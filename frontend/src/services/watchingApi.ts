import type { WatchingCount } from '../../../shared/types';

const WATCHING_ENDPOINT = '/api/watching';

function isWatchingCount(payload: unknown): payload is WatchingCount {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  const candidate = payload as Partial<WatchingCount>;
  return (
    typeof candidate.launchId === 'string' &&
    candidate.launchId.length > 0 &&
    typeof candidate.count === 'number' &&
    Number.isFinite(candidate.count)
  );
}

async function parseWatchingResponse(response: Response): Promise<WatchingCount> {
  if (!response.ok) {
    throw new Error(`Watching request failed (${response.status})`);
  }

  const payload: unknown = await response.json();
  if (!isWatchingCount(payload)) {
    throw new Error('Invalid watching payload');
  }

  return payload;
}

export async function fetchWatchingCount(launchId: string): Promise<WatchingCount> {
  const response = await fetch(
    `${WATCHING_ENDPOINT}?launchId=${encodeURIComponent(launchId)}`,
    {
      method: 'GET',
    },
  );

  return parseWatchingResponse(response);
}

export async function incrementWatchingCount(
  launchId: string,
  delta = 1,
): Promise<WatchingCount> {
  const response = await fetch(WATCHING_ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      launchId,
      delta,
    }),
  });

  return parseWatchingResponse(response);
}
