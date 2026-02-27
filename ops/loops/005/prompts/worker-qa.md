# Loop 005 Kickoff — worker-qa (Support)

Loop: 005  
Type: sentinel

## Goal
Harden test quality architecture so core behavior tests validate production modules directly.

## Scope (owned files)
- `tests/**`
- `package.json` / `package-lock.json` (only if test tooling changes are required)
- `ops/loops/005/summaries/worker-qa.md`

## Do not modify
- `frontend/src/**`
- `backend/**`
- `shared/types.ts`
- non-Loop-005 `ops/**` artifacts

## Contract assumptions (frozen for this loop)
- Existing behavior is correct unless explicitly identified as bug.
- Focus is test integrity and maintainability, not adding product features.

## Priority tasks
1. Eliminate tests that reimplement production logic where a production utility can be imported.
2. Improve test clarity/consistency (naming, assertions, fixtures) with no behavior drift.
3. Ensure contract tests remain additive-field tolerant and required-field strict.

## Done criteria
- Core unit tests for pin/time/trajectory logic directly exercise production modules.
- Test suite remains green.
- Summary includes what anti-patterns were removed.

## Validation command
- `npm run test`

## Commit guidance
- Target 2-5 commits, each focused on one test area.
