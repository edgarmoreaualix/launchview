# Loop 002 Kickoff — worker-qa

Loop: 002  
Type: build

## Goal
Add test coverage for launch pin mapping and coordinate validity handling to protect Loop 002 behavior.

## Scope (owned files)
- `tests/unit/launchPins.test.ts` (new)
- `tests/contracts/launchPinCoordinates.contract.test.ts` (new)
- `tests/fixtures/launchPins.ts` (new, if needed)
- `tests/setup.ts` (if needed)
- `package.json` / `package-lock.json` (only if test tooling adjustment is required)

## Do not modify
- `backend/**`
- `frontend/**` (except reading for behavior understanding)
- `shared/types.ts`
- `ops/**`

## Contract assumptions (frozen for this loop)
- Pin mapping consumes `LaunchSummary` contract from `shared/types.ts`.
- Valid renderable coordinates must be finite numbers and within lat `[-90, 90]`, lon `[-180, 180]`.
- Contract tests should tolerate additive fields but fail when required pin-driving fields are invalid.

## Done criteria
- Unit tests cover pin mapping behavior (filtering invalid coordinates, deterministic styling by status, stable output shape).
- Contract tests cover coordinate validity expectations for pin rendering inputs.
- `npm run test` passes.
- Test files are concise and isolated from Cesium runtime internals.

## Validation command
- `npm run test`

## Commit guidance
- Target 2-4 commits.
- Suggested split:
  1. Fixtures + unit tests.
  2. Contract tests + any setup adjustments.
- Messages should describe behavior guarded (example: `qa: cover pin coordinate filtering and status styling rules`).
