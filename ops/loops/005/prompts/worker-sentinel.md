# Loop 005 Kickoff — worker-sentinel (Lead)

Loop: 005  
Type: sentinel

## Goal
Lead a codebase-health pass: reduce entropy, standardize patterns, and harden quality checks without changing product behavior.

## Scope (owned files)
- `frontend/src/**` (cleanup/refactor only)
- `backend/**` (cleanup/refactor only)
- `tests/**` (test architecture cleanup only)
- `package.json` / `package-lock.json` (only if needed for quality tooling)
- `ops/loops/005/summaries/worker-sentinel.md`

## Do not modify
- `shared/types.ts` contract shapes
- `data/**`
- prior loop artifacts (`ops/loops/001-004/**`)

## Contract assumptions (frozen for this loop)
- No API/contract behavior changes.
- No visual feature additions.
- Refactors must preserve runtime behavior.

## Priority tasks
1. Remove dead code/unused imports and normalize obvious naming/style inconsistencies.
2. Identify duplicated logic hotspots and apply low-risk consolidation.
3. Add/adjust lightweight safeguards that prevent QA test anti-patterns (tests duplicating production logic instead of importing production modules).
4. Keep all changes small, reviewable, and behavior-preserving.

## Done criteria
- Cleanup/refactor commits are scoped and low-risk.
- Build/test/typecheck all pass after cleanup.
- Summary includes concrete entropy reductions and any deferred risks.

## Validation command
- `cd backend && npx tsc --noEmit && cd ../frontend && npm run build && cd .. && npm run test`

## Commit guidance
- Target 3-8 commits.
- One logical cleanup per commit; avoid mega-commit.
