import type { LaunchSummary } from '../../../shared/types';
import { Countdown } from './Countdown';
import { formatNetTime, parseIsoTimestamp } from '../utils/time';

interface LaunchDetailPanelProps {
  selectedLaunch: LaunchSummary | null;
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  watchingCount: number | null;
  watchingLoading: boolean;
  watchingError: string | null;
  isJoiningWatching: boolean;
  onJoinWatching: () => void;
}

function trimMissionDescription(value: string | null): string {
  if (!value) {
    return 'Mission details unavailable.';
  }

  const compact = value.replace(/\s+/g, ' ').trim();
  if (compact.length <= 180) {
    return compact;
  }

  return `${compact.slice(0, 177)}...`;
}

export function LaunchDetailPanel({
  selectedLaunch,
  isLoading,
  error,
  isEmpty,
  watchingCount,
  watchingLoading,
  watchingError,
  isJoiningWatching,
  onJoinWatching,
}: LaunchDetailPanelProps) {
  if (isLoading) {
    return (
      <section className="detail-panel" aria-live="polite">
        <h2 className="detail-title">Launch details</h2>
        <p className="detail-copy">Loading launch details...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="detail-panel" aria-live="polite">
        <h2 className="detail-title">Launch details</h2>
        <p className="detail-copy detail-error">Unable to load launches: {error}</p>
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section className="detail-panel" aria-live="polite">
        <h2 className="detail-title">Launch details</h2>
        <p className="detail-copy">
          No launch entries are available yet. Check back later for newly scheduled missions.
        </p>
      </section>
    );
  }

  if (!selectedLaunch) {
    return (
      <section className="detail-panel" aria-live="polite">
        <h2 className="detail-title">Launch details</h2>
        <p className="detail-copy">Select a launch pin to view mission details.</p>
      </section>
    );
  }

  const hasValidNet = parseIsoTimestamp(selectedLaunch.net) !== null;

  return (
    <section className="detail-panel" aria-live="polite">
      <h2 className="detail-title">{selectedLaunch.name}</h2>
      {hasValidNet ? (
        <Countdown targetIso={selectedLaunch.net} />
      ) : (
        <p className="countdown-status">Countdown unavailable: invalid NET</p>
      )}
      <dl className="detail-grid">
        <div className="detail-row">
          <dt>Status</dt>
          <dd>
            {selectedLaunch.statusName} ({selectedLaunch.statusAbbrev})
          </dd>
        </div>
        <div className="detail-row">
          <dt>NET</dt>
          <dd>{formatNetTime(selectedLaunch.net)}</dd>
        </div>
        <div className="detail-row">
          <dt>Rocket</dt>
          <dd>
            {selectedLaunch.rocketName} ({selectedLaunch.rocketFamily})
          </dd>
        </div>
        <div className="detail-row">
          <dt>Pad</dt>
          <dd>
            {selectedLaunch.padName}, {selectedLaunch.locationName}
          </dd>
        </div>
        <div className="detail-row">
          <dt>Mission</dt>
          <dd>{trimMissionDescription(selectedLaunch.missionDescription)}</dd>
        </div>
      </dl>
      <div className="watching-block">
        <p className="watching-label">Watching now</p>
        <p className="watching-count" aria-live="polite">
          {watchingLoading
            ? 'Loading...'
            : watchingError
              ? 'Unavailable'
              : (watchingCount ?? 0).toLocaleString('en-US')}
        </p>
        {watchingError ? (
          <p className="watching-error">Unable to load count: {watchingError}</p>
        ) : null}
        <button
          type="button"
          className="watching-button"
          onClick={onJoinWatching}
          disabled={watchingLoading || isJoiningWatching}
        >
          {isJoiningWatching ? 'Joining...' : 'Join watching'}
        </button>
      </div>
    </section>
  );
}
