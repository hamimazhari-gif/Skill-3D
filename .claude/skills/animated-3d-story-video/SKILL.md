---
name: "animated-3d-story-video"
description: "Make short vertical 3D-world story animations with expressive 2D cartoon characters (Remotion + three.js). Use when the user uploads this skill package with a voice-over and narration (build the whole video, every language version, thumbnail and titles without stopping), or asks for a new story video from a topic or idea."
---

# Animated 3D story video (house style + acting kit)

This skill makes a 40-65 s vertical (9:16, 1080x1920) story video in one fixed house style: every location is a real 3D world (painted flat-colour models with ink outlines), expressive 2D cartoon characters act inside it, and the camera always moves. It is all code (Remotion + three.js), so no image or model files are needed.

The package ships a working starter project (`starter/`) built for "Dari Sekarung Beras ke Satu Sentuhan / From a Sack of Rice to a Single Tap" (history of money, Indonesian + English). New videos reuse its kit and replace only the story files.

## Hard rules
- Never ask the user for reference videos, examples or a style. The style, acting rules and rulebook are in this file.
- Do the technical work yourself. Ask the user only the questions in the flows below, or when an input is missing and cannot be derived (for example no narration text and no audio).
- Keep approved things fixed: script / the user's narration, timing, facts, characters, ink colour #351f22.
- Be honest about what was checked (stills versus the full video) and list known problems at the end.
- Render the full video yourself, directly. Never hand over a render.bat or ask the user to render.
- Commit and push the project, story files and final videos to the session branch as you go (the container is temporary).

## Package layout (what the user uploads)
```
animated-3d-story-video/
  SKILL.md                  this file
  starter/                  complete Remotion project (copy to the repo root)
    package.json            pinned: remotion/@remotion/cli/@remotion/three 4.0.545, three 0.170.0, @react-three/fiber 8.18.0, react 18.3.1
    src/kit.js              REUSE: toon materials, painted wear textures, ink hull + edge lines, signs, pop/easing helpers
    src/char.js             REUSE: base character, EXPRESSIONS, POSES, actions, act() timeline
    src/props.js            REUSE: facade, house, stall, sack, crate, barrel, tree, goat, chicken, fish, basket, coin, chalkboard,
                                   chalk doodles, signpost, banner, boat, water, anvil, hammer, phone, room, boot, hills, sky dome
    src/timing.js           REUSE (generic) + per story: EV word table and LABELS per language
    src/shots.js            REUSE warpU/buildCameras/camAt + per story: SHOT_PLAN
    src/world.js            PER STORY: locations, characters, acting cues, on-word events, LOOK per location
    src/Video.jsx           REUSE renderer/post (DOF, vignette, dips, audio) + per story: cues() SFX sheet, DIPS, Thumb texts/camera
    src/index.jsx           compositions per language + thumbnails + CharSheet test sheets
    src/CharSheet.jsx       test sheet of every expression / pose
    src/data/               sentence_times_<lang>.json (generated)
    public/sfx/             sound-effect library + README (what each sound is for)
    public/vo/              voiceover_<lang>.wav (user audio)
    tools/                  align.py, gaps.py, stills.sh, render.sh, contact_sheet.py, vo_pdf.py
  example/sejarah-uang/     script.md, camera_plan.md, narration_<lang>.txt, judul.md (worked example)
```

## Install (first thing, every new session)
1. Unzip the upload into its own scratch folder, read SKILL.md, then copy `animated-3d-story-video/` (without `starter/` and `example/` if size matters) to `.claude/skills/animated-3d-story-video/` in the repo.
2. If the repo has no Remotion project yet, copy `starter/*` to the repo root. Otherwise reuse the project that is there.
3. `npm install` (registry.npmjs.org must be reachable). Chromium is preinstalled; pass `--browser-executable=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell` (tools default to it; override with `BROWSER=`).
4. Each new story goes in `videos/<slug>/` (script, narration, timing, camera plan, PDFs, final mp4s, thumbnails, titles).

## Flow A — fast path: the user uploads the package + audio + narration (default)
Do everything without stopping; ask nothing unless an input is missing.
1. **Inputs.** One voice-over per language (wav/mp3/m4a) and the narration text for each (pasted, .txt, .md, .pdf or .docx). Convert audio: `ffmpeg -i in.mp3 -ac 1 -ar 24000 voiceover_<lang>.wav` into `public/vo/` and `videos/<slug>/`. If only audio is given with no text and nothing in the upload contains it, ask once for the text (there is no speech recognition here).
2. **Shots.** Split the narration into 9-12 shots by sentence (one location per shot), following the beats in the rulebook where the text allows (But / Then / complaint / "You see" pivot / "So" consequence / closing). Never rewrite the user's narration; only note rule misses in `script.md`. Write `videos/<slug>/narration_<lang>.txt` as `shot | sentence` lines; write numbers as spoken words.
3. **Facts.** Search the web to check each factual claim; list doubtful ones in `script.md` ("wording to watch") and tell the user at the end. Do not change the audio.
4. **Timing.** `python3 -I tools/align.py public/vo/voiceover_<lang>.wav videos/<slug>/narration_<lang>.txt src/data/sentence_times_<lang>.json` for every language. Check that each sentence length is close to its prediction; if the tool says there are too few pauses, lower the threshold in `gaps.py` (-44 dB / 0.12 s by default) or merge sentences.
5. **Design** (write `camera_plan.md`): locations (x offsets 0, 40, 80, …), cast (palettes in `char.js`; add palettes, never new body shapes), in-world labels per language (`LABELS`), the word events (`EV`: `[sentenceIndex, word]` per language), acting cues per character, on-word props (pop-ins, doodles, coins…), SFX cue sheet.
6. **Build** the story files (`world.js`, `SHOT_PLAN` in `shots.js`, `EV`/`LABELS` in `timing.js`, `cues()`/`DIPS`/thumbnail in `Video.jsx`, compositions in `index.jsx`). Reuse kit/props; build new props in `props.js` with the same helpers.
7. **Check stills** (stage F) for every language, fix, repeat until clean.
8. **Render** every language (`tools/render.sh CompA CompB`, run in the background; about 1 s per frame on 4 cores, so a 60 s video takes about 30 min), check with ffprobe and a contact sheet of one frame per shot.
9. **Thumbnail + titles**: a `Thumb<LANG>` composition (frozen scene moment + 2-3 bold ink-bordered text blocks + small tag), title + 2 alternatives + description + hashtags per language in `videos/<slug>/judul.md`.
10. **Deliver**: send the mp4s, thumbnails and voice-over PDFs (`tools/vo_pdf.py`) to the user, commit and push, and report what was checked and what is still wrong.

## Flow B — from an idea (when there is no narration yet)
1. **Ideas** (start here, do not ask questions first): 5 true, surprising stories where something physically big changes. For each: title, visual hook, escalation (but / then / so), 2-3 hard numbers or names, confirmed by web search (drop single-source details). Ask: "Which one should I write?"
2. **Script** by the rulebook; show the shot table and the voice-over text; ask "Do you want me to make the video from this script?" Offer other language versions if the user writes in a non-English language.
3. On yes: the voice-over is the user's file (ask for it), a connected text-to-speech tool, or estimated timing (3.35 words/s English, about 2.7 words/s Indonesian) with a warning that cuts need re-timing. Then Flow A steps 4-10.

## Script rules (rulebook)
- First word at t=0, no intro, premise in the first sentence. Hook 5-23 words (aim 16), ends at about 4-5 s.
- 9-12 shots, one location per shot, about 140-150 words for about 43-48 s in English. Total 39-65 s.
- Beats: But (shot 4), Then (shot 5), the complaint or conflict (shot 6), a pivot "You see" at 53-87% of the runtime (shot 7), "So..." consequence at 80-93% (shot 9), closing line 5-19 words. A closing question to the viewer ("…? Tell me in the comments") is allowed when the user asks for engagement.
- Simple words, one idea per sentence, concrete numbers and names. Every claim has a source.
- Output: `script.md` (shot table, rulebook check, fact map, left out on purpose, wording to watch) and a voice-over PDF per language: "Chapter N - Title (start time)" followed by one paragraph, 2-3 chapters.

## Art style (fixed)
- One ink colour for every outline: #351f22. Models built in code with real depth (extruded walls, window reveals and sills, door panels, awnings, cornices, chimneys…). Textures are painted flat colours with wear (stains, chips, scratches). Outline = inverted hull plus edge lines.
- Toon shading with a 3-band gradient; one warm key light from the upper left with shadows, hemisphere fill, light vignette, fog colour per location (`LOOK`).
- Depth: blurred foreground object near the lens, sharp midground with characters, softly blurred background (Bokeh pass focused at the look-at distance).
- Labels live inside the world (painted signs, banners on two poles, names on sacks/crates, chalkboards, plaques), in the language of each version. Never floating captions.
- No flat sky or ground strips, no side-on cardboard buildings. Cuts: 0.4 s dip to cream at location changes; continuous camera moves where one shot flows into the next.

## Characters and acting (expressive cartoon style)
Base design (never redesign): large round pale head, calm half-lidded eyes, tiny smile, hair fringe, white collar, tie, small pear-shaped two-tone torso with pocket patch, thin tapered stick limbs (two-segment arms), dark disc hands, wobbly hand-drawn ink band. Variants by palette, hat (top hat, bowler, cap, none) and glasses only. Flat shading, contact-shadow blob, limited yaw toward camera (±0.7 rad).

Acting API (`char.js`): `c.act([{t, expr?, pose?, action?, dur?}, ...])` — expr/pose persist until the next cue; actions run for `dur` seconds.
- **Expressions** (`EXPRESSIONS`): neutral, happy, laugh, excited, surprised, shocked, annoyed, angry, furious, sad, cry, worried, confused, tired, smug, thinking, proud, determined, disgusted. Built from eyes (calm/open/wide/closed/blink/angry/sad/tired/squint), brows, mouth (smile/grin/laugh/open/shout/frown/flat/wavy/smirk/talk) and extras (blush, sweat, tear, anger mark, shock lines, question mark, sparkle, gloom). Automatic blinking; a head "take" pop on every expression change.
- **Poses** (`POSES`): idle, limp, wave, point, pointUp, present, presentBoth, shrug, hips, armsUp, cheer, facepalm, think, chin, cross, headHold, carry, carryBoth, hold, give, stop, hammerUp, hammerDown, tap, beg. Pose changes ease with overshoot (0.32 s).
- **Actions**: jump (anticipation squash → stretch → landing squash), hop, shake (head no), nod, tremble, slump, lean, talk (mouth flaps), walk, run, spinIn, popIn.
- Acting rules:
  - Every character on screen reacts at least once per shot, timed to the words (use `EV` times; react 0.1-0.2 s after the word).
  - "But…" / refusal → annoyed or angry + cross/hips + head shake (and the denied-buzz SFX); the listener answers with shocked + tremble.
  - Surprise or bad news → shocked + jump (a double take) or headHold; worry → worried + sweat + tremble; tiredness → tired + slump + limp; failure → cry + facepalm.
  - Success / "So…" → happy/laugh/excited + cheer or armsUp + jump; showing something → present/point + smug or proud; asking the viewer → shrug + confused, then point + excited.
  - At most one big action per character per second; keep faces in frame and unblocked during reactions.
  - Check new poses or expressions with the `SheetExpr` / `SheetPose` compositions before using them.
- Size: body 40-60% of frame height in medium shots, 70%+ in close shots; three people side by side need the camera about 4 m away.

## Camera
- `SHOT_PLAN` keys: `{at: 'start' | 'end' | <EV name>, pos, look}` in location-local coordinates; keys land 0.15 s after their word; monotone cubic time warp (`warpU`), ease in/out, no wobble.
- Net travel in every shot (about 10% of frame width per second); mix push (about half), crane (a third), sideways track (a fifth); carry the camera from subject to subject; end every move at rest.
- 80° vertical FOV at 9:16: frame width at the subject = 0.93 × distance, frame height = 1.68 × distance.
- Tie on-screen events to words (labels and props pop on their noun, doodles draw on their word, ticks appear on the payoff word). A word at the very end of a sentence leaves little screen time: start the event earlier or extend the key.

## Sound
- The voice-over is the composition audio; SFX come from `public/sfx/` (see its README) in `cues()`: whooshes on dips, pops on items, buzz on refusals, ticks on numbers/time, riser into the pivot, boom on the big reveal, ding on success, chime on the closing line, one click on "comment". Volumes 0.18-0.45, no more than one accent per second.
- Final mix is loudness-normalised to -14 LUFS (`tools/render.sh`).

## Check it (stills)
`tools/stills.sh <Comp> <prefix> t1 t2 …` (bundles once, about 5-10 s per still, writes `out/<prefix>_sheet.png`). Look for: objects hiding a name, face or label; characters cropped at the frame edge; props behind heads; poles crossing the subject; anything passing through the lens; black polygons or empty openings; camera inside a wall; wrong fact on screen; reactions that happen off-screen. Fix by moving objects or keys; repeat until clean. Never edit `src/` while a render is bundling.

## Known gotchas (this environment)
- No speech recognition: YouTube, Hugging Face and model hosts are blocked; `align.py` uses pauses + the known text. Word times inside a sentence are proportional estimates (±0.3 s).
- In `useFrame`, add the world to the scene and create the fog there too (a still renders a single frame before `useEffect` runs).
- GLSL `#include` lines must start on their own line.
- `pop()` with an undefined event time gives NaN scale (invisible object): check `EV` names.
- Characters do not cast real shadows (flat planes); the blob is their shadow. Props attached to characters should not cast shadows either.
- Render: `--gl=angle --concurrency=4 --image-format=jpeg --jpeg-quality=92 --crf=17`; stills: `--gl=swangle --scale=0.5`.

## After rendering
`ffprobe` (1080x1920, 30 fps, duration, audio present), one frame per shot in a contact sheet, then deliver mp4s, thumbnails, titles and PDFs; say what was checked, what is still wrong, and offer one next step.
