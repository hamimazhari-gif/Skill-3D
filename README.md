# Skill-3D
Make animation 3D Stick

A Claude Code skill, **`cartoon-audio-short`**: idea → script → your voiceover → finished vertical
cartoon short (1080x1920, 30 fps MP4). Flat bean-head cartoon cards in an inked, painted three.js world,
rendered in headless Chromium (no GPU), with a synthesized music bed and SFX locked at 50 % of the voice level.

```
.claude/skills/cartoon-audio-short/
  SKILL.md            the workflow Claude follows (10 ideas → script → build)
  kit/engine/         renderer (main.js), painted textures, cast drawing, motion helpers
  kit/tools/          setup.sh, timing.py, render.mjs, sheet.py, mix.py, finish.sh
  kit/example/soldier worked example "The Soldier Who Never Left"
  kit/vendor/         three.js r160 + toon.ts Pen library (both MIT, licenses included)
```

## Install
- **In this repo:** nothing to do. Claude Code loads project skills from `.claude/skills/` automatically.
- **For all your projects:** `cp -r .claude/skills/cartoon-audio-short ~/.claude/skills/`

Then ask Claude for "a cartoon short" (or run `/cartoon-audio-short`).

Requirements: Node 22.6+, Python 3 with numpy + Pillow, ffmpeg, Playwright with Chromium.

Built on github.com/mromidev/claude-animated-shorts (MIT): toon.ts, look values and readability rules.
