#!/usr/bin/env bash
# Resumable render for slow CPU machines (Codex cloud):  bash scripts/render_chunks.sh episodes/<name> [chunk=150]
# Renders out/chunks/c_XXXXX.mp4 one by one (skips chunks that already exist), then joins + adds sound/mix.wav.
# If the task stops halfway, run the same command again: it continues where it stopped.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; EP="$(cd "$1" && pwd)"; CH="${2:-150}"; KIT="$ROOT/kit"; R="$KIT/templates/threejs_film/render.mjs"
cd "$EP"; [ -f out/plan/camera_baked.json ] || { python3 gen_film.py; python3 "$KIT/tools/film_plan.py" bake film.json; }
[ -f sound/mix.wav ] || { ffmpeg -v error -y -i voice/voice.wav -ar 48000 voice/voice48.wav; python3 sound.py; }
END=$(python3 -c "import json;print(json.load(open('film.json'))['end'])"); mkdir -p out/chunks
for ((A=0; A<END; A+=CH)); do B=$((A+CH)); [ $B -gt $END ] && B=$END; F=out/chunks/c_$(printf %05d $A).mp4
  [ -f "$F" ] && continue; echo "frames $A-$B / $END"
  node "$R" film.json --animatic --scale 1 --from $A --to $B --silent --out "$F.tmp.mp4" --puppets "$KIT/puppets" && mv "$F.tmp.mp4" "$F"; done
ls out/chunks/c_*.mp4 | sort | sed "s#^out/chunks/#file '#; s#\$#'#" > out/chunks/list.txt
NAME=$(basename "$EP")
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i sound/mix.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "out/${NAME}_final.mp4"
ffmpeg -v error -y -i "out/${NAME}_final.mp4" -c:v libx264 -crf 23 -c:a copy -movflags +faststart "out/${NAME}_upload.mp4"
echo "DONE -> $EP/out/${NAME}_final.mp4"
