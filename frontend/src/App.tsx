import { useEffect, useMemo, useState } from 'react';
import { Globe } from './components/Globe';
import { LaunchDetailPanel } from './components/LaunchDetailPanel';
import { useLaunches } from './hooks/useLaunches';
import { useTrajectory } from './hooks/useTrajectory';
import { useWatchingCounter } from './hooks/useWatchingCounter';

function getLaunchesStatusMessage(
  isLoading: boolean,
  error: string | null,
  launchesCount: number,
): { text: string; tone: 'loading' | 'error' | 'empty' | 'ready' } {
  if (isLoading) {
    return { text: 'Loading live launch feed...', tone: 'loading' };
  }

  if (error) {
    return { text: `Launch API unavailable. ${error}`, tone: 'error' };
  }

  if (launchesCount === 0) {
    return { text: 'No upcoming launches are available right now.', tone: 'empty' };
  }

  return { text: `Tracking ${launchesCount} upcoming launches.`, tone: 'ready' };
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
  const [isMobileInfoVisible, setIsMobileInfoVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.innerWidth > 760;
  });

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
  const {
    count: watchingCount,
    isLoading: watchingLoading,
    isUpdating: isJoiningWatching,
    error: watchingError,
    joinWatching,
  } = useWatchingCounter(selectedLaunchId);
  const launchesStatus = getLaunchesStatusMessage(isLoading, error, data.length);

  useEffect(() => {
    if (!selectedLaunchId && data.length > 0) {
      setSelectedLaunchId(data[0].id);
      return;
    }

    if (!selectedLaunchId) {
      return;
    }

    const stillExists = data.some((launch) => launch.id === selectedLaunchId);
    if (!stillExists) {
      setSelectedLaunchId(null);
    }
  }, [data, selectedLaunchId]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 760px)');

    const applyViewportBehavior = (isMobile: boolean) => {
      setIsMobileInfoVisible(!isMobile);
    };

    applyViewportBehavior(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyViewportBehavior(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const panelVisibilityClass = isMobileInfoVisible ? 'panels-visible' : 'panels-hidden';

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
      <button
        type="button"
        className="mobile-info-toggle"
        onClick={() => {
          setIsMobileInfoVisible((previous) => !previous);
        }}
        aria-expanded={isMobileInfoVisible}
        aria-controls="launchview-status-panel launchview-detail-panel"
      >
        {isMobileInfoVisible ? 'Hide info' : 'Show info'}
      </button>
      <section
        id="launchview-status-panel"
        className={`status-panel ${panelVisibilityClass}`}
        aria-live="polite"
      >
        <h1 className="status-title">Launchview</h1>
        <p className={`status-copy status-${launchesStatus.tone}`}>
          {launchesStatus.text}
        </p>
        {!isLoading && !error && data.length > 0 ? (
          <p className="trajectory-status">{getTrajectoryStatusMessage(trajectoryStatus)}</p>
        ) : null}
      </section>
      <div id="launchview-detail-panel" className={`detail-panel-shell ${panelVisibilityClass}`}>
        <LaunchDetailPanel
          selectedLaunch={selectedLaunch}
          isLoading={isLoading}
          error={error}
          isEmpty={!isLoading && !error && data.length === 0}
          watchingCount={watchingCount}
          watchingLoading={watchingLoading}
          watchingError={watchingError}
          isJoiningWatching={isJoiningWatching}
          onJoinWatching={() => {
            void joinWatching();
          }}
        />
      </div>
    </main>
  );
}

export default App;
