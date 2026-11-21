# The Candy Bar That Invented the Microwave (ID + EN)

Made with the `cartoon-audio-short` skill. One shot plan, two timings: `web/story.js` reads `#id` or `#en`
from the page hash and takes its beats from `web/beats.js` (built by `make_beats.py` from `work/<lang>/words.json`).

Rebuild: `bash ../../.claude/skills/cartoon-audio-short/kit/tools/setup.sh <dir>`, copy these files over it,
add `voice_id.wav` / `voice_en.wav`, then `cat web/toonbase.js web/roman.js > web/toon.js`,
`bash render_all.sh`, `python3 audio.py <lang>`, `python3 mix.py voice_<lang>.wav music_<lang>.wav sfx_<lang>.wav mix_raw_<lang>.wav`.
