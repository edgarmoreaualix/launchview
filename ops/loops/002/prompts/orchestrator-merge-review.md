# Orchestrator Merge Review Prompt (Loop 002)

Loop: 002  
Type: build

## Goal
Review Loop 002 outputs for pin-rendering correctness, scope compliance, and safe merge sequence.

## Inputs
- `ops/loops/002/merge-review-input.md`
- `ops/loops/002/summaries/worker-backend.md`
- `ops/loops/002/summaries/worker-frontend.md`
- `ops/loops/002/summaries/worker-qa.md`
- `ops/loops/002/summaries/worker-sentinel.md`

## Required checks
1. Worker scope compliance.
2. No shared contract drift from `shared/types.ts`.
3. Frontend pin behavior validated (invalid coordinate handling + selection wiring).
4. QA tests align with implemented pin-mapping behavior.
5. Backend remained standby unless blocker justified change.

## Output
Write `ops/loops/002/merges/merge-plan.md` containing:
- Findings by severity (if any).
- Exact merge commands/order (backend -> qa -> frontend -> sentinel).
- Post-merge validation checklist and expected outcomes.
