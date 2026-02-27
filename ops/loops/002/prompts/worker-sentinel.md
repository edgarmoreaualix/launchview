# Loop 002 Kickoff — worker-sentinel

Loop: 002  
Type: build

## Goal
Stand by for Loop 002; do not perform cleanup unless explicitly assigned by orchestrator.

## Scope (owned files)
- None by default.

## Do not modify
- `backend/**`
- `frontend/**`
- `tests/**`
- `shared/**`
- `ops/**`

## Contract assumptions (frozen for this loop)
- No contract or behavior changes authorized from Sentinel in this loop.

## Done criteria
- Record standby confirmation in summary only.

## Validation command
- `echo "sentinel standby"`

## Commit guidance
- No commits expected.
