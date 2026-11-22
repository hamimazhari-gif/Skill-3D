#!/bin/bash
# Render half-scale stills at given times (seconds) and a contact sheet.
# usage: tools/stills.sh COMPOSITION PREFIX t1 t2 ...   -> out/PREFIX_<t>.png + out/PREFIX_sheet.png
cd "$(dirname "$0")/.."
BX=${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
COMP=$1; PRE=$2; shift 2
rm -rf out/bundle; npx remotion bundle src/index.jsx --out-dir=out/bundle --log=error >/dev/null 2>&1 || { npx remotion bundle src/index.jsx --out-dir=out/bundle 2>&1 | tail -20; exit 1; }
files=()
for t in "$@"; do
  f=$(python3 -c "print(round($t*30))"); o=out/${PRE}_$(printf "%05.1f" $t).png
  npx remotion still out/bundle $COMP $o --frame=$f --scale=0.5 --gl=swangle --browser-executable=$BX --log=error 2>&1 | grep -vE "MemAvailable|docker run|lower amount|CGroup|differing" | tail -5
  files+=($o)
done
python3 -I tools/contact_sheet.py out/${PRE}_sheet.png "${files[@]}"
