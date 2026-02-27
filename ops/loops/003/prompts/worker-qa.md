# Loop 003 Kickoff — worker-qa

Loop: 003  
Type: build

## Goal
Add test coverage for countdown/time formatting and launch detail panel data shaping rules.

## Scope (owned files)
- `tests/unit/time.test.ts` (new)
- `tests/unit/countdown.test.ts` (new, utility-level)
- `tests/contracts/launchDetailPanel.contract.test.ts` (new)
- `tests/fixtures/launchDetail.ts` (new, if needed)
- `tests/setup.ts` (if needed)

## Do not modify
- `backend/**`
- `frontend/**` (read-only for behavior understanding)
- `shared/types.ts`
- `ops/**`

## Contract assumptions (frozen for this loop)
- Detail panel data source remains `LaunchSummary`.
- Countdown logic uses `launch.net` and current time; tests should pin time deterministically.
- Contract tests should tolerate additive fields while validating required detail/countdown-driving fields.

## Done criteria
- Tests cover countdown formatting for future, near-zero, and past launch times.
- Tests cover invalid or malformed `net` handling behavior.
- Contract tests validate required fields for detail panel rendering.
- `npm run test` passes.

## Validation command
- `npm run test`

## Commit guidance
- Target 2-4 commits with clear behavior-focused messages.
