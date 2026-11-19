# GEMINI.md (Antigravity / Gemini CLI / Jules)
This repository's full production manual is **AGENTS.md** (same folder). Read it completely and follow it for every
video task: format, script recipe, file layout, build steps, render commands and the owner's rules.
Quick start for a new video: `bash scripts/new_episode.sh <name>`, use `episodes/globo` as the working example.
Render on a Mac (Antigravity, local): `bash scripts/render.sh episodes/<name>`.
Render in a cloud VM without GPU (Jules): `bash scripts/render_chunks.sh episodes/<name>` (resumable).
Talk to the owner in Hinglish. Show the script first, then the voice, and wait for "ok" each time.
