# Ops

File-based orchestration bus for loop execution.

## Layout

```text
ops/
  bin/
    loop.sh
    watch-loop.sh
  config/
    workers.env.example
  personas/
    orchestrator-cto.md
    worker-backend.md
    worker-frontend.md
    worker-ux.md
  runtime/
    tmux.env.example
  loops/
    001/
      plan.md
      merge-review-input.md
      prompts/
      summaries/
      merges/
      status.json
```

## Config

1. Copy worker config:

```bash
cp ops/config/workers.env.example ops/config/workers.env
```

2. Optional supervised automation:

```bash
cp ops/runtime/tmux.env.example ops/runtime/tmux.env
```

## Commands

- `./ops/bin/loop.sh start <n>`
- `./ops/bin/loop.sh check <n>`
- `./ops/bin/loop.sh assemble <n>`
- `./ops/bin/watch-loop.sh run <n> [interval_seconds]`
- `./ops/bin/watch-loop.sh status <n>`

## Personas

Use `ops/personas/` as the default role system prompt library for orchestrator and workers.
