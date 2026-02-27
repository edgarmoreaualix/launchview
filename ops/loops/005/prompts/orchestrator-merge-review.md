# Orchestrator Merge Review Prompt (Loop 005)

Loop: 005  
Type: sentinel

## Goal
Evaluate codebase-health cleanup for safety, entropy reduction, and zero behavior regressions.

## Inputs
- `ops/loops/005/merge-review-input.md`
- `ops/loops/005/summaries/worker-backend.md`
- `ops/loops/005/summaries/worker-frontend.md`
- `ops/loops/005/summaries/worker-qa.md`
- `ops/loops/005/summaries/worker-sentinel.md`

## Required checks
1. Scope compliance by worker.
2. No shared/API contract drift.
3. Cleanup commits are behavior-preserving.
4. QA test architecture improved (production-module testing vs duplicated helper logic).
5. Validation commands are green.

## Output
Write `ops/loops/005/merges/merge-plan.md` with:
- Findings by severity
- Exact merge sequence (backend -> qa -> frontend -> sentinel)
- Post-merge validation checklist
