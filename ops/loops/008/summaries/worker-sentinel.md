# Worker Sentinel Summary (Loop 008)

## Scope and constraints
- Prompt executed from main repo: `ops/loops/008/prompts/worker-sentinel.md`
- Sentinel loop is guidance-only; no runtime files changed.

## 3D asset risk checklist (size/perf/fallback)
- Bundle isolation: keep heavy 3D assets out of the initial app bundle; load models/textures lazily by route or user intent.
- Weight budget: define per-asset budgets (GLB + textures) and reject additions that exceed budget without explicit review.
- Compression expectations: prefer Draco/Meshopt-compressed geometry and KTX2/Basis textures where pipeline supports it.
- Draw-call and material pressure: high material count and unbatched meshes are likely FPS regressions on mid/low devices.
- Decode/parse overhead: compressed models can shift cost to CPU decode; test low-end mobile and throttled CPU profiles.
- Memory headroom: large textures plus multiple scene variants can trigger tab crashes on memory-constrained devices.
- Loading UX: provide deterministic fallback states (skeleton/poster/static image) for slow networks and model-load failures.
- Error boundaries: model-load failure should not block page render; ensure failure degrades to non-3D content.

## Licensing and provenance risks
- Source of truth per asset: record origin URL, author, license type, and retrieval date for every model/texture.
- Commercial-use verification: verify redistribution/commercial rights; many marketplace/community licenses are non-transferable or attribution-bound.
- Derivative obligations: edits/conversions (decimation, texture baking) may still require attribution and same-license compliance.
- Third-party contamination risk: avoid importing assets with unclear AI-training or copyright provenance.
- Auditability: store license/provenance metadata in-repo (or linked artifact registry) to support legal and customer due diligence.

## Fallback and deploy risk notes
- CDN/object-store mismatch: incorrect MIME/CORS/cache headers can cause silent model-load failures after deploy.
- Cache invalidation: stale manifest-to-asset references can break model URLs; use content hashing + atomic deploy patterns.
- Ad blocker/network policies: some corporate/firewalled networks block asset hosts; ensure fallback remains functional.
- Monitoring gap: if model load errors are not logged/alerted, failures will present as UX degradation only.
- Release gating: treat model-load success rate, median load time, and fallback-render success as deploy checks before broad rollout.
- Rollback readiness: keep a quick flag/config path to disable 3D rendering and force static fallback without full redeploy.

## Validation
- `echo "sentinel loop 008 3d-risk pass complete"`
