#!/usr/bin/env bash
# Start a new episode from the Globo template:  bash scripts/new_episode.sh <name>
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; N="$1"; [ -z "$N" ] && { echo "usage: new_episode.sh <name>"; exit 1; }
D="$ROOT/episodes/$N"; [ -e "$D" ] && { echo "$D already exists"; exit 1; }
mkdir -p "$D/voice" "$D/sound"; cp -r "$ROOT/episodes/globo/sets" "$ROOT/episodes/globo/tools" "$D/"
cp "$ROOT/episodes/globo/gen_film.py" "$ROOT/episodes/globo/sound.py" "$ROOT/episodes/globo/dialogue.json" "$D/"
echo "Created $D (copy of globo). Now edit: dialogue.json (script + voices), sets/*.js (places), gen_film.py (shots, acting, map cues), sound.py (SFX)."
