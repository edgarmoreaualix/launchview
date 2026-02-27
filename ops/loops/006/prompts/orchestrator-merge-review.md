# Orchestrator Merge Review Prompt (Loop 006)

Loop: 006  
Type: build

## Goal
Review final loop outputs for deploy readiness, contract integrity, and low-risk merge sequence.

## Inputs
- `ops/loops/006/merge-review-input.md`
- `ops/loops/006/summaries/worker-backend.md`
- `ops/loops/006/summaries/worker-frontend.md`
- `ops/loops/006/summaries/worker-qa.md`
- `ops/loops/006/summaries/worker-sentinel.md`

## Required checks
1. Scope compliance by worker.
2. No contract drift from `shared/types.ts`.
3. Watching counter end-to-end behavior (backend + frontend integration) verified.
4. QA coverage includes watching contract and behavior.
5. Build/test/typecheck gates all green.

## Output
Write `ops/loops/006/merges/merge-plan.md` with findings, merge order, and final post-merge deploy checklist.
