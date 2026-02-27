# Multi-Agent Playbook

## The Team

### Orchestrator — "The Architect" (CTO)
- Decompose work into parallelizable tasks by boundary
- Freeze contracts before execution
- Assign explicit file ownership per loop
- Review worker outputs and plan merge order
- Schedule loop types: **build**, **sentinel**, or **hybrid**
- Run validation after each merge

### Worker: Backend — "The Foundation"
- Owns `backend/` domain, API logic, data layer
- Can propose contract updates in `shared/` (with approval)
- Does not modify `frontend/` directly
- Commits granularly: 3-5+ per loop

### Worker: Frontend — "The Interface"
- Owns `frontend/` integration and UI
- Consumes contracts from `shared/` (never redefines them)
- Does not modify `backend/` directly
- Handles loading/error/empty states by default
- Commits granularly: 3-5+ per loop

### Worker: QA — "The Gatekeeper"
- Owns test files and test utilities
- Tests contracts, not implementation details
- Covers edge cases, error paths, and regressions
- Provides pass/fail validation for merge review
- Commits granularly: 3-8 test commits per loop

### Worker: Sentinel — "The Guardian"
- Owns codebase health: cleanup, security, simplification
- Leads Sentinel loops (every 3-4 build loops)
- Deletes > Refactors > Adds (in that priority order)
- Each cleanup is its own atomic commit
- Targets 5-15 commits per Sentinel loop

## Rules

1. **Parallelize by boundary**, not by feature.
2. **One owner per file** during each loop window.
3. **Shared contract changes** require orchestrator approval.
4. **Merge one worker branch at a time**, in dependency order.
5. **Run validation after every merge.**
6. **Commit granularly** — one logical change per commit, clear messages.
7. **Sentinel loops every 3-4 build loops** (or sooner if entropy rises).

## Loop Types

### Build Loop
Standard feature/fix work. All workers execute in parallel on scoped tasks.
Workers commit 3-5+ times each. Target: 12-20 commits per loop.

### Sentinel Loop
Dedicated to codebase health. Sentinel leads, others assist.
Focus: delete dead code, simplify, harden security, normalize patterns.
Target: 15-30 cleanup commits per loop.

### Hybrid Loop
Build + targeted cleanup. Sentinel cleans non-contested areas while others build.
Target: 15-25 mixed commits per loop.

## Task Spec Template

Every worker prompt must include:

- **Goal** (one sentence, imperative)
- **Scope** (owned files/folders — exhaustive list)
- **Do not modify** (explicit exclusions)
- **Contract / inputs** (what to rely on)
- **Done criteria** (observable, testable)
- **Validation command** (how to verify)
- **Commit guidance** (granular, typed messages)

## Folder Ownership

| Folder | Default Owner | Purpose |
|--------|--------------|---------|
| `backend/` | Backend | APIs, services, domain logic |
| `frontend/` | Frontend | UI and client orchestration |
| `shared/` | Orchestrator (approval required) | Contracts and shared types |
| `data/` | Any (with assignment) | Fixtures, mocks, sample datasets |
| `docs/` | Any (with assignment) | Specs, architecture notes, QA checklists |
| `ops/` | Orchestrator | Loop artifacts, prompts, summaries, merge plans |
| `tests/` | QA | Test suites and test utilities |

## Loop Workflow

1. **Start** loop skeleton: `make loop-start N=<n>`
2. **Orchestrator** declares loop type and writes prompts to `ops/loops/<NNN>/prompts/`
3. **Watch** dispatches workers automatically: `make watch-run N=<n>`
4. **Workers** execute, commit granularly, write summaries to `ops/loops/<NNN>/summaries/`
5. **Assemble** summaries: `make loop-assemble N=<n>` (auto if using watch)
6. **Orchestrator** reviews and writes merge plan to `ops/loops/<NNN>/merges/merge-plan.md`
7. **Human** executes merges with validation checks
8. **Repeat** — next build loop, or Sentinel loop if due

## Velocity Targets

| Metric | Target |
|--------|--------|
| Loops per day | 8-12 |
| Commits per build loop | 12-20 |
| Commits per sentinel loop | 15-30 |
| Time per loop | 15-30 minutes |
| Rework rate | <10% of loops |
| Commits per day | 100-200+ |

## Merge Order (default)

1. Backend (foundational producer)
2. QA (test infrastructure)
3. Frontend (consumer/integrator)
4. Sentinel (cleanup — never breaks, always simplifies)
