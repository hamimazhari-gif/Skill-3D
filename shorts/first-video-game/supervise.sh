#!/usr/bin/env bash
# keep both renders alive until all frames exist
cd "$(dirname "$0")"
while true; do
  a=$(ls frames_id | wc -l); b=$(ls frames_en | wc -l)
  [ "$a" -ge 2221 ] && [ "$b" -ge 2159 ] && { echo "ALL DONE id $a en $b"; exit 0; }
  if [ "$a" -lt 2221 ] && ! pgrep -f "render.mjs frames_id" >/dev/null; then echo "restart id at $a"; (HASH="#id" RESUME=1 node render.mjs frames_id "0-2220" >> render_id2.log 2>&1 &) ; fi
  if [ "$b" -lt 2159 ] && ! pgrep -f "render.mjs frames_en" >/dev/null; then echo "restart en at $b"; (HASH="#en" RESUME=1 node render.mjs frames_en "0-2158" >> render_en2.log 2>&1 &) ; fi
  sleep 30
done
