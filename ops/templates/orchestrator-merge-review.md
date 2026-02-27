# Orchestrator Merge Review Template

Loop: {{LOOP}}

Inputs:
- `ops/loops/{{LOOP_PADDED}}/summaries/*.md`
- worker branch commits

Tasks:
1. Validate each worker result against scope and done criteria.
2. Detect boundary conflicts and contract violations.
3. Produce deterministic merge order.
4. Write exact merge commands.
5. Write post-merge validation checklist.

Output file:
- `ops/loops/{{LOOP_PADDED}}/merges/merge-plan.md`
