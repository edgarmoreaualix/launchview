# Loop 006 Kickoff — worker-qa

Loop: 006  
Type: build

## Goal
Add test coverage for watching counter contract/logic and final integration guardrails.

## Scope (owned files)
- `tests/**`
- `package.json` / `package-lock.json` (only if tooling adjustment required)
- `ops/loops/006/summaries/worker-qa.md`

## Do not modify
- `backend/**`
- `frontend/**` (read-only for behavior understanding)
- `shared/types.ts`
- `ops/**` outside loop summary

## Contract assumptions (frozen for this loop)
- Watching counter shape is `WatchingCount`.
- Tests should assert additive-field tolerance and required-field strictness for watching contract.
- Keep test architecture guardrails intact (no duplicated production logic in tests).

## Done criteria
- Unit/contract tests added for watching counter behavior and payload validity.
- Existing test suite remains green.

## Validation command
- `npm run test`

## Commit guidance
- Target 2-4 focused commits.
