# Loop 006 Kickoff — worker-frontend

Loop: 006  
Type: build

## Goal
Integrate watching counter UX, apply final UI polish, and ensure deploy-ready frontend behavior.

## Scope (owned files)
- `frontend/src/**`
- `ops/loops/006/summaries/worker-frontend.md`

## Do not modify
- `backend/**`
- `tests/**`
- `shared/**`
- `ops/**` outside loop summary

## Contract assumptions (frozen for this loop)
- Watching counter contract uses `WatchingCount` shape from shared types.
- Existing launch, detail panel, and trajectory behavior must remain intact.
- No new major feature flows; this is integration + polish.

## Done criteria
- Selected launch displays watching count from backend endpoint.
- Clear user action path to increment/join watching for selected launch.
- UI polish pass applied (layout/readability/feedback states) without breaking existing interactions.
- Frontend build passes.

## Validation command
- `cd frontend && npm run build`

## Commit guidance
- Target 3-6 commits with clear integration/polish separation.
