# STORY_SHORTS.md: simple animated story videos (NO map)

Use this manual when the owner asks for a normal animated story short (no map): a narrated funny story or a dialogue
skit acted by the 2D toon-card characters inside dense 3D rooms. Examples in this repo:
- `episodes/viper` ("The Assassin Without His Glasses"): narrated, 3 places (roof at night, kitchen, throne hall),
  held 3D props (cleaver, platter), 25 camera stations, ~49 s.
- `episodes/sandbridge` ("He Poured Sand Under a 500-Ton Bridge"): narrated, one big outdoor place (river + bridge).
Everything in AGENTS.md section 0 (talking to the owner) and section 5 (owner's rules) applies here too.

## 1. The format
- Vertical 1080x1920, 40-75 s. The owner usually gives the script: use it **word for word** (only spell numbers
  as words). If you write one: hook (<= 18 words, the most surprising fact first) -> "You see," context -> the
  nobody vs the crowd, with short quoted dialogue -> escalation with time markers -> one-line twist -> the mechanism
  -> a short ironic punchline, hard stop. 150-230 words.
- **Hook first**: the first 2-3 s show the most striking image of the story plus the hook line.
- **No silence** longer than ~2 s; narrator fills gaps.
- **Dense 3D sets**: nothing empty. Furniture, clutter, signs, lamps, plants, windows with a view, a town or nature
  outside for exteriors. Check every wide shot.
- **Characters close to camera and sharp**: mostly medium (M) and close (C) shots. No one floating, hidden in
  furniture, or covering another face.
- **Faces carry every beat**: change the meme face on every story beat (evil, sus, confused, terrified, cool, rage,
  starstruck, wail, disgust, deadInside...). Shouted lines flap between two faces instead of a talking mouth.
- **Camera**: one continuous move per station, a new station on every sentence or beat, lenses 24 mm establishing,
  30-35 mm action, 38-50 mm faces. Hard cuts only for shocks (with a `kick` shake).
- Captions: 1-2 words, bold white, black outline (automatic from voice/words.json). Bleeped words show as `***`.
- Ending: punchline on a close-up face, then hold ~2 s.

## 2. Build steps
1. `bash scripts/new_episode.sh <name>` makes a copy of globo. For story videos copy viper instead:
   `cp -r episodes/viper episodes/<name> && rm -rf episodes/<name>/out` (then edit everything below).
2. **dialogue.json**: narrator `am_michael` speed 1.25 (the owner likes it "thoda slow", ~3 words/s), gaps x0.85.
   Dialogue skits: one clean voice per character (never blend voices, never pitch shift). Emotion = per-line `speed`
   (0.9 sad/dramatic ... 1.1 excited) + `gap` pauses + `shout: true`. `bleeps.json` lists words to bleep.
   Make the voice: `python3 ../../kit/voice/make_voice.py dialogue.json voice`, send an mp3 to the owner, wait for ok.
3. **Sets** (`sets/<place>.js`): `export function build(THREE, scene, film, ctx)` returning `{ anchors, update(f, t) }`.
   Use `kit()` from sets/lib.js: `box(name, matTag, w, d, h, [x,y,z], colour, opts)`, `cyl`, `sph`, `panel`, `floor`,
   `mat(colour, {relief})` (relief: brick, wood, stone, tile, plaster, metal...), `canvasTex(w, h, draw)`, `texMat`,
   `signTex` (painted signs with text), `light(colour, power, range, pos)`. Plan metres, Z up, the camera usually
   looks from -y toward +y. Export the important spots (`export const POT = [x, y, z]`). 3D props held in hands:
   builder functions in lib.js (`buildCleaver`, `buildPlatter`, `buildPhone`, `buildAxe`, `buildWrench`) +
   film.json `held3d` entries `{who, obj, module: "sets/lib.js", builder, grip: "raise", hand: "R"}` and acts
   `prop: "<obj>", hand: "R"`.
4. **Cast**: film.json `cast: {"viper": {"puppet": "cast:viper", "height": 1.8, "heads_tall": 2.9}}`. Pick from
   docs/CHARACTERS.md (pictures in docs/characters/*.jpg). A new character = a new `kit/puppets/sheets/sheetNN.mjs`
   exporting `CAST` (copy sheet19.mjs: viper and headchef show form, coat, face, hat, details, `withHair(...)`).
   Picture check: `cd kit/puppets && node castsheet.mjs sheets/sheetNN.mjs out.png`.
5. **gen_film.py** (copy viper's): helpers `st(i)`, `en(i)`, `wtime(i, n)` (time of word n in line i),
   `cam(target, framing, side, lens, height)`, `raw(pos, aim, lens, framing)`, `station(t, subject, cam, travel)`,
   `act(who, t, pos, view, dir, pose, face, prop, hand, move_s)`, `walk(...)`.
   - `places`: `{"set": "<file>", "light": "night|morning|day|golden|interior", "light_over": {...}}`.
   - `takes`: one per place block, each with `stations` (camera keyframes). Characters not in the current place go
     to OFF `[90, 90, 0]`. Use `move_s: .03` for teleports at cuts so nobody slides across a cut.
   - Poses: stand crouch kneel jump fall flinch hand_mouth hands_hips hold_up point_out point_up finger_up shrug
     cheer reach_up clap sit_chair lie_back walk0/walk1. Views: front, 34, side. `dir` 1 faces right, -1 left.
   - `fx`: glint shine question sweat steam drop dust_puff whistle_zzz. `moods`: spot_dark warm_up flash_red
     flash_warm spot_hero. `kicks`: camera shake `{at, amp}` on impacts.
   Then `python3 gen_film.py && python3 ../../kit/tools/film_plan.py bake film.json`
   and `python3 ../../kit/tools/film_plan.py check film.json` (fix every FAIL that makes sense).
6. **Stills check**: `bash scripts/render.sh episodes/<name> --stills`; open out/stills and fix empty sets, cut
   faces, dark faces, characters inside furniture, someone from another place in the shot, text under captions.
   Send 3-4 stills (or a 10 s preview) to the owner before the full render.
7. **sound.py** (copy viper's): room tone per place, footsteps on walks, SFX on every story event (whoosh, thump,
   clang, sizzle, gasp, crowd), kicks get a thump, light score under the voice, final -14 LUFS.
8. **Render**: Mac `bash scripts/render.sh episodes/<name>`; Codex cloud `bash scripts/render_chunks.sh episodes/<name>`.
   Deliver `<name>_final.mp4` + `<name>_upload.mp4` (copy to `videos/<name>.mp4` and commit on a branch/PR), plus a
   title, a short caption and hashtags.
