import { useMemo } from 'react';
import type { SatelliteSummary, GroundTrackPoint } from '../../../shared/types';
import { computeGroundTrack } from '../utils/satellite';

const PAST_MINUTES = 45;
const FUTURE_MINUTES = 90;

export function useGroundTrack(
  satellite: SatelliteSummary | null,
): GroundTrackPoint[][] {
  return useMemo(() => {
    if (!satellite) {
      return [];
    }

    const now = new Date();
    const start = new Date(now.getTime() - PAST_MINUTES * 60 * 1000);
    const totalMinutes = PAST_MINUTES + FUTURE_MINUTES;

    return computeGroundTrack(satellite, start, totalMinutes);
  }, [satellite]);
}
