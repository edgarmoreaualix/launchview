# Sentinel Loop Kickoff Template

Loop: {{LOOP}}
Type: sentinel

## Health Goals
{{HEALTH_GOALS}}

## Sentinel (Lead) Scope
- Full codebase audit using the Sentinel Audit Checklist
- Priority areas: {{PRIORITY_AREAS}}
- Target: 8-15 cleanup commits

## Support Workers

| Worker | Sentinel Task | Scope |
|--------|--------------|-------|
| worker-backend | {{BACKEND_CLEANUP}} | backend/ only |
| worker-frontend | {{FRONTEND_CLEANUP}} | frontend/ only |
| worker-qa | Test cleanup + coverage gaps | tests/ only |

## Rules
1. No functional changes — behavior must be identical before and after.
2. No contract changes.
3. Each cleanup is its own atomic commit.
4. Delete > Refactor > Add (in that priority order).
5. If cleanup requires a behavior change, defer to next build loop.

## Done Criteria
- All tests pass after every commit
- No new warnings introduced
- Lines of code decreased or unchanged
- Zero behavior changes

## Validation
- Run full test suite after each merge
- Verify no UI regressions (visual check)
- Verify all API endpoints return same responses
