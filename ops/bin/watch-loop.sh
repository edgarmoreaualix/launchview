#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LOOP_BIN="$ROOT_DIR/ops/bin/loop.sh"
WORKER_CFG="$ROOT_DIR/ops/config/workers.env"
WORKER_CFG_EXAMPLE="$ROOT_DIR/ops/config/workers.env.example"

usage() {
  cat <<'EOF'
Usage:
  ./ops/bin/watch-loop.sh run <loop_number> [interval_seconds]
  ./ops/bin/watch-loop.sh tick <loop_number>
  ./ops/bin/watch-loop.sh status <loop_number>
  ./ops/bin/watch-loop.sh reset <loop_number>

Supervised automation (tmux):
- Auto-dispatches workers when prompts are ready
- Auto-assembles summaries and notifies orchestrator when summaries are ready
- Does NOT auto-merge
EOF
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing command: $1" >&2
    exit 1
  }
}

trim_spaces() {
  local value="$1"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf "%s" "$value"
}

load_workers() {
  local cfg_file="$WORKER_CFG"
  if [[ ! -f "$cfg_file" ]]; then
    cfg_file="$WORKER_CFG_EXAMPLE"
  fi
  # shellcheck disable=SC1090
  source "$cfg_file"
  local raw="${WORKER_SLUGS:-}"
  [[ -n "$raw" ]] || {
    echo "WORKER_SLUGS is empty in $cfg_file" >&2
    exit 1
  }
  WORKERS=()
  IFS=',' read -r -a parts <<<"$raw"
  for w in "${parts[@]}"; do
    w="$(trim_spaces "$w")"
    [[ -n "$w" ]] && WORKERS+=("$w")
  done
  [[ ${#WORKERS[@]} -gt 0 ]] || {
    echo "No workers resolved from WORKER_SLUGS in $cfg_file" >&2
    exit 1
  }
}

pad_loop() {
  printf "%03d" "$1"
}

loop_dir() {
  local loop_num="$1"
  printf "%s/ops/loops/%s" "$ROOT_DIR" "$(pad_loop "$loop_num")"
}

automation_dir() {
  local loop_num="$1"
  printf "%s/.automation" "$(loop_dir "$loop_num")"
}

load_tmux_env() {
  local env_file="$ROOT_DIR/ops/runtime/tmux.env"
  if [[ ! -f "$env_file" ]]; then
    echo "Missing $env_file (copy from ops/runtime/tmux.env.example)" >&2
    exit 1
  fi
  # shellcheck disable=SC1090
  source "$env_file"
  : "${TMUX_ORCH_PANE:?TMUX_ORCH_PANE is required}"
}

ensure_loop_exists() {
  local dir
  dir="$(loop_dir "$1")"
  [[ -d "$dir" ]] || {
    echo "Loop directory not found: ${dir#$ROOT_DIR/}" >&2
    exit 1
  }
}

ensure_automation_dirs() {
  mkdir -p "$(automation_dir "$1")/logs"
}

log_event() {
  local loop_num="$1"
  shift
  local logf msg
  logf="$(automation_dir "$loop_num")/events.log"
  msg="$*"
  printf "[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$msg" >>"$logf"
}

is_real_markdown() {
  local file="$1"
  [[ -f "$file" ]] || return 1
  local non_empty_lines
  non_empty_lines="$(awk 'NF { count++ } END { print count + 0 }' "$file")"
  # Skeleton files created by loop.sh are one-line headings. Treat files with
  # at least two non-empty lines as "real" content.
  [[ "${non_empty_lines:-0}" -ge 2 ]]
}

all_worker_prompts_ready() {
  local dir="$1"
  local worker
  for worker in "${WORKERS[@]}"; do
    is_real_markdown "$dir/prompts/$worker.md" || return 1
  done
  return 0
}

all_worker_summaries_ready() {
  local dir="$1"
  local worker
  for worker in "${WORKERS[@]}"; do
    is_real_markdown "$dir/summaries/$worker.md" || return 1
  done
  return 0
}

slug_to_env_var() {
  local slug="$1"
  local suffix
  suffix="$(echo "$slug" | tr '[:lower:]-' '[:upper:]_')"
  printf "TMUX_%s_PANE" "$suffix"
}

pane_for_worker() {
  local worker="$1"
  local var
  var="$(slug_to_env_var "$worker")"
  local pane="${!var:-}"
  if [[ -z "$pane" ]]; then
    echo "Missing pane mapping for $worker ($var) in ops/runtime/tmux.env" >&2
    return 1
  fi
  printf "%s" "$pane"
}

pane_current_command() {
  local pane="$1"
  tmux display-message -p -t "$pane" "#{pane_current_command}"
}

tmux_send() {
  local pane="$1"
  local msg="$2"
  tmux send-keys -t "$pane" "$msg" Enter
}

dispatch_workers() {
  local loop_num="$1"
  local dir lockf
  dir="$(loop_dir "$loop_num")"
  lockf="$(automation_dir "$loop_num")/workers-dispatched.lock"
  [[ -f "$lockf" ]] && return 0

  all_worker_prompts_ready "$dir" || return 0

  local worker pane rel_prompt rel_summary
  for worker in "${WORKERS[@]}"; do
    pane="$(pane_for_worker "$worker")" || return 1
    rel_prompt="ops/loops/$(pad_loop "$loop_num")/prompts/$worker.md"
    rel_summary="ops/loops/$(pad_loop "$loop_num")/summaries/$worker.md"
    tmux_send "$pane" "Read and execute \`$rel_prompt\`. When done: commit your work, write summary to \`$rel_summary\`, then report commit hash + one-line status."
    log_event "$loop_num" "Dispatched $worker prompt to pane $pane"
  done

  touch "$lockf"
  log_event "$loop_num" "Workers dispatched for loop $(pad_loop "$loop_num")"
}

dispatch_orchestrator_review() {
  local loop_num="$1"
  local dir lockf
  dir="$(loop_dir "$loop_num")"
  lockf="$(automation_dir "$loop_num")/orchestrator-review-dispatched.lock"
  [[ -f "$lockf" ]] && return 0

  all_worker_summaries_ready "$dir" || return 0

  "$LOOP_BIN" assemble "$loop_num" >/dev/null
  log_event "$loop_num" "Assembled merge-review input"

  tmux_send "$TMUX_ORCH_PANE" "Run merge review for loop $(pad_loop "$loop_num"). Read \`ops/loops/$(pad_loop "$loop_num")/merge-review-input.md\` and summaries, inspect worker commits, then write merge commands + validation checklist to \`ops/loops/$(pad_loop "$loop_num")/merges/merge-plan.md\`. Do not execute merges."
  touch "$lockf"
  log_event "$loop_num" "Dispatched orchestrator review to pane $TMUX_ORCH_PANE"
}

cmd_tick() {
  local loop_num="$1"
  load_workers
  ensure_loop_exists "$loop_num"
  require_cmd tmux
  load_tmux_env
  ensure_automation_dirs "$loop_num"

  dispatch_workers "$loop_num"
  dispatch_orchestrator_review "$loop_num"
}

cmd_run() {
  local loop_num="$1"
  local interval="${2:-3}"
  load_workers
  ensure_loop_exists "$loop_num"
  require_cmd tmux
  load_tmux_env
  ensure_automation_dirs "$loop_num"

  echo "Watching loop $(pad_loop "$loop_num") every ${interval}s (Ctrl-C to stop)"
  log_event "$loop_num" "Watcher started (interval=${interval}s)"
  while true; do
    dispatch_workers "$loop_num" || true
    dispatch_orchestrator_review "$loop_num" || true
    sleep "$interval"
  done
}

cmd_status() {
  local loop_num="$1"
  local dir
  dir="$(loop_dir "$loop_num")"
  ensure_loop_exists "$loop_num"
  local adir
  adir="$(automation_dir "$loop_num")"
  echo "Automation status for loop $(pad_loop "$loop_num")"
  [[ -f "$adir/workers-dispatched.lock" ]] && echo "- workers dispatch: done" || echo "- workers dispatch: pending"
  [[ -f "$adir/orchestrator-review-dispatched.lock" ]] && echo "- orchestrator review dispatch: done" || echo "- orchestrator review dispatch: pending"
  if [[ -f "$adir/events.log" ]]; then
    echo
    echo "Recent events:"
    tail -n 20 "$adir/events.log"
  fi

  load_workers

  echo
  echo "Worker state:"
  local worker prompt_file summary_file prompt_state summary_state
  for worker in "${WORKERS[@]}"; do
    prompt_file="$dir/prompts/$worker.md"
    summary_file="$dir/summaries/$worker.md"
    if is_real_markdown "$prompt_file"; then
      prompt_state="ready"
    else
      prompt_state="pending"
    fi
    if is_real_markdown "$summary_file"; then
      summary_state="ready"
    else
      summary_state="pending"
    fi
    echo "- $worker: prompt=$prompt_state summary=$summary_state"
  done

  if command -v tmux >/dev/null 2>&1 && [[ -f "$ROOT_DIR/ops/runtime/tmux.env" ]]; then
    load_tmux_env
    echo
    echo "Pane commands:"
    local pane cmd
    for worker in "${WORKERS[@]}"; do
      pane="$(pane_for_worker "$worker" 2>/dev/null || true)"
      if [[ -z "$pane" ]]; then
        echo "- $worker: pane=missing"
        continue
      fi
      cmd="$(pane_current_command "$pane" 2>/dev/null || echo unknown)"
      echo "- $worker: pane=$pane cmd=$cmd"
    done
    local orch_cmd
    orch_cmd="$(pane_current_command "$TMUX_ORCH_PANE" 2>/dev/null || echo unknown)"
    echo "- orchestrator: pane=$TMUX_ORCH_PANE cmd=$orch_cmd"
  fi
}

cmd_reset() {
  local loop_num="$1"
  ensure_loop_exists "$loop_num"
  local adir
  adir="$(automation_dir "$loop_num")"
  rm -f "$adir/workers-dispatched.lock" "$adir/orchestrator-review-dispatched.lock"
  echo "Reset automation locks for loop $(pad_loop "$loop_num")"
}

main() {
  if [[ $# -lt 2 ]]; then
    usage
    exit 1
  fi
  local cmd="$1"
  local loop_num="$2"
  case "$cmd" in
    run) shift 2; cmd_run "$loop_num" "${1:-3}" ;;
    tick) cmd_tick "$loop_num" ;;
    status) cmd_status "$loop_num" ;;
    reset) cmd_reset "$loop_num" ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
