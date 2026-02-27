# Loop 001 Kickoff — worker-frontend

Loop: 001  
Type: build

## Goal
Render a full-viewport Cesium globe and wire it to the launches API via a typed client + `useLaunches` hook in a dark baseline layout.

## Scope (owned files)
- `frontend/src/components/Globe.tsx`
- `frontend/src/services/launchApi.ts`
- `frontend/src/hooks/useLaunches.ts`
- `frontend/src/App.tsx` (integration only)
- `frontend/src/index.css` (layout/theme only)

## Do not modify
- `backend/**`
- `shared/**`
- `tests/**`
- `ops/**`
- `netlify.toml`

## Contract assumptions (frozen for this loop)
- Import domain contracts from `../../../shared/types` (for files under `frontend/src/**`).
- API contract: `GET /api/launches` returns `LaunchSummary[]`.
- Cesium token source is `import.meta.env.VITE_CESIUM_ION_TOKEN`; app must remain usable when token is empty (OSM fallback imagery).
- This loop is infra-only: render globe and fetch data; do not add launch pins yet (pins are Loop 002).

## Done criteria
- `Globe.tsx` renders Cesium `Viewer` full viewport with stable dark layout container.
- `launchApi.ts` fetches and validates launches payload shape at runtime minimally (array guard) before returning typed data.
- `useLaunches.ts` exposes loading/data/error state and calls API client once on mount.
- `App.tsx` integrates hook + globe without contract drift.
- Frontend builds successfully.

## Validation command
- `cd frontend && npm run build`

## Commit guidance
- Target 3-5 commits minimum.
- Suggested split:
  1. API client.
  2. Hook state handling.
  3. Globe component + app integration + styling.
- Keep commit scope frontend-only (example: `frontend: add useLaunches hook and API client`).
