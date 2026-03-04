interface LayerToggleProps {
  showLaunches: boolean;
  showSatellites: boolean;
  onToggleLaunches: () => void;
  onToggleSatellites: () => void;
}

export function LayerToggle({
  showLaunches,
  showSatellites,
  onToggleLaunches,
  onToggleSatellites,
}: LayerToggleProps) {
  return (
    <div className="layer-toggle" role="group" aria-label="Map layers">
      <button
        type="button"
        className={`layer-button ${showLaunches ? 'layer-active' : ''}`}
        onClick={onToggleLaunches}
        aria-pressed={showLaunches}
      >
        Launches
      </button>
      <button
        type="button"
        className={`layer-button ${showSatellites ? 'layer-active' : ''}`}
        onClick={onToggleSatellites}
        aria-pressed={showSatellites}
      >
        Satellites
      </button>
    </div>
  );
}
