# Loop 001 Kickoff — worker-qa

Loop: 001  
Type: build

## Goal
Establish test infrastructure and contract-focused coverage for launch transformation and cache behavior.

## Scope (owned files)
- `package.json` (top-level: add vitest scripts/deps)
- `package-lock.json` (top-level, if generated)
- `tests/setup.ts`
- `tests/unit/launchService.test.ts`
- `tests/unit/cache.test.ts`
- `tests/contracts/**`
- `tests/fixtures/**` (if needed)

## Do not modify
- `backend/functions/**`
- `frontend/**`
- `shared/types.ts`
- `ops/**`

## Contract assumptions (frozen for this loop)
- Source contracts come from `shared/types.ts`; tests assert these shapes, never redefine them.
- Backend transform target is `LaunchSummary[]` derived from `LL2Launch` fixtures.
- Cache contract under test: TTL expiry and hit/miss semantics used by backend launch service.
- Contract tests should be resilient to additional fields but fail on missing/invalid required fields.

## Done criteria
- Vitest installed/configured at repo root and runnable via a top-level script.
- `tests/setup.ts` initializes shared test behavior (timers/mocks/helpers as needed).
- Unit tests cover:
  - LL2 -> LaunchSummary transformation edge cases.
  - Cache TTL/hit/miss/expiry behavior.
- Contract tests exist under `tests/contracts/` with representative fixtures.
- Test run passes locally.

## Validation command
- `npm run test`

## Commit guidance
- Target 3-5 commits minimum.
- Suggested split:
  1. Test runner setup.
  2. Cache unit tests.
  3. Transform + contract tests/fixtures.
- Use commit messages that state coverage intent (example: `qa: add LL2 to LaunchSummary contract tests`).
