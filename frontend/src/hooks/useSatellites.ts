import { useEffect, useRef, useState } from 'react';
import type { SatelliteSummary, SatellitePosition } from '../../../shared/types';
import { fetchSatellites } from '../services/satelliteApi';
import { propagatePosition } from '../utils/satellite';

export interface UseSatellitesState {
  satellites: SatelliteSummary[];
  positions: Map<number, SatellitePosition>;
  isLoading: boolean;
  error: string | null;
}

const PROPAGATION_INTERVAL_MS = 3000;

export function useSatellites(enabled: boolean): UseSatellitesState {
  const [satellites, setSatellites] = useState<SatelliteSummary[]>([]);
  const [positions, setPositions] = useState<Map<number, SatellitePosition>>(
    () => new Map(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const satellitesRef = useRef<SatelliteSummary[]>([]);

  // Fetch TLE data when layer is enabled
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Skip if already loaded
    if (satellitesRef.current.length > 0) {
      return;
    }

    let isMounted = true;

    const loadSatellites = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchSatellites();

        if (!isMounted) {
          return;
        }

        setSatellites(data);
        satellitesRef.current = data;
      } catch (caughtError: unknown) {
        if (!isMounted) {
          return;
        }

        const message =
          caughtError instanceof Error
            ? caughtError.message
            : 'Failed to load satellites';
        setError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSatellites();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  // Propagation loop
  useEffect(() => {
    if (!enabled || satellitesRef.current.length === 0) {
      return;
    }

    const propagate = () => {
      const now = new Date();
      const newPositions = new Map<number, SatellitePosition>();

      for (const sat of satellitesRef.current) {
        const pos = propagatePosition(sat, now);
        if (pos) {
          newPositions.set(sat.noradId, pos);
        }
      }

      setPositions(newPositions);
    };

    // Propagate immediately
    propagate();

    const intervalId = window.setInterval(propagate, PROPAGATION_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, satellites]);

  return { satellites, positions, isLoading, error };
}
