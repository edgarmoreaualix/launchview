# LaunchView

LaunchView is a 3D rocket launch visualizer built with React + Cesium.
It lets you explore upcoming launches on a globe, follow animated flight paths, and inspect mission details in a fast, interactive interface.

## Live Project

- Production: `https://launchview-20260227.netlify.app`

## What It Does

- Plots upcoming launch pads on a 3D Earth view
- Animates a launch trajectory from pad to flight arc
- Renders a rocket directly on the flight path (with fallback geometry)
- Shows mission details: status, NET, pad, rocket family, mission summary
- Runs a real-time countdown for the selected launch
- Includes a "watching now" counter with join action
- Supports mobile-first usage with an information panel toggle

## Visual Experience

- Global exploration view for all launch sites
- Automatic camera transition to the selected launch area
- In-flight trajectory marker and trail for motion clarity
- Atmospheric satellite imagery with fallback providers

## Tech Stack

- Frontend: React, TypeScript, Vite, Cesium, Resium
- Backend: Netlify Functions (TypeScript)
- Testing: Vitest
- Deployment: Netlify

## Project Structure

```text
frontend/   React + Cesium client
backend/    Netlify serverless API functions
shared/     Shared TypeScript contracts
data/       Mock launch data used by the API
tests/      Unit and contract tests
```

## API Endpoints

- `GET /api/launches`
  - Returns normalized launch summaries for the globe and details panel
- `GET /api/watching?launchId=<id>`
  - Returns current watching count for one launch
- `POST /api/watching`
  - Body: `{ "launchId": "...", "delta": 1 }`
  - Increments watching count

## Run Locally

```bash
npm install
npm run verify
netlify dev
```

Then open `http://127.0.0.1:8888`.

## Build and Quality

```bash
npm run verify
```

This runs:

- backend typecheck
- frontend production build
- full test suite

## Deployment

Production deploys to Netlify using `netlify.toml`.

```bash
netlify deploy --prod
```

