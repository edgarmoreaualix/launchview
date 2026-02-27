import { useEffect, useMemo, useState } from 'react';
import { Globe } from './components/Globe';
import { LaunchDetailPanel } from './components/LaunchDetailPanel';
import { useLaunches } from './hooks/useLaunches';
import { useTrajectory } from './hooks/useTrajectory';

function getLaunchesStatusMessage(
  isLoading: boolean,
  error: string | null,
  launchesCount: number,
): { text: string; isError: boolean } {
  if (isLoading) {
    return { text: 'Loading launches...', isError: false };
  }

  if (error) {
    return { text: `Failed to load launch data. ${error}`, isError: true };
  }

  if (launchesCount === 0) {
    return { text: 'No launches found.', isError: false };
  }

  return { text: `Loaded ${launchesCount} launches.`, isError: false };
}

function getTrajectoryStatusMessage(status: 'idle' | 'invalid' | 'ready'): string {
  if (status === 'idle') {
    return 'Trajectory: select a launch to start animation.';
  }

  if (status === 'invalid') {
    return 'Trajectory: unavailable for selected launch coordinates.';
  }

  return 'Trajectory: animation active for selected launch.';
}

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
  const launchesStatus = getLaunchesStatusMessage(isLoading, error, data.length);

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
        <p className={`status-copy${launchesStatus.isError ? ' status-error' : ''}`}>
          {launchesStatus.text}
        </p>
        {!isLoading && !error ? (
          <p className="trajectory-status">{getTrajectoryStatusMessage(trajectoryStatus)}</p>
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
