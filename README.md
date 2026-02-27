# Agentic Starter

Reusable starter repo for multi-agent development teams. File-based orchestration, clear boundaries, high commit velocity.

## The Team

| Role | Slug | Persona | Focus |
|------|------|---------|-------|
| Orchestrator | `orchestrator` | The Architect | Plans, decomposes, reviews, merges |
| Backend | `worker-backend` | The Foundation | APIs, data, business logic |
| Frontend | `worker-frontend` | The Interface | UI, components, client state |
| QA | `worker-qa` | The Gatekeeper | Tests, validation, regression prevention |
| Sentinel | `worker-sentinel` | The Guardian | Cleanup, security, simplification |

## Structure

```text
.
├── MULTI_AGENT_PLAYBOOK.md      # Team rules and workflow
├── backend/                      # Backend (worker-backend owns)
├── frontend/                     # Frontend (worker-frontend owns)
├── shared/                       # Contracts (orchestrator approval required)
├── data/                         # Fixtures, mocks, datasets
├── docs/                         # Specs, architecture, checklists
└── ops/
    ├── personas/                 # Agent system prompts
    ├── templates/                # Kickoff and review templates
    ├── config/                   # Worker configuration
    ├── runtime/                  # tmux pane mapping
    ├── bin/                      # loop.sh, watch-loop.sh
    └── loops/                    # Loop artifacts (prompts, summaries, merges)
```

## Quickstart

```bash
# 1. Configure workers
cp ops/config/workers.env.example ops/config/workers.env

# 2. Configure tmux panes (optional, for automation)
cp ops/runtime/tmux.env.example ops/runtime/tmux.env

# 3. Start a loop
make loop-start N=1

# 4. Orchestrator writes prompts, then:
make watch-run N=1        # Auto-dispatches workers via tmux

# 5. Check status
make loop-check N=1

# 6. Assemble summaries for review
make loop-assemble N=1
```

## Loop Types

| Type | When | Commit Target |
|------|------|---------------|
| **Build** | Feature/fix work | 12-20 per loop |
| **Sentinel** | Every 3-4 build loops | 15-30 per loop |
| **Hybrid** | Build + adjacent cleanup | 15-25 per loop |

## Daily Workflow

1. `make loop-start N=1` — create loop skeleton
2. Orchestrator declares loop type and writes worker prompts
3. `make watch-run N=1` — auto-dispatch workers when prompts are ready
4. Workers execute, commit granularly, write summaries
5. Watch auto-assembles and notifies orchestrator when summaries are done
6. Orchestrator writes merge plan
7. Human executes merges with validation
8. Repeat (Sentinel loop every 3-4 build loops)

## Velocity Targets

- **8-12 loops/day** at 15-30 minutes each
- **12-20 commits per build loop** (3-5 per worker)
- **100-200+ commits/day**

## Why This Works

- Everything is auditable as plain files
- No external services, no databases
- Boundaries prevent merge conflicts
- Sentinel loops prevent entropy accumulation
- Granular commits = high throughput + easy rollback
- Scripts are small and easy to modify
