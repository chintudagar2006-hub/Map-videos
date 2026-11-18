#!/usr/bin/env bash
# Build and render one episode end to end:  bash scripts/render.sh episodes/<name> [--voice] [--stills]
#   --voice   regenerate voice/ from dialogue.json first (Kokoro)
#   --stills  only render check stills (out/stills) instead of the full video
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; EP="$(cd "$1" && pwd)"; shift || true
KIT="$ROOT/kit"; R="$KIT/templates/threejs_film/render.mjs"
# GPU on a Mac (Apple Silicon): Chrome via Metal. Linux servers without a GPU fall back to software WebGL.
if [ "$(uname)" = "Darwin" ]; then export CHROME_ARGS="${CHROME_ARGS:---use-angle=metal --ignore-gpu-blocklist --enable-gpu-rasterization}"; fi
cd "$EP"
if [[ " $* " == *" --voice "* ]] || [ ! -f voice/words.json ]; then echo "== voice"; python3 "$KIT/voice/make_voice.py" dialogue.json voice; fi
echo "== film plan"; python3 gen_film.py; python3 "$KIT/tools/film_plan.py" bake film.json | tail -1
if [[ " $* " == *" --stills "* ]]; then
  END=$(python3 -c "import json;print(json.load(open('film.json'))['end'])")
  FR=$(python3 -c "print(','.join(str(f) for f in range(30,$END,90)))")
  node "$R" film.json --frames "$FR" --scale .4 --puppets "$KIT/puppets"; echo "stills -> $EP/out/stills"; exit 0; fi
echo "== sound"; ffmpeg -v error -y -i voice/voice.wav -ar 48000 voice/voice48.wav; python3 sound.py
echo "== render (whole film)"; mkdir -p out
node "$R" film.json --animatic --scale 1 --silent --out out/video_silent.mp4 --puppets "$KIT/puppets"
NAME=$(basename "$EP")
ffmpeg -v error -y -i out/video_silent.mp4 -i sound/mix.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p \
  -c:a aac -b:a 192k -shortest -movflags +faststart "out/${NAME}_final.mp4"
ffmpeg -v error -y -i "out/${NAME}_final.mp4" -c:v libx264 -crf 23 -c:a copy -movflags +faststart "out/${NAME}_upload.mp4"
echo "DONE -> $EP/out/${NAME}_final.mp4  and  ${NAME}_upload.mp4"
