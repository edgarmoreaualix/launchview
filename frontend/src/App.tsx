import { useEffect, useMemo, useState } from 'react';
import { Globe } from './components/Globe';
import { LaunchDetailPanel } from './components/LaunchDetailPanel';
import { useLaunches } from './hooks/useLaunches';
import { useTrajectory } from './hooks/useTrajectory';

function App() {
  const { data, isLoading, error } = useLaunches();
  const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);

  const selectedLaunch = useMemo(() => {
    if (!selectedLaunchId) {
      return null;
    }

    return data.find((launch) => launch.id === selectedLaunchId) ?? null;
  }, [data, selectedLaunchId]);
  const {
    trajectory,
    activePoint: trajectoryPoint,
    elapsedSeconds: trajectoryElapsedSeconds,
    status: trajectoryStatus,
  } = useTrajectory(selectedLaunch);

  useEffect(() => {
    if (!selectedLaunchId) {
      return;
    }

    const stillExists = data.some((launch) => launch.id === selectedLaunchId);
    if (!stillExists) {
      setSelectedLaunchId(null);
    }
  }, [data, selectedLaunchId]);

  return (
    <main className="app-root">
      <Globe
        launches={data}
        selectedLaunchId={selectedLaunchId}
        onSelectLaunch={setSelectedLaunchId}
        trajectory={trajectory}
        trajectoryPoint={trajectoryPoint}
        trajectoryElapsedSeconds={trajectoryElapsedSeconds}
      />
      <section className="status-panel" aria-live="polite">
        <h1 className="status-title">Launchview</h1>
        {isLoading ? (
          <p className="status-copy">Loading launches...</p>
        ) : null}
        {!isLoading && error ? (
          <p className="status-copy status-error">
            Failed to load launch data. {error}
          </p>
        ) : null}
        {!isLoading && !error && data.length === 0 ? (
          <p className="status-copy">No launches found.</p>
        ) : null}
        {!isLoading && !error && data.length > 0 ? (
          <p className="status-copy">Loaded {data.length} launches.</p>
        ) : null}
        {!isLoading && !error ? (
          <p className="trajectory-status">
            {trajectoryStatus === 'idle'
              ? 'Trajectory: select a launch to start animation.'
              : null}
            {trajectoryStatus === 'invalid'
              ? 'Trajectory: unavailable for selected launch coordinates.'
              : null}
            {trajectoryStatus === 'ready'
              ? 'Trajectory: animation active for selected launch.'
              : null}
          </p>
        ) : null}
      </section>
      <LaunchDetailPanel
        selectedLaunch={selectedLaunch}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
}

export default App;
