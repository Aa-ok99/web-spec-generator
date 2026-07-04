#!/usr/bin/env bash
set -e

SKILL_NAME="web-spec-cloner"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$HOME/.opencode/skills/$SKILL_NAME"

echo "Installing Web Spec Cloner skill..."
echo ""

# Create skill directory
mkdir -p "$SKILL_DIR"

# Copy skill file
cp "$SCRIPT_DIR/web-spec-cloner.md" "$SKILL_DIR/SKILL.md"

echo "✓ Skill installed to $SKILL_DIR"
echo ""
echo "To use the skill, first start the server:"
echo "  cd $(dirname "$SCRIPT_DIR") && ./start.sh"
echo ""
echo "Then load the skill and tell the AI:"
echo "  \"วิเคราะห์เว็บ https://example.com\""
echo "  or"
echo "  \"Clone this website https://example.com\""
echo ""
