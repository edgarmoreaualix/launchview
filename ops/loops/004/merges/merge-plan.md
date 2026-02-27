# Merge Plan (Loop 004)

## Findings (ordered by severity)
1. **Medium — QA unit tests initially duplicated trajectory logic instead of validating production utilities**
   - Files: `tests/unit/trajectory.test.ts`, `tests/unit/useTrajectory.test.ts`
   - Issue: tests used local helper implementations; these could pass even if `frontend/src/utils/trajectory.ts` regressed.
   - Resolution: tests now import and exercise `createSyntheticTrajectory`, `hasValidLaunchCoordinates`, and `sampleTrajectoryPoint` directly from production code.
   - Status: fixed before merge.

## Scope compliance
- `worker-backend`: compliant (standby).
- `worker-frontend`: compliant (`frontend/src/**`).
- `worker-qa`: compliant (`tests/**`).
- `worker-sentinel`: compliant (standby summary only).

## Contract compliance
- `shared/types.ts` unchanged.
- Trajectory contracts (`LaunchTrajectory`, `TrajectoryPoint`) used consistently by frontend and tests.

## Validation gates
- `cd backend && npx tsc --noEmit` -> pass
- `npm run test` -> pass (40 tests)
- `cd frontend && npm run build` -> pass

## Merge order
1. worker-backend
2. worker-qa
3. worker-frontend
4. worker-sentinel

## Merge execution
- Worker commits are already linear on `main`; no branch conflict merge required.
- Additional review/fix commit applied for QA test alignment.

## Post-merge checklist
- [x] Selected launch trajectory animates with visible full path + active trail + marker.
- [x] Invalid coordinates degrade to stable non-crashing state.
- [x] QA tests assert production trajectory utility behavior.
- [x] Build/test/typecheck all green.

## Next-loop recommendation
- Proceed to Loop 005 (Sentinel Loop - Codebase Health).
