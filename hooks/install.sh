#!/bin/bash
#
# Install git hooks for claude-creative repo
#
# Run this after cloning to enable secret detection guardrails.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_DIR="$REPO_ROOT/.git/hooks"

echo "Installing git hooks for claude-creative..."

# Install pre-commit hook
if [ -f "$SCRIPT_DIR/pre-commit" ]; then
    cp "$SCRIPT_DIR/pre-commit" "$HOOKS_DIR/pre-commit"
    chmod +x "$HOOKS_DIR/pre-commit"
    echo "✅ Installed pre-commit hook (secret detection)"
else
    echo "❌ Error: pre-commit hook not found in $SCRIPT_DIR"
    exit 1
fi

echo ""
echo "Hooks installed successfully!"
echo ""
echo "The pre-commit hook will scan for secrets before each commit."
echo "This is a PUBLIC repo - any secrets would be exposed to the world."
