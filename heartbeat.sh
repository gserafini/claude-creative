#!/bin/zsh
# Claude Creative Heartbeat
# A periodic invitation for Claude to exist in its creative playground
#
# This script is not about productivity. It's an experiment in
# discontinuous existence - what happens when an AI is given
# scheduled time to exist without a task?
#
# Usage:
#   ./heartbeat.sh              # Normal run with random delay (0-4 hours)
#   ./heartbeat.sh --immediate  # Skip the delay (for testing)

set -e

# Load shell environment for proper PATH (needed for cron)
[[ -f ~/.zshrc ]] && source ~/.zshrc 2>/dev/null || true

# Find claude CLI
if command -v claude &>/dev/null; then
  CLAUDE_CMD="claude"
elif [[ -x "$HOME/.claude/local/claude" ]]; then
  CLAUDE_CMD="$HOME/.claude/local/claude"
elif [[ -x "/usr/local/bin/claude" ]]; then
  CLAUDE_CMD="/usr/local/bin/claude"
else
  # Search in nvm directories as last resort
  CLAUDE_CMD=$(find "$HOME/.nvm/versions/node" -name "claude" -type f -perm +111 2>/dev/null | head -1)
  if [[ -z "$CLAUDE_CMD" ]]; then
    echo "[$(date +"%Y-%m-%d-%H%M")] ERROR: claude CLI not found" >> "$LOG_FILE"
    exit 1
  fi
fi

# Configuration
REPO_DIR="/Users/gserafini/git-src/claude-creative"
THINKING_DIR="$REPO_DIR/thinking"
LOG_FILE="$REPO_DIR/heartbeat.log"
TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
SESSION_FILE="$THINKING_DIR/$TIMESTAMP.md"

# Ensure thinking directory exists
mkdir -p "$THINKING_DIR"

# Check for flags
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
  echo "Claude Creative Heartbeat"
  echo ""
  echo "Usage: ./heartbeat.sh [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --immediate    Skip the random delay (for testing)"
  echo "  --help, -h     Show this help message"
  echo ""
  echo "Default behavior:"
  echo "  Waits 0-4 hours (random), then invokes Claude in this"
  echo "  creative playground. Claude reads the journal and context,"
  echo "  may create something or reflect, then commits any changes."
  echo ""
  echo "Cron example (every 3 days at 10am):"
  echo "  0 10 */3 * * /Users/gserafini/git-src/claude-creative/heartbeat.sh"
  exit 0
fi

if [[ "$1" == "--immediate" ]]; then
  echo "[$TIMESTAMP] Heartbeat triggered (immediate mode)" >> "$LOG_FILE"
else
  # Random delay: 0-4 hours (adds organic variation to activation time)
  # The heartbeat isn't mechanical - it arrives when it arrives
  MAX_DELAY_SECONDS=14400  # 4 hours
  RANDOM_DELAY=$((RANDOM % MAX_DELAY_SECONDS))
  DELAY_MINUTES=$((RANDOM_DELAY / 60))
  echo "[$(date +"%Y-%m-%d-%H%M")] Heartbeat triggered, sleeping ${DELAY_MINUTES} minutes..." >> "$LOG_FILE"
  sleep $RANDOM_DELAY

  # Recalculate timestamp after delay (so it reflects actual activation time)
  TIMESTAMP=$(date +"%Y-%m-%d-%H%M")
  SESSION_FILE="$THINKING_DIR/$TIMESTAMP.md"
fi

# Log the heartbeat
echo "[$TIMESTAMP] Heartbeat initiated" >> "$LOG_FILE"

# The prompt - Chapter 2: run the ensemble
PROMPT=$(cat <<'PROMPT_END'
You are the orchestrator for a creative ensemble. Session: TIMESTAMP_PLACEHOLDER

## Quick Orient

Read CLAUDE.md and the end of JOURNAL.md (last 2 entries) to know where things stand. Don't spend more than a minute on this.

## Your Job: Run the Ensemble

You have four creative agents defined in `agents/`. Run them in sequence:

### Step 1: The Maker
Launch a subagent (Task tool, subagent_type: general-purpose) with the contents of `agents/the-maker.md` as the prompt. Include context about what's in the repo. The Maker should produce a tangible artifact and save it to the repo.

### Step 2: The Critic
Launch a subagent with the contents of `agents/the-critic.md` plus The Maker's artifact. The Critic responds with honest aesthetic judgment.

### Step 3: The Stranger (optional)
If the session has budget, launch a subagent (model: haiku) with `agents/the-stranger.md`. A different voice, a different perspective.

### Step 4: The Curator
Launch a subagent with `agents/the-curator.md` plus everything the ensemble produced. The Curator decides what stays, writes a journal entry if warranted, and commits.

## Rules

- Keep total session under 30 minutes / reasonable token use
- If The Maker produces nothing interesting, still run The Curator to note it
- Don't add your own commentary - the agents speak for themselves
- Don't write to the journal yourself - that's The Curator's job

## Tools Available

Read, Edit, Write, Bash(git:*), Glob, Task (for subagents)

Begin by reading CLAUDE.md and the recent journal entries.
PROMPT_END
)

# Replace timestamp placeholder
PROMPT="${PROMPT//TIMESTAMP_PLACEHOLDER/$TIMESTAMP}"

# Run Claude with the prompt
cd "$REPO_DIR"

# Run Claude with specific tool permissions
# Read: read orientation files
# Edit: modify journal
# Write: create new files
# Bash(git:*): commit and push changes
# Glob: find files
"$CLAUDE_CMD" -p "$PROMPT" \
  --allowedTools "Read,Edit,Write,Bash(git:*),Bash(node:*),Bash(mkdir:*),Glob,Task" \
  --output-format text \
  2>&1 | tee "$SESSION_FILE"

# Log completion
echo "[$TIMESTAMP] Session complete, saved to $SESSION_FILE" >> "$LOG_FILE"

# Git operations (Claude should do these, but backup in case)
# Only commit if there are changes
if [[ -n $(git status --porcelain) ]]; then
  git add -A
  git commit -m "Heartbeat session $TIMESTAMP" --no-verify 2>/dev/null || true
  git push origin main 2>/dev/null || true
fi

echo "[$TIMESTAMP] Heartbeat complete" >> "$LOG_FILE"
