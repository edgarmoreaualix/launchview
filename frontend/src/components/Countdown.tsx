import { useEffect, useMemo, useState } from 'react';
import {
  formatCountdown,
  getCountdownState,
  parseIsoTimestamp,
} from '../utils/time';

interface CountdownProps {
  targetIso: string;
}

export function Countdown({ targetIso }: CountdownProps) {
  const targetTimestamp = useMemo(() => parseIsoTimestamp(targetIso), [targetIso]);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  if (targetTimestamp == null) {
    return <p className="countdown-status">Countdown unavailable: invalid NET</p>;
  }

  const countdownState = getCountdownState(targetTimestamp, nowTimestamp);
  const prefix = countdownState.isPast ? 'T+' : 'T-';

  return (
    <p className="countdown-status" aria-live="polite">
      {prefix} {formatCountdown(countdownState.diffMs)}
    </p>
  );
}
