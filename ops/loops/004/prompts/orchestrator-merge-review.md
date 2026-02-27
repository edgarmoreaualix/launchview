# Orchestrator Merge Review Prompt (Loop 004)

Loop: 004  
Type: build

## Goal
Review trajectory animation + trail outputs for correctness, scope compliance, and merge safety.

## Inputs
- `ops/loops/004/merge-review-input.md`
- `ops/loops/004/summaries/worker-backend.md`
- `ops/loops/004/summaries/worker-frontend.md`
- `ops/loops/004/summaries/worker-qa.md`
- `ops/loops/004/summaries/worker-sentinel.md`

## Required checks
1. Scope compliance by worker.
2. No shared contract drift from `shared/types.ts`.
3. Trajectory animation behavior is deterministic and resilient to invalid data.
4. QA tests validate production trajectory logic, not duplicated logic.
5. Backend remained standby unless blocker justified changes.

## Output
Write `ops/loops/004/merges/merge-plan.md` with findings, merge sequence, and post-merge validation checklist.
