import { useEffect, useMemo, useState } from 'react';
import { Globe } from './components/Globe';
import { useLaunches } from './hooks/useLaunches';

function App() {
  const { data, isLoading, error } = useLaunches();
  const [selectedLaunchId, setSelectedLaunchId] = useState<string | null>(null);

  const selectedLaunch = useMemo(() => {
    if (!selectedLaunchId) {
      return null;
    }

    return data.find((launch) => launch.id === selectedLaunchId) ?? null;
  }, [data, selectedLaunchId]);

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
      </section>
      {selectedLaunch ? (
        <section className="selected-launch-panel" aria-live="polite">
          <h2 className="selected-launch-title">{selectedLaunch.name}</h2>
          <p className="selected-launch-copy">
            {selectedLaunch.statusName} ({selectedLaunch.statusAbbrev})
          </p>
          <p className="selected-launch-copy">
            {selectedLaunch.padName}, {selectedLaunch.locationName}
          </p>
        </section>
      ) : null}
    </main>
  );
}

export default App;
