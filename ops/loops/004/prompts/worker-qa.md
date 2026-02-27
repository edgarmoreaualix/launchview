# Loop 004 Kickoff — worker-qa

Loop: 004  
Type: build

## Goal
Add test coverage for trajectory generation and animation-state progression.

## Scope (owned files)
- `tests/unit/trajectory.test.ts` (new)
- `tests/unit/useTrajectory.test.ts` (new, utility-level behavior)
- `tests/contracts/launchTrajectory.contract.test.ts` (new)
- `tests/fixtures/trajectory.ts` (new, if needed)
- `tests/setup.ts` (if needed)

## Do not modify
- `backend/**`
- `frontend/**` (read-only for behavior understanding)
- `shared/types.ts`
- `ops/**`

## Contract assumptions (frozen for this loop)
- Trajectory shape under test: `LaunchTrajectory` with ordered `TrajectoryPoint[]`.
- Coordinates must be finite and in valid lat/lon ranges.
- Time progression must be monotonic for trajectory points.

## Done criteria
- Tests cover trajectory generation validity and deterministic output properties.
- Tests cover animation progression logic (index advancement/time stepping).
- Contract tests validate required trajectory fields and reject malformed points.
- `npm run test` passes.

## Validation command
- `npm run test`

## Commit guidance
- Target 2-4 commits with behavior-specific messages.
