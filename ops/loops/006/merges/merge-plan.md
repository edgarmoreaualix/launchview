# Merge Plan (Loop 006)

## Findings (ordered by severity)
1. **Medium — invalid JSON on `/api/watching` POST returned 500**
   - File: `backend/functions/watching.ts`
   - Issue: malformed JSON body surfaced as internal server error.
   - Resolution: return `400` with `Invalid JSON body` for syntax failures.
   - Status: fixed before merge.

2. **Medium — watching counter unit test initially duplicated behavior logic**
   - File: `tests/unit/watchingCounter.test.ts`
   - Issue: local helper logic could pass while production service diverged.
   - Resolution: tests now exercise production backend service functions directly.
   - Status: fixed before merge.

## Scope compliance
- `worker-backend`: compliant (`backend/**`).
- `worker-frontend`: compliant (`frontend/src/**`).
- `worker-qa`: compliant (`tests/**`).
- `worker-sentinel`: compliant (standby summary only).

## Contract compliance
- `shared/types.ts` unchanged.
- Watching counter uses `WatchingCount` consistently across backend/frontend/tests.
- Existing launch API contract unchanged.

## Validation gates
- `cd backend && npx tsc --noEmit` -> pass
- `npm run test` -> pass (47 tests)
- `cd frontend && npm run build` -> pass

## Merge order
1. worker-backend
2. worker-qa
3. worker-frontend
4. worker-sentinel

## Merge execution
- Worker commits are already linear on `main`; no branch conflict merge required.
- Merge-review fixes applied and validated.

## Post-merge deploy checklist
- [x] `/api/watching` supports get/increment/reset with contract-valid responses.
- [x] Frontend detail panel shows watching counter + join action with loading/error feedback.
- [x] Build/test/typecheck all green.
- [x] Loops 001-006 complete and merged.
