#!/usr/bin/env bash
cd "$(dirname "$0")"
( HASH="#id" RESUME=1 node render.mjs frames_id "0-2220" > render_id.log 2>&1; echo "EXIT id $?" >> render_id.log ) &
( HASH="#en" RESUME=1 node render.mjs frames_en "0-2224" > render_en.log 2>&1; echo "EXIT en $?" >> render_en.log ) &
wait
