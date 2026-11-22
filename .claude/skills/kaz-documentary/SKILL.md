---
name: kaz-documentary
description: This skill should be used when the user asks to "make a Kaz documentary", "make a documentary video", "make an evidence-board video", "animate this history script", "turn my voiceover into a documentary", "add a vintage 2D animation part", "make a silent-film style section", or wants a narrated explainer with archival photos, maps, red annotations, typed labels and one continuous camera rendered to MP4.
---

# Kaz Documentary

Build narrated documentary videos in code, in the Kaz evidence-board style. Optionally cut in vintage 2D silent-film sections for key moments. Render to MP4 with the voiceover, music bed and SFX.

Bundled scripts are in this skill's `scripts/` folder (`.claude/skills/kaz-documentary/scripts/` in this repo):

| Script | Role |
|---|---|
| `board_engine.py` | Evidence-board renderer: one world surface, a camera with keyframes, pinned cards, tags, strings, circles, stamps, year card, thesis card, end title, grain and vignette. |
| `vintage_engine.py` | Vintage 2D silent-film renderer: sepia street map, side-view street scene with a car and figures, an intertitle card, boiling lines on twos, grain, scratches, flicker, gate weave and iris wipes. |
| `align_timing.py` | Estimates sentence start times from the script and silence detection, for when Whisper is unavailable. |
| `sound_bed.py` | Synthesizes a drone, pulse and SFX from a cue JSON. No downloads. |
| `splice.sh` | Replaces a frame range of the board video with a vintage insert. |
| `mix_and_mux.sh` | Ducks the bed under the voice, normalizes to -14 LUFS and outputs a shareable MP4. |

Both engines are worked examples from a real project (Sarajevo 1914). For each new video, copy them into a project folder and edit the data blocks: asset paths, card layout, camera keys, tags, lines, ellipses, overlay times and scene drawings. Keep the rendering machinery as it is.

Read `references/style-guide.md` before planning shots. Read `references/engine-guide.md` before editing an engine.

## Workflow

1. **Intake.** Collect the voiceover (or script), the images, aspect ratio (16:9 by default), resolution (1080p by default), and which moments should become vintage 2D sections. Use the defaults when unstated and say so.
2. **Assets rule.** Photos of real people and real archival photos must come from the user. Never download photos of real people from the web. Suggest public-domain sources (Wikimedia Commons, the Library of Congress). Generate maps, notes, stamps, labels, intertitles and 2D drawings yourself. Never recreate a real outlet's logo or masthead; use the user's screenshot or a generic masthead.
3. **Timing.** Try faster-whisper for word timestamps. If the model can't download, ask for the script text and run `align_timing.py` (edit its sentence list), then sanity-check the starts against the pause list it prints.
4. **Shot list.** One beat per sentence. For each beat give the time range, beat recipe (style-guide §2), assets, trigger word and camera move. Mark vintage-2D beats. Share it briefly along with any missing images.
5. **Build the board.** Copy `board_engine.py` and edit the data blocks. Render stills at one timestamp per beat (`python3 board_engine.py stills 2,9,22,...`), tile them into a contact sheet, and look at it. Fix layout, colour (frames are BGR), font glyphs and camera targets before the full render. Locate map coordinates by drawing a grid over the map image.
6. **Build vintage inserts.** Copy `vintage_engine.py`, set `T0`/`T1` to the insert's frame range, redraw the scenes for the story, and keep the film treatment, twos, iris wipes and the red-only accent. Check stills, especially the order of action relative to the voiceover.
7. **Render.** Split the full render into chunks, one process per CPU core (`python3 board_engine.py full START END part.mp4`), then concat. Render each insert, then run `splice.sh`.
8. **Sound.** Write a cue JSON (whooshes on camera moves, typing on tags, thuds on stamps, shots, scratches on circles, `film` and `engine` ranges over inserts), run `sound_bed.py`, then `mix_and_mux.sh`.
9. **QC and deliver.** Pull five or so frames around each insert boundary and key mark. Check that marks land on their words, no text is cut off, and there are no glyph boxes. Send the MP4 with a short description of what happens, and note that timing was estimated if Whisper wasn't used.

## Rules

- Keep one continuous camera with no hard cuts, except planned world changes (iris wipes into and out of vintage inserts, a glitch into the end title).
- Use red only for meaning: circles, strings, stamps, key labels and the end title.
- Keep violence non-graphic: flash, smoke and an intertitle, never blood or wounds.
- Keep the file small: shareable encodes at CRF 24. Grain inflates the bitrate.
