#!/usr/bin/env bash
# Runs ON THE SERVER after the code has been synced.
set -euo pipefail
cd "$(dirname "$0")/.."

# Node.js only exists inside the cPanel app's virtualenv; there is none on the bare SSH PATH.
ACTIVATE=$(ls -d "$HOME"/nodevenv/repo/quintin-uk-w3c-irc/*/bin/activate 2>/dev/null | head -1 || true)
if [ -n "${ACTIVATE:-}" ]; then
  echo "Activating Node.js virtualenv: $ACTIVATE"
  set +u
  # shellcheck disable=SC1090
  source "$ACTIVATE"
  set -u
else
  echo "ERROR: no cPanel Node.js virtualenv for repo/quintin-uk-w3c-irc. Create the Node.js app first."
  exit 1
fi
echo "Using node: $(command -v node) ($(node -v))"

npm install --omit=dev

if [ ! -f .env ]; then
  echo "ERROR: no .env on the server."
  exit 1
fi

# Passenger restarts the app on the next request after tmp/restart.txt is touched.
mkdir -p tmp
touch tmp/restart.txt
echo "Signalled Passenger restart via tmp/restart.txt"
