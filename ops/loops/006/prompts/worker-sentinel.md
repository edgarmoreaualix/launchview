# Loop 006 Kickoff — worker-sentinel

Loop: 006  
Type: build

## Goal
Stand by; only intervene if orchestrator requests final cleanup after backend/frontend/qa outputs are in.

## Scope (owned files)
- `ops/loops/006/summaries/worker-sentinel.md`

## Do not modify
- `backend/**`
- `frontend/**`
- `tests/**`
- `shared/**`
- `ops/**` outside loop summary unless explicitly assigned

## Contract assumptions (frozen for this loop)
- No contract or behavior changes from sentinel by default.

## Done criteria
- Standby summary recorded.

## Validation command
- `echo "sentinel standby"`

## Commit guidance
- No commits expected unless explicitly tasked.
