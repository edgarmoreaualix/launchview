# Orchestrator Kickoff Template

Loop: {{LOOP}}
Type: {{LOOP_TYPE}}  <!-- build | sentinel | hybrid -->

## Goal
{{GOAL}}

## Workers & Boundaries

| Worker | Owns | Do Not Modify |
|--------|------|---------------|
| worker-backend | {{BACKEND_SCOPE}} | frontend/, tests/ |
| worker-frontend | {{FRONTEND_SCOPE}} | backend/, shared/ |
| worker-qa | {{QA_SCOPE}} | backend/, frontend/ (source only) |
| worker-sentinel | {{SENTINEL_SCOPE}} | files owned by other workers this loop |

## Contracts (frozen for this loop)
{{CONTRACTS}}

## Rules
1. Do not edit outside assigned boundaries.
2. Raise contract changes before implementation.
3. Commit granularly — one logical change per commit.
4. Report commit hashes and summary on completion.
5. Target 3-5+ commits per worker minimum.

## Done Criteria
{{DONE_CRITERIA}}

## Validation
{{VALIDATION_CMD}}

## Merge Order
1. worker-backend
2. worker-qa
3. worker-frontend
4. worker-sentinel
