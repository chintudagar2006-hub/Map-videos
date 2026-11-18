#!/usr/bin/env bash
# One-time setup (macOS or Linux). Run from the project root:  bash scripts/setup.sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
need() { command -v "$1" >/dev/null 2>&1 || { echo "MISSING: $1  ->  $2"; MISS=1; }; }
need node   "Mac: brew install node     | Linux: install Node.js 20+"
need python3 "Mac: brew install python  | Linux: apt install python3"
need ffmpeg "Mac: brew install ffmpeg   | Linux: apt install ffmpeg"
[ -n "$MISS" ] && { echo "Install the missing tools above, then run this again."; exit 1; }
echo "== node packages (renderer + map data)"
( cd kit/templates/threejs_film && npm install --no-audit --no-fund && npx playwright install chromium )
( cd kit/geo && npm install --no-audit --no-fund )
echo "== python packages (voice + sound)"
python3 -m pip install -q kokoro-onnx soundfile numpy scipy 2>/dev/null || python3 -m pip install -q --break-system-packages kokoro-onnx soundfile numpy scipy
echo "== Kokoro voice model (~340 MB, once)"
mkdir -p kit/voice/models
( cd kit/voice/models
  [ -f kokoro-v1.0.onnx ] || curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  [ -f voices-v1.0.bin ]  || curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin )
echo "SETUP DONE. Test:  bash scripts/render.sh episodes/globo"
