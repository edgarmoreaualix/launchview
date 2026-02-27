# Merge Plan (Loop 003)

## Findings (ordered by severity)
1. **High — `formatNetTime` could throw at runtime in some Intl environments**
   - File: `frontend/src/utils/time.ts`
   - Issue: `Intl.DateTimeFormat` option combination triggered `TypeError: Invalid option` in test/runtime environment.
   - Impact: detail panel NET rendering could crash instead of degrading gracefully.
   - Resolution: wrapped formatter in `try/catch` with safe `toISOString()` fallback.
   - Status: fixed before merge.

2. **Medium — QA countdown/time tests did not initially exercise production utilities**
   - Files: `tests/unit/time.test.ts`, `tests/unit/countdown.test.ts`
   - Issue: tests reimplemented time/countdown logic locally, allowing production regressions to slip through.
   - Resolution: tests now import and assert `parseIsoTimestamp`, `getCountdownState`, `formatCountdown`, and `formatNetTime` from production utility module.
   - Status: fixed before merge.

## Scope compliance
- `worker-backend`: compliant (standby, no source changes).
- `worker-frontend`: compliant (`frontend/src/**`).
- `worker-qa`: compliant (`tests/**`).
- `worker-sentinel`: compliant (standby summary only).

## Contract compliance
- `shared/types.ts` unchanged.
- No API contract drift detected.

## Validation gates
- `cd backend && npx tsc --noEmit` -> pass
- `npm run test` -> pass (29 tests)
- `cd frontend && npm run build` -> pass

## Merge order
1. worker-backend
2. worker-qa
3. worker-frontend
4. worker-sentinel

## Merge execution
- Worker commits are already linear on `main`; no branch merge conflict resolution required.
- Additional review/fix commit required and applied before push.

## Post-merge checklist
- [x] Detail panel handles loading/error/empty selection states.
- [x] Live countdown updates and handles future/past/invalid NET paths.
- [x] Time/countdown tests validate production utility behavior directly.
- [x] Build/test/typecheck all green.

## Next-loop recommendation
- Proceed to Loop 004: Trajectory Animation + Trail.
