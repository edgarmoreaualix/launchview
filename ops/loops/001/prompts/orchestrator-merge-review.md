# Orchestrator Merge Review Prompt (Loop 001)

Loop: 001  
Type: build

## Goal
Review all worker outputs for scope compliance and integration safety, then produce merge commands and post-merge validation checklist.

## Inputs
- `ops/loops/001/merge-review-input.md`
- `ops/loops/001/summaries/worker-backend.md`
- `ops/loops/001/summaries/worker-frontend.md`
- `ops/loops/001/summaries/worker-qa.md`
- `ops/loops/001/summaries/worker-sentinel.md`

## Required checks
1. Scope compliance per worker (no boundary violations).
2. Contract compliance with `shared/types.ts` frozen interfaces.
3. Validation command evidence from each worker.
4. Merge risk callouts (runtime assumptions, payload mismatch, missing tests).

## Output
Write `ops/loops/001/merges/merge-plan.md` with:
- Ordered merge commands (backend -> qa -> frontend -> sentinel).
- Any stop conditions that require fix-before-merge.
- Post-merge validation checklist and expected outcomes.
