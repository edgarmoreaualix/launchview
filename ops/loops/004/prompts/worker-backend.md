# Loop 004 Kickoff — worker-backend

Loop: 004  
Type: build

## Goal
Stay on standby unless frontend/qa reports a blocking data-contract issue for trajectory animation.

## Scope (owned files)
- `backend/services/**`
- `backend/functions/**`
- `backend/utils/**`

## Do not modify
- `frontend/**`
- `tests/**`
- `shared/types.ts`
- `ops/**`

## Contract assumptions (frozen for this loop)
- Frontend trajectory work consumes existing `LaunchSummary` and shared `LaunchTrajectory`/`TrajectoryPoint` types.
- No API contract or route changes authorized in this loop without orchestrator approval.

## Done criteria
- If no blocker exists: no backend code changes; summary reports standby.
- If blocker exists: minimal backend fix with no contract drift.

## Validation command
- `cd backend && npx tsc --noEmit`

## Commit guidance
- Preferred: zero commits.
- If fixing blocker: 1-2 focused commits.
