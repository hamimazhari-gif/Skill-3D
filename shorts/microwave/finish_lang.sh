#!/usr/bin/env bash
# bash finish_lang.sh <id|en> "Title"
set -e; cd "$(dirname "$0")"; L=$1
W=$(mktemp -d "$PWD/fin_$L.XXXX"); ln -s "$PWD/frames_$L" "$W/frames"; cp "mix_raw_$L.wav" "$W/mix_raw.wav"; cp finish.sh "$W/"
( cd "$W" && bash finish.sh "$2" ) ; mkdir -p out; mv "$W"/out/* out/ ; mv "out/qa_sheet.jpg" "out/qa_sheet_$L.jpg"; rm -rf "$W"
