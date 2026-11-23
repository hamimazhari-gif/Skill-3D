---
name: "animated-3d-story-video"
description: "Make short vertical 3D-world story animations with expressive 2D cartoon characters (Remotion + three.js). Use when the user uploads this skill package with a voice-over and narration (build the whole video, every language version, thumbnail and titles without stopping), or asks for a new story video from a topic or idea."
---

# Animated 3D story video (house style + acting kit)

This skill makes a 40-65 s vertical (9:16, 1080x1920) story video in one fixed house style: every location is a real 3D world (painted flat-colour models with ink outlines), expressive 2D cartoon characters act inside it, and the camera always moves. It is all code (Remotion + three.js), so no image or model files are needed.

The package ships a working starter project (`starter/`) built for "Otak, si pencuri energi / Your brain, the energy thief" (Indonesian + English) in the current house style, plus `DemoGerak` (src/Demo.jsx, a 12 s demo of walking, running, the new stick limbs and the realistic world). New videos reuse its kit and replace only the story files. `example/bumi-berhenti-berputar/style_reference.png` shows the approved character look; `example/sejarah-uang/` is the older first video (its story source is in `source/`).

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
    src/lighting.js         REUSE: LOOK_PRESETS (dawn, day, noon, goldenHour, sunset, dusk, night, overcast, storm, winter, desert,
                                   interiorWarm, interiorCool, candle, underground, underwater), MOODS, keyed looks, grade shader
    src/vfx.js              REUSE: sparks, smoke, dust, debris, lightning, flame, fireLight (frame-driven, seeded)
    src/kit.js              REUSE: toon materials, painted wear textures, ink hull + edge lines, signs, pop/easing helpers
    src/char.js             REUSE: base character, EXPRESSIONS, POSES, actions, act() timeline
    src/props.js            REUSE: facade, house, stall, sack, crate, barrel, tree, goat, chicken, fish, basket, coin, chalkboard,
                                   chalk doodles, signpost, banner, boat, water, anvil, hammer, phone, room, boot, hills, sky dome
    src/timing.js           REUSE (generic) + per story: EV word table and LABELS per language
    src/shots.js            REUSE warpU/buildCameras/camAt + per story: SHOT_PLAN
    src/world.js            PER STORY: locations, characters, acting cues, on-word events, LOOK per location (LOOK_PRESETS: day,
                            sunset, night with moon, interiorWarm, interiorNight), storyFx() flashes + camera shakes
    src/Video.jsx           REUSE renderer/post (DOF, vignette, dips, word captions, flashes, camera shake, moon, audio) + per story: cues() SFX sheet, DIPS, Thumb texts/camera
    src/index.jsx           compositions per language + thumbnails + CharSheet test sheets
    src/CharSheet.jsx       test sheet of every expression / pose
    src/data/               sentence_times_<lang>.json (generated)
    public/sfx/             sound-effect library + README (what each sound is for)
    public/vo/              voiceover_<lang>.wav (user audio)
    tools/                  align.py, gaps.py, stills.sh, render.sh, contact_sheet.py, vo_pdf.py
  example/otak-pencuri-energi/     latest worked example (story of the starter)
  example/bumi-berhenti-berputar/  worked example + style_reference.png (approved character look)
  example/sejarah-uang/     first video: script.md, camera_plan.md, narration_<lang>.txt, judul.md, source/ (old story files)
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
5. **Design** (write `camera_plan.md`, including the lighting plan and the VFX plan): locations (x offsets 0, 40, 80, …), cast (palettes in `char.js`; add palettes, never new body shapes), in-world labels per language (`LABELS`), the word events (`EV`: `[sentenceIndex, word]` per language), acting cues per character, on-word props (pop-ins, doodles, coins…), SFX cue sheet.
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

## Channel feel (learned from a reference "true story cartoon short", 59 s, 1080x1920)
General traits to follow. Never copy another channel's characters, costumes, logos or scenes; our characters stay our base design.
- **Word-by-word captions** are always on: 1-2 words at a time, heavy white type with a thick dark (#351f22) stroke and a drop shadow, centred at about 63% of the frame height, popping in (scale 1.18 → 1 in 0.12 s) on each word (`Captions` in `Video.jsx`, prop `captions`). In-world labels are still used for names, places and numbers.
- **Fast cutting:** a new framing every 1.5-3 s (about 20-25 framings per minute). Several shots can share one location: hard cuts or continuous moves inside a location, the cream dip only when the location changes. Split long sentences across two framings (wide → close).
- **Close-ups carry the emotion:** face close-ups where the head fills 40-60% of the frame width for every reaction beat, low angles looking up at a character, over-the-shoulder two-shots, and macro shots of the key prop (a coin, a fuse, a sack) with the background blurred.
- **Big readable reactions:** wide round eyes with tiny pupils for shock, one raised brow + smirk for scheming, sweat drop when nervous, huge open laugh, deadpan half-lidded stare for comedy, a whole crowd reacting together on the payoff.
- **Props and VFX sell the moment:** sparks on fuses and strikes, smoke from fires, dust on landings, debris on impacts, lightning, a warm/white flash on the climax, camera shake on every impact (`vfx.js`, `storyFx()`).
- **Mood lighting:** night scenes with a big glowing moon and warm firelight are welcome (`LOOK_PRESETS.night`, `fireLight`, `flame`); keep characters bright and readable against dark backgrounds.
- **Endings land on a big visual** (an explosion of light, a crowd cheer, a reveal) right on the last line.

## Art style (fixed)
- One ink colour for every outline: #351f22. Models built in code with real depth (extruded walls, window reveals and sills, door panels, awnings, cornices, chimneys…). Textures are painted flat colours with wear (stains, chips, scratches). Outline = inverted hull plus edge lines.
- Toon shading with a 3-band gradient; one key light (upper left by default) with shadows, hemisphere fill, vignette and a colour grade; fog, sky and light colours per location and per beat from the lighting plan (`LOOK`, `lighting.js`).
- Depth: blurred foreground object near the lens, sharp midground with characters, softly blurred background (Bokeh pass focused at the look-at distance).
- Labels live inside the world (painted signs, banners on two poles, names on sacks/crates, chalkboards, plaques), in the language of each version. The only screen text is the word-by-word caption track (no floating pills, titles or info boxes).
- No flat sky or ground strips, no side-on cardboard buildings. Cuts: 0.4 s dip to cream at location changes; continuous camera moves where one shot flows into the next.

## World look: realistic (user rule)
Backgrounds and props are realistic 3D, not flat toon: `STYLE.realistic = true` in `kit.js` (default) makes `toon()` return physically based materials (roughness, optional metalness via `{rough, metal}`, bump from the painted texture, fine micro-texture), removes ink outlines from props and signs (`keepInk: true` to keep one), and the renderer adds image-based light (RoomEnvironment, `environmentIntensity` 0.45), neutral tone mapping and cloudy skies on daytime presets (`clouds` in `LOOK_PRESETS`, 0 indoors and at night). Build props with real depth and detail (bevels, frames, legs, trims, cobbles, planks, grass grain), give metal parts `metal: 0.6, rough: 0.4`, glass transparency, wood `planks`. Characters stay hand-drawn 2D (the contrast is the style, like the reference video). `setRenderStyle('toon')` brings back the old flat look only if the user asks.

**Rich, layered worlds (user rule, from the reference "Why Samurai Feared the Flying Thunder"):** flat single-colour surfaces are not allowed. Every location needs:
- **Patterned, textured surfaces** from `patternTex` / `patternMat` in `kit.js`: `carpet` (borders, motifs, medallion), `wallpaper` (stripes + damask), `woodfloor` (planks, grain, knots, gaps), `plaster`, `dirt` (pebbles), `tiles`, `fabric`, `stone` (blocks), `thatch`, `bark`, `grass`. `P.room()` already uses wallpaper walls, wood floors, wainscot rail and skirting; outdoor grounds use `patternMat('grass' | 'dirt' | 'stone')` with a repeat.
- **Set dressing everywhere** (rooms are never empty): `P.rug`, `P.curtain`, `P.shelf` (books and jars), `P.jar`, `P.chest`, `P.pictureFrame`, `P.pottedPlant`, `P.lantern` (warm practical light with flicker), plus story props. Fill foreground, midground and background.
- **Nature with depth:** `P.grassField` (realistic grass: 10-30k curved tapered blades per field in natural clumps, dark roots, light and partly dry tips, upward normals, wind in the vertex shader, small flowers; put a dense low strip in the foreground, mid strips by paths, a tall meadow behind; always on top of `patternMat('grass')` lawn texture), `P.pebbles`, layered trees, `P.mountains({village: true})` far away with fog, cloudy dramatic sky.
- **Warm/cool contrast and glow:** warm practical lights (lanterns, fire, lamps, windows) against cooler ambient light; light sources use `P.hdr(color, k)` so the bloom pass makes them glow (characters stay below the bloom threshold). Keep fill light lower indoors (hemi about 0.9-1.0) so pools of light read.
- Check every location in a still for: patterned floor and walls, at least five dressing props, a practical light, depth layers.

## Character movement (user rule)
Characters move naturally, but always face the camera (no turn drawings).
- **Locomotion cues** in `act()`: `{t, move: [x, z], dur?, gait: 'walk' | 'run'}` walks or runs the character to a point in location coordinates (eases in/out, legs stride with bending knees, arms swing, speed sets the cadence; `dur` defaults from the distance). `{t, face: angleRad | 'camera'}` sets the heading. Chain several moves for paths; combine with expressions/poses/actions in the same cue. Do not move a character with `g.position` by hand when it walks — use `move`.
- **No character view angles (user rule):** the user found front/three-quarter/side/back drawings distracting. Characters always show the front drawing, turned toward the camera (yaw billboard, plus a slight tilt-back for high cameras). The old turn drawings stay in `char.js` behind the design flag `views: true` — never enable it unless the user asks.
- Camera variety still matters: walking beats, walking toward or away from the lens, orbits and a high shot are fine, the character just keeps facing the camera.
- Check new moves with stills at several times of the move, and `DemoGerak` as the reference.

## Character look (approved by the user — keep it in every video)
Learned from the user's reference ("cartoon true story" short with lit 2D characters) and approved step by step. See `example/bumi-berhenti-berputar/style_reference.png`.
- **Lit, rounded characters, not flat stickers.** Every part (head, hair, hat, torso, limbs) is painted with light from the upper left and a soft core shadow on the lower right (`paintShade`). The head leaves a soft shadow on the chest.
- **Clothes look 3D:** a clear white vertical sheen band on the left third of the torso (keep the original strength: peak about 0.5 white, not softer), a small bright glint high on the chest, **dark shading along both edges of the body** (left edge about 0.7, right edge about 0.85 of the shade colour — the user asked twice for these to be darker), fine vertical weave lines. Arms and legs: dark rims on both sides with a thin white highlight left of centre. Hair has a glossy white streak.
- **Real cast shadows** on floors and walls (characters cast through `customDepthMaterial` with the texture alpha) plus the contact blob.
- **Scene light tint:** `CHAR_TINT` mixes the hemisphere sky and key colour into every character each frame (cool at night, warm at sunset), so they sit inside the light.
- **No red circles on faces:** no pink cheek ovals, no blush ovals, no red ring anger mark (`cheeks: false` in every design).
- **Anger = manga vein:** angry / annoyed faces show the four-arc red vein (ink-outlined) on the forehead plus thick V brows.
- **Teeth:** use the teeth-showing expressions (grimace, nervous, toothy, cheesy, scream, gritted, irritated, scheming, chatter) for most strong reactions.
- **Long body:** torso about 0.14-0.16 m longer than the original base (`torsoExtra`), long thin stick legs; cameras aimed at faces rise automatically (`headLift`, framings with `lift: false` for unusual poses such as a body held horizontally).
- **A different character design every video** (see below). The look above stays; the head shape, hair, proportions and palettes change.

## Characters and acting (expressive cartoon style)
**A new character design for every video (user rule).** `char.js` has `DESIGNS` (`classic`, `egg`, `bean`, `pill`; add more) and `DESIGN_HISTORY` (designs already used, newest last). Pick a design that is not the last entry (prefer one never used, or make a new preset), then append it to `DESIGN_HISTORY` in `char.js` in both the project and this skill's `starter/`. Designs are built from: head shape (round / egg / bean / pill), body length (`torsoExtra`, `legExtra`; cameras aimed at faces rise with `headLift`), hair style (fringe / side / tuft), skin, brow weight, limb thickness, leg length, painted shading and cast shadows. Each story sets `CHAR_DESIGN` and a `CAST` palette table in `world.js` (`setCharDesign` is called at the top of `buildWorld`). Never reuse the previous video's design: pick a different preset or make a new one, and record it in `camera_plan.md`. Keep the shading look: every part has painted light from the upper left with a soft core shadow on the lower right, clothes read as round 3D cloth (a clear white sheen band on the left, a chest glint, dark shading along both body edges, darker right edge, fine weave lines; limbs are plain black ink sticks), hair has a glossy streak, the head leaves a shadow on the chest, characters cast real shadows on floors and walls (`customDepthMaterial` with the texture alpha), and `CHAR_TINT` tints them with the scene light each frame. (The base body described below is the `classic` preset; all presets share the approved look above.)

Base design (never redesign, matched to the user's reference video): big round head (`HEAD_R` 0.36, about 1.3x the torso width), bright pale warm-white skin (`#fdeee0`-ish), bold even near-black outline (`#141216`, no wobble), calm half-lidded eyes (thick flat lid line over a black half-disc pupil, no white glint, set wide apart), thick short brows always visible, small off-centre smile, tiny smile, hair fringe, white collar, tie, small pear-shaped two-tone torso with pocket patch, thin black ink stick limbs like the reference video (no sleeve or trouser colour; two-segment arms and two-segment legs with knees), small black ball hands, small rounded black feet, wobbly hand-drawn ink band. Variants by design preset, palette, hat (top hat, bowler, cap, none), hair style and glasses. Painted shading (see Character look), cast shadow + contact blob, limited yaw toward camera (±0.7 rad).

Acting API (`char.js`): `c.act([{t, expr?, pose?, action?, dur?}, ...])` — expr/pose persist until the next cue; actions run for `dur` seconds.
- **Expressions** (`EXPRESSIONS`): neutral, happy, laugh, excited, surprised, shocked, annoyed, angry, furious, sad, cry, worried, confused, tired, smug, thinking, proud, determined, disgusted, plus teeth-showing faces: grimace (scared, clenched teeth), nervous (small nervous teeth grin), toothy (big laugh with upper teeth), cheesy (wide-eyed toothy smile), scream (open mouth, both rows of teeth), gritted (angry or freezing, teeth clenched), scheming (sly teeth smirk). Use the teeth faces often for strong reactions. Anger and annoyance (annoyed, angry, furious, gritted, irritated) carry the manga anger vein: four bulging red arcs with an ink outline on the forehead, plus thick V brows; chatter = teeth clenched from cold, no vein. Built from eyes (calm/open/wide/closed/blink/angry/sad/tired/squint), brows, mouth (smile/grin/laugh/open/shout/frown/flat/wavy/smirk/talk/teeth/teethSmall/teethSmirk/toothy/scream) and extras (sweat, tear, vein, shock lines, question mark, sparkle, gloom; blush and the old ring anger mark are switched off by `cheeks: false`). Automatic blinking; a head "take" pop on every expression change.
- **Poses** (`POSES`): idle, limp, wave, point, pointUp, present, presentBoth, shrug, hips, armsUp, cheer, facepalm, think, chin, cross, headHold, carry, carryBoth, hold, give, stop, hammerUp, hammerDown, tap, beg. Pose changes ease with overshoot (0.32 s).
- **Actions**: jump (anticipation squash → stretch → landing squash), hop, shake (head no), nod, tremble, slump, lean, talk (mouth flaps), walk, run (in place), spinIn, popIn. For walking or running somewhere use `move` cues (see Character movement).
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
- Pacing: plan 18-25 framings for a 60 s video. A `SHOT_PLAN` entry is one framing; several entries may share a location and a narration shot (cut inside a sentence on a word with `at` keys, or use continuous moves).
- Frame reactions in close-up (camera 0.9-1.3 m from the face, look at head height 1.4 m); establish each new location with one wide or crane move first.
- 80° vertical FOV at 9:16: frame width at the subject = 0.93 × distance, frame height = 1.68 × distance.
- Tie on-screen events to words (labels and props pop on their noun, doodles draw on their word, ticks appear on the payoff word). A word at the very end of a sentence leaves little screen time: start the event earlier or extend the key.

## Lighting (`lighting.js`) — comes from the story
**Light every location from what the narration says, not from a default.** Write a "lighting plan" table in `camera_plan.md`: location → time of day, weather, light sources, mood per beat → preset + keys. Read the narration for clues: explicit times ("at sunrise", "that night", "by noon"), weather ("storm", "winter", "fog"), places (desert, cave, ship, palace, prison), light sources (torches, candles, lanterns, fire, moon, lightning, screens) and the emotional arc (hope, danger, loss, triumph). When the text gives no clue, choose what the real event most likely looked like (historical season, place and hour) and stay consistent between shots that happen at the same moment.
- Start from a preset: `{...LOOK_PRESETS.night, keyPos: [...]}`. Presets: dawn, day, noon, goldenHour, sunset, dusk, night (moon on), overcast, storm, winter, desert, interiorWarm, interiorCool, candle, underground, underwater. Each sets fog, sky gradient, key light colour/intensity/direction, hemisphere fill and a colour grade (saturation, contrast, tint, vignette).
- Let the light change with the story: a LOOK entry can be `{keys: [{at, ...look}, ...]}` where `at` is seconds, an EV word or `'cutN'`; everything is interpolated (sun setting during "half a day", lights going out on "the lamps died", dawn breaking on "by morning", lightning-lit storm).
- Spread a mood on a beat: `MOODS.tense | sad | joyful | danger | mystery | nostalgic` (grade only), for example `{...LOOK_PRESETS.day, ...MOODS.sad}` on the failure beat, `joyful` on the payoff.
- Practical lights must exist in the world: torches/candles/fires get `FX.flame` + `FX.fireLight`; night scenes need at least one warm source near the characters so faces read; storms pair with `FX.lightning` + flashes.
- Characters are unlit flat drawings and stay bright: never make a scene so dark that faces or labels stop reading; use the grade (tint, vignette), not black.
- Check lighting in the stills: same moment → same light across cuts; key light from the upper left of the frame unless a story light source says otherwise.

## VFX (`vfx.js`) and screen effects
**Effects come from the story, never from a fixed list.** Before building, write a "VFX plan" table in `camera_plan.md`: beat (word) → what physically happens in the story → effect. Every effect must be motivated by something in the narration or on screen; a story with no fire gets no sparks, a calm story gets few effects. Match weather, era and place (rain for a storm, snow for winter, dust for deserts and roads, embers for battles, splashes for rivers and ports, confetti only for celebrations).

| Story event | Effect |
|---|---|
| explosion, cannon, bomb, gunpowder | flame + sparks + debris + smoke, white/orange flash 0.4 s, shake 0.04-0.05 |
| hammer, strike, minting, forging | sparks + dust, short warm flash, shake 0.03 |
| fire, torch, campfire, furnace | `flame` + `fireLight` + slow `smoke` (every 0.35 s) |
| storm, thunder, magic power | `lightning` + white flash + shake, `rain` |
| rain / winter / ash / petals | `rain` / `snow` / `fall` with a fitting colour |
| fall, landing, stomp, run on dirt | `dust` at the feet |
| collapse, crash, breaking | `debris` + dust + shake |
| water: drop, boat, wave | `splash` |
| idea, discovery, treasure, sparkle | `glints` |
| celebration, win, crowd cheer | `confetti` (+ chime SFX) |
| money, gold appearing | `glints` + small warm flash |
Pair each visual effect with a matching SFX from `public/sfx/` and keep it to the beat (no effect running through dialogue unless it is ambient: fire, rain, snow, smoke).

Available primitives (all frame-driven and seeded; add `obj` to the location group and push `update` to `updaters`; write new ones in the same style when the story needs something else, such as bubbles, feathers, coins raining or steam):
- `FX.sparks(pos, t0, {n, speed, repeat})`, `FX.smoke(pos, t0, {every})`, `FX.dust(pos, t0)`, `FX.debris(pos, t0)`, `FX.lightning(a, b, t0, {dur})`, `FX.flame(pos)`, `FX.fireLight(pos)`, `FX.rain(area)`, `FX.snow(area)`, `FX.fall(area, {color})`, `FX.confetti(pos, t0)`, `FX.splash(pos, t0)`, `FX.glints(pos, t0)`.
- `storyFx(T, EVt)` in `world.js` returns `{flashes: [{t, dur, color, strength}], shakes: [{t, dur, amp}]}`; time them to the impact words. Shake amp 0.02-0.05, flash 0.25-0.5 s.
- Add dust when a character lands from a jump and sparks/dust/shake on every hit.

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
