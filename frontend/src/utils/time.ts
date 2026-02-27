export interface CountdownState {
  isValidTarget: boolean;
  isPast: boolean;
  diffMs: number;
}

export function parseIsoTimestamp(value: string): number | null {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function getCountdownState(targetTimestamp: number, nowTimestamp: number): CountdownState {
  const diffMs = targetTimestamp - nowTimestamp;
  return {
    isValidTarget: Number.isFinite(targetTimestamp),
    isPast: diffMs < 0,
    diffMs,
  };
}

export function formatCountdown(diffMs: number): string {
  const totalSeconds = Math.floor(Math.abs(diffMs) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const dayPrefix = `${days} `;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${dayPrefix}${hh}:${mm}:${ss}`;
}

export function formatNetTime(value: string): string {
  const timestamp = parseIsoTimestamp(value);
  if (timestamp == null) {
    return 'NET unavailable';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZoneName: 'short',
  }).format(new Date(timestamp));
}
