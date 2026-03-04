import type { SatelliteSummary, SatellitePosition } from '../../../shared/types';

interface SatelliteDetailPanelProps {
  satellite: SatelliteSummary;
  position: SatellitePosition | null;
}

function formatAltitude(km: number): string {
  return `${Math.round(km).toLocaleString('en-US')} km`;
}

function formatSpeed(kmPerSec: number): string {
  return `${(kmPerSec).toFixed(1)} km/s`;
}

function formatCoord(value: number, posSuffix: string, negSuffix: string): string {
  const abs = Math.abs(value);
  const suffix = value >= 0 ? posSuffix : negSuffix;
  return `${abs.toFixed(2)}° ${suffix}`;
}

function formatCategory(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function SatelliteDetailPanel({
  satellite,
  position,
}: SatelliteDetailPanelProps) {
  return (
    <section className="detail-panel" aria-live="polite">
      <h2 className="detail-title">{satellite.name}</h2>
      <p className="satellite-category-badge">
        {formatCategory(satellite.category)}
      </p>
      <dl className="detail-grid">
        <div className="detail-row">
          <dt>NORAD ID</dt>
          <dd>{satellite.noradId}</dd>
        </div>
        <div className="detail-row">
          <dt>Country</dt>
          <dd>{satellite.country}</dd>
        </div>
        {position ? (
          <>
            <div className="detail-row">
              <dt>Altitude</dt>
              <dd>{formatAltitude(position.altitude)}</dd>
            </div>
            <div className="detail-row">
              <dt>Speed</dt>
              <dd>{formatSpeed(position.velocity)}</dd>
            </div>
            <div className="detail-row">
              <dt>Position</dt>
              <dd>
                {formatCoord(position.latitude, 'N', 'S')},{' '}
                {formatCoord(position.longitude, 'E', 'W')}
              </dd>
            </div>
          </>
        ) : null}
        <div className="detail-row">
          <dt>Inclination</dt>
          <dd>{satellite.inclination}°</dd>
        </div>
        <div className="detail-row">
          <dt>Period</dt>
          <dd>{satellite.period.toFixed(1)} min</dd>
        </div>
        <div className="detail-row">
          <dt>Apogee</dt>
          <dd>{formatAltitude(satellite.apogee)}</dd>
        </div>
        <div className="detail-row">
          <dt>Perigee</dt>
          <dd>{formatAltitude(satellite.perigee)}</dd>
        </div>
      </dl>
    </section>
  );
}
