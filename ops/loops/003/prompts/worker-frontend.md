# Loop 003 Kickoff — worker-frontend

Loop: 003  
Type: build

## Goal
Implement selected launch detail panel with live countdown and launch metadata display, integrated with existing pin selection.

## Scope (owned files)
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/src/components/LaunchDetailPanel.tsx` (new)
- `frontend/src/components/Countdown.tsx` (new)
- `frontend/src/utils/time.ts` (new)
- `frontend/src/components/Globe.tsx` (integration only, if needed)

## Do not modify
- `backend/**`
- `tests/**`
- `shared/**`
- `ops/**`

## Contract assumptions (frozen for this loop)
- Selected launch source is existing `LaunchSummary` from `useLaunches` data.
- Countdown target is `launch.net` (ISO datetime string).
- If `net` is invalid or in the past, panel must degrade gracefully with explicit status text.
- No trajectory/trail features in this loop (reserved for Loop 004).

## Done criteria
- Detail panel shows at least: launch name, status, NET time, rocket, pad/location, mission snippet when available.
- Countdown updates live at least every second for selected launch.
- Countdown formatting is stable (`D HH:MM:SS` or `T-`/`T+` equivalent) and handles negative/past times.
- Panel works with empty selection, loading, and error states without runtime errors.
- Frontend build passes.

## Validation command
- `cd frontend && npm run build`

## Commit guidance
- Target 3-6 commits.
- Suggested split:
  1. Time/countdown utility and component.
  2. Launch detail panel component.
  3. App integration and style updates.
- Keep all work in frontend scope.
