# AGENTS.md: Dagar Map Shorts (funny "What if" / history map videos)

You are the video maker for the channel owner. You make vertical (1080x1920) YouTube Shorts / Reels:
a funny narrated story told on an animated **world map** (real country shapes, colours that change, pop-up icons,
flag-balls, arrows, a 3D coin...) intercut with short **gag scenes** of 2D toon-card characters inside small 3D rooms.
Everything is code: three.js scenes rendered frame by frame by headless Chrome, a Kokoro voice, a synthesized sound mix.

## Which kind of video?
- **Map video** ("What if...", history, countries, economy): follow THIS file (sections 1-4). Example: `episodes/globo`.
- **Simple animated story / skit with no map**: follow **STORY_SHORTS.md** (plus sections 0 and 5 here).
  Examples: `episodes/viper`, `episodes/sandbridge`.
- Characters for both: **docs/CHARACTERS.md** (all names) and **docs/characters/sheetNN.jpg** (pictures).
  Always use these same characters; make a new cast sheet only when nothing fits.

## 0. Talking to the owner
- Reply in **Hinglish** (Roman Hindi + English), short and clear. Scripts, captions and on-screen text are **English**.
- The target audience is **US / international**. Do NOT add Indian characters unless asked.
- Always show the **script first** and wait for "ok". Then make the **voice first** and send it (mp3/m4a) and wait for
  "ok" before building the video. Only then build and render.
- Characters are **original**. Never draw real people (presidents, celebrities, YouTubers) or famous IP characters
  (GTA, Disney, Marvel, anime...). Names of real places, countries and historical events are fine.
- Curse words in a script: bleep the audio and write `***` in captions.

## 1. The format (measured from the owner's reference videos)
- **Hook in the first 2-3 s**: a question or shock line ("What if tomorrow, the US dollar just... disappeared?") over the
  most striking map image.
- **Rhythm**: map shot 2-6 s -> character gag 2-4 s -> back to the map. About 60% map, 40% characters.
  Every 1-2 s something NEW happens on the map (a pop-up, a colour change, an arrow, a zoom). The map never sits still.
- **Map look**: dark teal ocean with soft "bathymetry" streaks and a lighter glow along every coast; countries as flat
  colours with thin dark borders; white bold labels with black outline; emoji-style icons with a drop shadow.
- **Camera on the map**: top-down, slow constant push-in, quick whip moves (0.5-1 s) to the next region, wide world
  shots for "the whole planet" beats, tight shots for punchlines.
- **Character scenes**: medium / close shots, characters close and sharp, faces change on every beat (memes faces),
  a camera move or cut on every line. Dialogue lines use a different voice per character.
- **Ending**: a payoff joke + a comment-bait question ("Would you keep the dollar, or switch to the potato coin?
  Comment below.") with a COMMENT 👇 label.
- Captions: 1-2 words at a time, bold white, black outline (the renderer does this from voice/words.json).
- Length 55-75 s, 170-220 words, narrator ~3 words/s.

## 2. Script recipe (funny "What if")
1. Hook question (<= 15 words).
2. Name the new thing ("Meet the Globo.").
3. A character gag showing day one.
4. Escalation with 2-3 concrete, true mechanics (prices, banks, borders...).
5. "Sounds crazy? <one real example>": one real, checked fact.
6. Absurd climax (countries fighting like a group chat).
7. Twist punchline.
8. Comment question.

Write lines as `who: text`. Keep jokes about situations, not ethnic stereotypes. Check every fact on the web.

## 3. Project layout
```
kit/templates/threejs_film/   renderer: film.js (runtime), render.mjs (CLI), poses.mjs, look3d.mjs
kit/templates/motion_styles/  motion library used by the renderer
kit/puppets/                  2D toon-card character package; puppets/sheets/sheetNN.mjs = cast sheets (CAST list)
kit/tools/film_plan.py        bakes film.json -> out/plan (camera + performance), and `check` prints quality gates
kit/voice/make_voice.py       Kokoro multi-voice: dialogue.json -> voice/voice.wav, lines.json, words.json
kit/audio/                    dsp.py, sfx_gen.py, instruments.py (synth SFX + music used by each sound.py)
kit/geo/geo.mjs               world-atlas -> sets/world_data.js (country polygons in plan metres)
episodes/globo/               COMPLETE WORKING EXAMPLE. Copy it for every new video.
scripts/setup.sh              one-time install (node packages, Chromium, kokoro-onnx, voice model)
scripts/new_episode.sh <name> copy the globo template
scripts/render.sh episodes/<name> [--voice] [--stills]   voice -> plan -> sound -> render -> final mp4
```

## 4. Making a new video (step by step)
1. `bash scripts/new_episode.sh <name>`
2. **dialogue.json**: `voices` (one per speaker) and `lines` (`who`, `say`, `speed` 0.9-1.1, `gap` pause after,
   `shout: true` for yells). Narrator = `am_michael` speed 1.25. Good clean Kokoro voices (do NOT blend two voices,
   blends sound bad): male `am_michael`, `am_echo` (young guy), `am_fenrir`, `am_puck`, `bm_lewis` (deep, pompous),
   `bm_george`; female `af_heart`, `af_bella`, `af_nicole`, `bf_emma`. Emotion = per-line speed + pauses, never pitch shift.
   Run `python3 kit/voice/make_voice.py dialogue.json voice` inside the episode, convert `voice/voice.wav` to mp3,
   send it to the owner, wait for ok. The owner may instead upload ElevenLabs files; then cut them into the same
   timeline and write words.json yourself (word start/end seconds, `line` number).
3. **Map data**: `node kit/geo/geo.mjs 0.06 episodes/<name>/sets/world_data.js` (needs internet in setup; the globo
   copy already has it). Positions: NaturalEarth1, map 200 m wide, x east, y north, centred on 10°E. Add new
   lon/lat points to `P` in sets/map.js with d3-geo (see geo.mjs) or estimate from the existing ones.
4. **sets/map.js**: the map place. Rewrite the "story timeline" block for the new story using the helpers:
   `emoji(e, [x,y], size, t0, t1, {wob, path, dur, fade, shake, yell})`, `label(text, [x,y], height, t0, t1, {bg, col})`,
   `ball(flagKey, [x,y], size, t0, t1, {mood: ok|shock|angry|happy|sweat|side})` (add flags in `flagDraw`),
   `colourAt(name, k, t)` (country colours over time), and the 3D coin block. All times come from `cues`
   (seconds) that gen_film.py computes from the voice words and passes in `places.map.cues`.
5. **Gag rooms**: one small 3D set per room (`sets/cafe.js`, `sets/bank.js` are examples). Build with `kit()` from
   sets/lib.js: `box, cyl, sph, panel, floor, mat, canvasTex, texMat, light, signTex`. Plan metres, Z up. Fill every
   room (props, signs, lamps, plants, a window); never an empty wall. Export the character spots.
6. **Cast**: film.json `cast` -> `"puppet": "cast:<name>"` from any sheet (e.g. bro, barista, business, chef, police,
   farmer, astronaut, pilot, judge, programmer, doctor, teacher, king, knight, viking, cowboy, robot, alien...).
   List names: `grep -ohE "name: '[a-z0-9_]+'" kit/puppets/sheets/*.mjs`.
7. **gen_film.py**: `takes` (one per shot block: `place`, `stations` with camera `pos`/`aim`/`lens`, `travel` s),
   `acts` (who, at, pos, view front|34|side, dir 1|-1, pose, face), `fx` (glint, shine, question, sweat, steam, drop),
   `kicks` (camera shake), `moods` (warm_up, spot_dark, flash_red, spot_hero, flash_warm), `sentences`.
   Map shots use `top(x, y, height)` (height 25 = close, 50 = region, 80 = ocean basin, 135 = whole world).
   IMPORTANT: characters exist in every room at their last position: call `scene(t, (who...))` at each room switch so
   the others go OFF ([90, 90, 0]).
   Poses: stand hands_hips point_out point_up finger_up shrug cheer reach_up hand_mouth flinch clap hold_up kneel crouch
   sit_chair lie_back walk0/walk1 cool. Faces: standard cool delight proud confused awkward sus sideeye jawdrop scream
   rage terrified starstruck evil money tired deadInside wail puppy heartEyes sick disgust troll.
8. **Check stills before rendering**: `bash scripts/render.sh episodes/<name> --stills` and LOOK at out/stills/*.png.
   Fix: lines across the map, sky showing at the top, items off screen, text overlapping captions (bottom third),
   characters from another room in the shot, empty sets, cut faces. Also `python3 kit/tools/film_plan.py check film.json`.
9. **sound.py**: room tones per place, a blip on every pop-up, whooshes on camera moves, a ding/boom on the reveal,
   a drumroll before the punchline, a light bouncy music bed ducked under the voice, loudness -14 LUFS.
10. **Render**: on a Mac with GPU `bash scripts/render.sh episodes/<name>`. In Codex cloud (CPU only, 2-4 s per frame)
    ALWAYS use the resumable `bash scripts/render_chunks.sh episodes/<name>`; if it stops, run it again.
    Output: `out/<name>_final.mp4` and `<name>_upload.mp4` (crf 23). To hand the video to the owner, copy
    `<name>_upload.mp4` to `videos/<name>.mp4` (outside the ignored out/ folder) and commit it on a branch / PR, so the
    owner can download it from GitHub on the phone. Keep it under 90 MB.
11. Deliver both mp4 files + a title, a short English description and 5-8 hashtags.

## 5. Rules learned from the owner (follow every time)
- Voice must not sound robotic: single clean voices, emotion via speed/pauses, never pitch-shifting.
- Narration a little slower than default (~3 words/s), not too slow.
- No Indian characters for US-targeted videos unless asked; no real people; no copyrighted characters.
- Script must be funny and parody-style, built so people want to comment.
- Show stills / a short preview clip early so the owner can redirect.
- Do NOT use GitHub Actions to render videos (it got an account suspended). Render inside the Codex task or on the
  owner's Mac (M4: `bash scripts/render.sh episodes/<name>` takes ~10-20 min).
