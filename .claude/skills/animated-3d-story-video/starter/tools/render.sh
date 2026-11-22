#!/bin/bash
# Full render of one or more compositions, then loudness-normalise to -14 LUFS.
# usage: tools/render.sh CompA [CompB ...]   -> out/<Comp>_final.mp4
cd "$(dirname "$0")/.."
BX=${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
for c in "$@"; do
  npx remotion render src/index.jsx $c out/$c.mp4 --gl=angle --concurrency=4 --image-format=jpeg --jpeg-quality=92 --crf=17 --browser-executable=$BX --log=error > out/render_$c.log 2>&1 || { echo "$c FAILED"; tail -30 out/render_$c.log; continue; }
  ffmpeg -y -loglevel error -i out/$c.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 out/${c}_final.mp4
  ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact out/${c}_final.mp4
done
