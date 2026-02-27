# Loop 006 Kickoff — worker-backend

Loop: 006  
Type: build

## Goal
Implement backend support for watching counter endpoints with in-memory storage suitable for current app scope.

## Scope (owned files)
- `backend/functions/**`
- `backend/services/**`
- `backend/utils/**`
- `ops/loops/006/summaries/worker-backend.md`

## Do not modify
- `frontend/**`
- `tests/**`
- `shared/types.ts` (contracts frozen)
- `ops/**` outside loop summary

## Contract assumptions (frozen for this loop)
- Use `WatchingCount` from `shared/types.ts`.
- Additive API only: do not change existing `/api/launches` behavior.
- Watching counter can be ephemeral (in-memory) for this loop; persistence not required.

## Done criteria
- Expose minimal endpoints for reading/updating watching counts (e.g. get and increment/reset semantics as designed).
- Responses typed and consistent with `WatchingCount` contract.
- Backend typecheck passes.

## Validation command
- `cd backend && npx tsc --noEmit`

## Commit guidance
- Target 2-5 focused commits.
