# Orchestrator Merge Review Prompt (Loop 003)

Loop: 003  
Type: build

## Goal
Review launch detail panel + countdown loop outputs for scope compliance, correctness, and merge safety.

## Inputs
- `ops/loops/003/merge-review-input.md`
- `ops/loops/003/summaries/worker-backend.md`
- `ops/loops/003/summaries/worker-frontend.md`
- `ops/loops/003/summaries/worker-qa.md`
- `ops/loops/003/summaries/worker-sentinel.md`

## Required checks
1. Scope compliance by worker.
2. No shared contract drift from `shared/types.ts`.
3. Countdown correctness under future/past/invalid NET conditions.
4. Detail panel behavior with empty selection and loading/error states.
5. QA coverage aligns to production countdown/detail logic.

## Output
Write `ops/loops/003/merges/merge-plan.md` with findings, merge sequence, and post-merge validation checklist.
