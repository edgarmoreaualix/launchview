# Loop 004 Kickoff — worker-frontend

Loop: 004  
Type: build

## Goal
Implement trajectory animation + trail visualization for selected launch on the globe.

## Scope (owned files)
- `frontend/src/components/Globe.tsx`
- `frontend/src/components/TrajectoryTrail.tsx` (new)
- `frontend/src/hooks/useTrajectory.ts` (new)
- `frontend/src/utils/trajectory.ts` (new)
- `frontend/src/App.tsx` (integration only)
- `frontend/src/index.css` (only styling needed for trajectory UI status)

## Do not modify
- `backend/**`
- `tests/**`
- `shared/**`
- `ops/**`

## Contract assumptions (frozen for this loop)
- Use shared trajectory contracts from `shared/types.ts` (`TrajectoryPoint`, `LaunchTrajectory`).
- Trajectory source may be synthetic/generated client-side for this loop; no backend dependency required.
- Animation activates only for selected launch.
- No watching-counter work in this loop (reserved for Loop 006).

## Done criteria
- Selected launch displays an animated marker moving along a trajectory path.
- A visible trail/path is rendered and updates deterministically.
- Empty/invalid trajectory data fails gracefully (no app crash).
- App remains responsive and frontend build passes.

## Validation command
- `cd frontend && npm run build`

## Commit guidance
- Target 3-6 commits.
- Suggested split:
  1. Trajectory generation/utilities.
  2. Animation hook/component.
  3. Globe/App integration + styling.
