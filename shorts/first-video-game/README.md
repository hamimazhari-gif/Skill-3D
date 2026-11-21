# GTA 6 vs the 1958 tennis game (ID + EN, ~72 s)

Made with the `cartoon-audio-short` skill, same engine as `shorts/microwave`.
Scenes: neon city (billboard counter, money tower, coin stacks, queue), the 1958 Brookhaven visitors' day
(oscilloscope with a live tennis screen incl. Moon/Jupiter modes, aluminium controllers, spare-parts crate),
and the morph back to now (dot races through the city, box becomes a controller, 1958 grandpa in today's queue).
`web/story.js` reads `#id` / `#en` and takes its beats from `web/beats.js` (`make_beats.py`).
`align2.py` is a fallback aligner (syllable-rate DP over silence segments) for recordings where timing.py drifts.
