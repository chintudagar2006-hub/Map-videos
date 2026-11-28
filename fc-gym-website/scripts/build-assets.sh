#!/usr/bin/env bash
# Downloads the licensed Mixkit clips (Mixkit Free License: free for commercial use, no attribution required)
# and turns them into optimized, colour-graded web assets in public/media.
# Usage: bash scripts/build-assets.sh      (needs curl + ffmpeg)
set -euo pipefail
cd "$(dirname "$0")/.."
CACHE=.asset-cache; OUT=public/media
mkdir -p "$CACHE" "$OUT/seq/d" "$OUT/seq/m"

# id:resolution — see ASSET_CREDITS.md for titles and source pages
CLIPS="52094:1080 52088:1080 52080:1080 23056:720 40235:1080 4596:1080 52091:1080 23450:720 45874:720 40250:1080 52084:1080 40788:1080"
for c in $CLIPS; do
  id=${c%%:*}; r=${c##*:}
  [ -s "$CACHE/$id.mp4" ] || curl -fsSL -o "$CACHE/$id.mp4" "https://assets.mixkit.co/videos/$id/$id-$r.mp4"
done

# One cinematic grade for all footage: almost monochrome, cool shadows, deep blacks.
GRADE="eq=saturation=0.18:contrast=1.12:brightness=-0.035:gamma=0.95,colorbalance=bs=0.04:bm=0.015"
ff() { ffmpeg -loglevel error -y "$@"; }

# ---- Hero loops (no audio, faststart) ----
ff -ss 1 -t 9 -i "$CACHE/52094.mp4" -an -vf "$GRADE,scale=1600:-2,fps=25" -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p -movflags +faststart "$OUT/hero-desktop.mp4"
ff -ss 1 -t 8 -i "$CACHE/52080.mp4" -an -vf "$GRADE,scale=720:-2,fps=25" -c:v libx264 -preset slow -crf 29 -pix_fmt yuv420p -movflags +faststart "$OUT/hero-mobile.mp4"
ff -ss 3 -i "$CACHE/52094.mp4" -frames:v 1 -vf "$GRADE,scale=1600:-2" -c:v libwebp -q:v 70 "$OUT/hero-poster.webp"
ff -ss 3 -i "$CACHE/52080.mp4" -frames:v 1 -vf "$GRADE,scale=720:-2" -c:v libwebp -q:v 70 "$OUT/hero-poster-m.webp"

# ---- Scroll sequence: 4 shots joined with crossfades, then exported as frames ----
# environment -> equipment close-up -> preparation -> athlete
SEQ="$CACHE/seq.mp4"
ff -ss 2 -t 4 -i "$CACHE/23056.mp4" -ss 1 -t 4 -i "$CACHE/40235.mp4" -ss 3 -t 4 -i "$CACHE/4596.mp4" -ss 0.5 -t 4.5 -i "$CACHE/52091.mp4" \
  -filter_complex "[0]scale=1920:1080,fps=30,setsar=1[a];[1]scale=1920:1080,fps=30,setsar=1,eq=saturation=0.3[b];[2]scale=1920:1080,fps=30,setsar=1[c];[3]scale=1920:1080,fps=30,setsar=1[d];\
[a][b]xfade=transition=fade:duration=0.8:offset=3.2[ab];[ab][c]xfade=transition=fade:duration=0.8:offset=6.4[abc];[abc][d]xfade=transition=fade:duration=0.8:offset=9.6,$GRADE[v]" \
  -map "[v]" -an -c:v libx264 -crf 16 "$SEQ"
rm -f "$OUT"/seq/d/*.webp "$OUT"/seq/m/*.webp
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SEQ")
ff -i "$SEQ" -vf "fps=120/$DUR,scale=1280:720" -c:v libwebp -q:v 62 -start_number 0 "$OUT/seq/d/%03d.webp"
ff -i "$SEQ" -vf "fps=72/$DUR,crop=608:1080,scale=540:960" -c:v libwebp -q:v 60 -start_number 0 "$OUT/seq/m/%03d.webp"

# ---- Stills (concept imagery) ----
still() { # name clip time [crop]
  local f="$GRADE"; [ -n "${4:-}" ] && f="$4,$GRADE"
  ff -ss "$3" -i "$CACHE/$2.mp4" -frames:v 1 -vf "$f,scale=1600:-2" -c:v libwebp -q:v 74 "$OUT/$1.webp"
  ff -ss "$3" -i "$CACHE/$2.mp4" -frames:v 1 -vf "$f,scale=800:-2" -c:v libwebp -q:v 70 "$OUT/$1-sm.webp"
}
still strength   52094 6
still functional 52088 4
still cardio     23056 6
still journey    52084 8
still pullup     23450 5
still barbell    40235 4 "eq=saturation=0.3"
still boxer      45874 6
still wrap       4596  6
still focus      52091 5
still ground     40250 5 "eq=saturation=0.3"
still rack       40788 4
echo "done: $(du -sh $OUT | cut -f1)"
