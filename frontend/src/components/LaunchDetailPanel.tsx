import type { LaunchSummary } from '../../../shared/types';
import { Countdown } from './Countdown';
import { formatNetTime, parseIsoTimestamp } from '../utils/time';

interface LaunchDetailPanelProps {
  selectedLaunch: LaunchSummary | null;
  isLoading: boolean;
  error: string | null;
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
    </section>
  );
}
