#!/bin/bash
# Render a composition in frame chunks (each kept on disk, so a restart only redoes the unfinished chunk),
# then the audio, then join and loudness-normalise to -14 LUFS.  usage: tools/render_chunks.sh Comp [chunks]
cd "$(dirname "$0")/.."
BX=${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
C=$1; N=${2:-4}; D=out/chunks_$C; mkdir -p $D
F=$(npx remotion compositions src/index.jsx --browser-executable=$BX 2>/dev/null | awk -v c=$C '$1==c {print $4}')
[ -z "$F" ] && { echo "no frame count"; exit 1; }
S=$(( (F + N - 1) / N ))
for i in $(seq 0 $((N-1))); do
  a=$((i*S)); b=$(( (i+1)*S - 1 )); [ $b -ge $F ] && b=$((F-1)); o=$D/part_$i.mp4
  [ -f $o.done ] && continue
  npx remotion render src/index.jsx $C $o --frames=$a-$b --muted --gl=angle --concurrency=4 --image-format=jpeg --jpeg-quality=92 --crf=17 --browser-executable=$BX --log=error > $D/log_$i.txt 2>&1 || { echo "chunk $i FAILED"; tail -20 $D/log_$i.txt; exit 1; }
  touch $o.done; echo "chunk $i done ($a-$b)"
done
[ -f $D/audio.wav ] || npx remotion render src/index.jsx $C $D/audio.wav --codec=wav --browser-executable=$BX --log=error > $D/log_audio.txt 2>&1 || { echo "audio FAILED"; tail -20 $D/log_audio.txt; exit 1; }
: > $D/list.txt; for i in $(seq 0 $((N-1))); do echo "file 'part_$i.mp4'" >> $D/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i $D/list.txt -i $D/audio.wav -map 0:v -map 1:a -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k -ar 48000 -shortest out/${C}_final.mp4
ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of compact out/${C}_final.mp4
