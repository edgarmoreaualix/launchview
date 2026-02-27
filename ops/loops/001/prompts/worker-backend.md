# Loop 001 Kickoff — worker-backend

Loop: 001  
Type: build

## Goal
Implement launch ingestion for Launch Library 2 and expose `GET /api/launches` as `LaunchSummary[]` with TTL caching and dev fallback.

## Scope (owned files)
- `backend/services/launchService.ts`
- `backend/utils/cache.ts`
- `backend/functions/launches.ts`

## Do not modify
- `frontend/**`
- `tests/**`
- `shared/types.ts` (contracts are frozen)
- `ops/**`
- `netlify.toml`

## Contract assumptions (frozen for this loop)
- Import contracts from `../../shared/types` only; do not redefine interfaces.
- Upstream launch payload shape is `LL2Launch`; downstream API payload is `LaunchSummary[]`.
- Endpoint contract: `GET /api/launches` responds JSON array of `LaunchSummary`.
- `padLatitude` and `padLongitude` in `LaunchSummary` are numbers parsed from LL2 string coordinates.
- `webcastUrl` is the highest-priority URL when available, otherwise `null`.
- Use `data/mock-launches.json` as fallback when LL2 fetch fails or when explicitly in local/dev mode.

## Done criteria
- LL2 fetch service implemented with transformation `LL2Launch -> LaunchSummary`.
- In-memory TTL cache implemented and used by service/function.
- Netlify function `backend/functions/launches.ts` returns contract-valid JSON and handles errors safely.
- Fallback to `data/mock-launches.json` works without frontend changes.
- Code is typed and compiles with TypeScript.

## Validation command
- `cd backend && npx tsc --noEmit`

## Commit guidance
- Target 3-5 commits minimum.
- Suggested split:
  1. Add cache utility.
  2. Add launch service + transformer.
  3. Add Netlify function handler + fallback/error handling.
- Commit messages must state intent and boundary (example: `backend: add TTL cache utility for launch endpoint`).
