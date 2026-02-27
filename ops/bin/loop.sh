#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORKER_CFG="$ROOT_DIR/ops/config/workers.env"
WORKER_CFG_EXAMPLE="$ROOT_DIR/ops/config/workers.env.example"

usage() {
  cat <<'EOF'
Usage:
  ./ops/bin/loop.sh start <loop_number>
  ./ops/bin/loop.sh check <loop_number>
  ./ops/bin/loop.sh assemble <loop_number>

Commands:
  start     Create loop artifact skeleton under ops/loops/NNN
  check     Show loop file presence/status summary
  assemble  Build merge-review-input.md from worker summaries
EOF
}

require_arg() {
  if [[ $# -lt 1 || -z "${1:-}" ]]; then
    usage
    exit 1
  fi
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
  if [[ -z "$raw" ]]; then
    echo "WORKER_SLUGS is empty in $cfg_file" >&2
    exit 1
  fi

  WORKERS=()
  IFS=',' read -r -a parts <<<"$raw"
  for w in "${parts[@]}"; do
    w="$(trim_spaces "$w")"
    [[ -n "$w" ]] && WORKERS+=("$w")
  done

  if [[ ${#WORKERS[@]} -eq 0 ]]; then
    echo "No workers resolved from WORKER_SLUGS in $cfg_file" >&2
    exit 1
  fi
}

pad_loop() {
  printf "%03d" "$1"
}

loop_dir() {
  local loop_num="$1"
  printf "%s/ops/loops/%s" "$ROOT_DIR" "$(pad_loop "$loop_num")"
}

write_if_missing() {
  local path="$1"
  local content="$2"
  if [[ ! -e "$path" ]]; then
    printf "%s" "$content" >"$path"
  fi
}

humanize_slug() {
  local slug="$1"
  local out
  out="$(echo "$slug" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)}; print}')"
  printf "%s" "$out"
}

cmd_start() {
  require_arg "$@"
  load_workers

  local loop_num="$1"
  local pad dir
  pad="$(pad_loop "$loop_num")"
  dir="$(loop_dir "$loop_num")"

  mkdir -p "$dir/prompts" "$dir/summaries" "$dir/merges"

  write_if_missing "$dir/plan.md" "# Loop $pad Plan"$'\n\n'"- Status: planned"$'\n'
  write_if_missing "$dir/merge-review-input.md" "# Loop $pad Merge Review Input"$'\n'
  write_if_missing "$dir/prompts/orchestrator-merge-review.md" "# Orchestrator Merge Review Prompt (Loop $pad)"$'\n'
  write_if_missing "$dir/merges/merge-plan.md" "# Merge Plan (Loop $pad)"$'\n'

  local worker
  for worker in "${WORKERS[@]}"; do
    local label
    label="$(humanize_slug "$worker")"
    write_if_missing "$dir/prompts/$worker.md" "# $label Prompt (Loop $pad)"$'\n'
    write_if_missing "$dir/summaries/$worker.md" "# $label Summary (Loop $pad)"$'\n'
  done

  {
    echo "{"
    echo "  \"loop\": $loop_num,"
    echo "  \"loop_padded\": \"$pad\","
    echo "  \"status\": \"planned\","
    echo "  \"workers\": ["
    local i
    for i in "${!WORKERS[@]}"; do
      local comma=""
      [[ "$i" -lt $((${#WORKERS[@]} - 1)) ]] && comma=","
      echo "    \"${WORKERS[$i]}\"$comma"
    done
    echo "  ],"
    echo "  \"artifacts\": {"
    echo "    \"prompts_generated\": false,"
    echo "    \"summaries_ready\": false,"
    echo "    \"merge_plan_ready\": false,"
    echo "    \"merged\": false"
    echo "  }"
    echo "}"
  } >"$dir/status.json"

  echo "Created loop skeleton: ${dir#$ROOT_DIR/}"
  echo "Workers: ${WORKERS[*]}"
}

file_state() {
  local path="$1"
  if [[ -s "$path" ]]; then
    echo "present"
  elif [[ -e "$path" ]]; then
    echo "empty"
  else
    echo "missing"
  fi
}

cmd_check() {
  require_arg "$@"
  load_workers

  local loop_num="$1"
  local dir
  dir="$(loop_dir "$loop_num")"

  if [[ ! -d "$dir" ]]; then
    echo "Loop directory not found: ${dir#$ROOT_DIR/}"
    exit 1
  fi

  echo "Loop: ${dir#$ROOT_DIR/}"
  [[ -f "$dir/status.json" ]] && echo "status.json: present" || echo "status.json: missing"

  echo
  echo "Prompts:"
  local worker
  for worker in "${WORKERS[@]}"; do
    printf "  %-30s %s\n" "$worker.md" "$(file_state "$dir/prompts/$worker.md")"
  done
  printf "  %-30s %s\n" "orchestrator-merge-review.md" "$(file_state "$dir/prompts/orchestrator-merge-review.md")"

  echo
  echo "Summaries:"
  for worker in "${WORKERS[@]}"; do
    printf "  %-30s %s\n" "$worker.md" "$(file_state "$dir/summaries/$worker.md")"
  done

  echo
  echo "Merge artifacts:"
  printf "  %-30s %s\n" "merge-review-input.md" "$(file_state "$dir/merge-review-input.md")"
  printf "  %-30s %s\n" "merges/merge-plan.md" "$(file_state "$dir/merges/merge-plan.md")"
}

cmd_assemble() {
  require_arg "$@"
  load_workers

  local loop_num="$1"
  local pad dir
  pad="$(pad_loop "$loop_num")"
  dir="$(loop_dir "$loop_num")"

  if [[ ! -d "$dir" ]]; then
    echo "Loop directory not found: ${dir#$ROOT_DIR/}"
    exit 1
  fi

  {
    echo "# Loop $pad Merge Review Input"
    echo
    local worker
    for worker in "${WORKERS[@]}"; do
      local label file
      label="$(humanize_slug "$worker")"
      file="$dir/summaries/$worker.md"
      echo "$label summary:"
      echo
      cat "$file" 2>/dev/null || true
      echo
    done
  } >"$dir/merge-review-input.md"

  echo "Assembled: ${dir#$ROOT_DIR/}/merge-review-input.md"
}

main() {
  if [[ $# -lt 1 ]]; then
    usage
    exit 1
  fi

  local cmd="$1"
  shift

  case "$cmd" in
    start) cmd_start "$@" ;;
    check) cmd_check "$@" ;;
    assemble) cmd_assemble "$@" ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
