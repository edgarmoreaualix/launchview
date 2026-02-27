import { Globe } from './components/Globe';
import { useLaunches } from './hooks/useLaunches';

function App() {
  const { data, isLoading, error } = useLaunches();

  return (
    <main className="app-root">
      <Globe />
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
    </main>
  );
}

export default App;
