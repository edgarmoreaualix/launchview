# LaunchView Release Runbook

## Scope
Final release process after Loops 001-006.

## Preconditions
- Branch: `main` clean and up to date.
- Netlify site linked and deploy permissions available.
- `frontend/.env` has `VITE_CESIUM_ION_TOKEN` (or intentional empty fallback).

## 1) Preflight Validation (must all pass)
From repo root:

```bash
cd /Users/edgarmoreau/100/launchview
cd backend && npx tsc --noEmit
cd ../frontend && npm run build
cd .. && npm run test
```

Expected:
- Backend typecheck exits `0`
- Frontend build exits `0`
- Tests pass (currently 47)

## 2) Local Smoke (Netlify dev)

```bash
cd /Users/edgarmoreau/100/launchview
netlify dev
```

In another terminal:

```bash
# Launches API
curl -sS http://127.0.0.1:8888/api/launches | jq 'length'

# Watching API: initial read
curl -sS "http://127.0.0.1:8888/api/watching?launchId=launch-1" | jq

# Watching API: increment
curl -sS -X POST http://127.0.0.1:8888/api/watching \
  -H 'content-type: application/json' \
  -d '{"launchId":"launch-1","delta":1}' | jq

# Watching API: invalid JSON should be 400
curl -sS -i -X POST http://127.0.0.1:8888/api/watching \
  -H 'content-type: application/json' \
  -d '{bad'
```

UI smoke at `http://127.0.0.1:8888`:
- Globe renders
- Pins selectable
- Detail panel + countdown updates
- Trajectory trail animates when selected
- Watching count loads and "Join watching" increments value

## 3) Deploy

### Option A: Netlify UI
- Push `main`
- Trigger deploy from latest commit

### Option B: Netlify CLI
```bash
cd /Users/edgarmoreau/100/launchview
netlify deploy --prod
```

## 4) Post-Deploy Verification
- `GET /api/launches` returns array payload
- `GET /api/watching?launchId=...` returns `{"launchId", "count"}`
- `POST /api/watching` increments and returns updated count
- Invalid JSON on `/api/watching` returns `400`
- Browser flow works on production URL (selection, countdown, trajectory, watching)

## 5) Rollback
If production regression is detected:
1. In Netlify UI, restore previous successful deploy.
2. Identify bad commit range:
   ```bash
   git log --oneline -n 20
   ```
3. Revert offending commit(s) on `main`:
   ```bash
   git revert <commit_sha>
   git push origin main
   ```
4. Re-run validation and verify production again.

## 6) Known Limitation
- Watching counters are currently in-memory and reset on cold start/redeploy.
- Next hardening step: persist counters in durable storage (e.g., Netlify Blobs/DB/Redis-equivalent).
