# Loop 002 Kickoff — worker-frontend

Loop: 002  
Type: build

## Goal
Render launch pins on the Cesium globe from `LaunchSummary[]`, with deterministic styling and click selection wiring.

## Scope (owned files)
- `frontend/src/components/Globe.tsx`
- `frontend/src/components/LaunchPins.tsx` (new)
- `frontend/src/utils/launchPins.ts` (new)
- `frontend/src/App.tsx` (integration only)
- `frontend/src/index.css` (only styles needed for pins/selection UI)

## Do not modify
- `backend/**`
- `tests/**`
- `shared/**`
- `ops/**`
- `netlify.toml`

## Contract assumptions (frozen for this loop)
- Input data contract is `LaunchSummary[]` from `shared/types.ts`.
- `padLatitude` / `padLongitude` are numeric in payload but may still be non-finite or out of range; filter invalid coordinates before rendering.
- No launch detail panel implementation in this loop (reserved for Loop 003).
- No trajectory/trail logic in this loop (reserved for Loop 004).

## Done criteria
- Globe renders a pin entity for each launch with valid coordinates.
- Pin appearance is deterministic from launch status (color/icon sizing rules in one place).
- Clicking a pin updates selected launch id in app state and shows a compact selected-launch summary overlay.
- Pins do not crash rendering when data array is empty or contains invalid coordinates.
- Frontend build passes.

## Validation command
- `cd frontend && npm run build`

## Commit guidance
- Target 3-6 commits.
- Suggested split:
  1. Add pin mapping utility (filter + style derivation).
  2. Add pin rendering component.
  3. Integrate selection state in `App`/`Globe` + styling.
- Keep scope strictly frontend.
