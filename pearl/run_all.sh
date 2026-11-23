#!/usr/bin/env bash
# Full pipeline: render board (4 chunks) -> concat -> sound bed -> mix -> 1080p HQ / 720p / 540p deliverables
set -e
cd "$(dirname "$0")"
OUT=Pearl_Harbor_Kaz
N=$(python3 -c "import json,math;print(math.ceil(json.load(open('timing_gap.json'))['duration']*30))")
mkdir -p parts
for i in 0 1 2 3; do [ -s parts/p$i.done ] || (python3 kazph.py full $((N*i/4)) $((N*(i+1)/4)) parts/p$i.mp4 && echo ok > parts/p$i.done) & done; wait
printf "file 'p%s.mp4'\n" 0 1 2 3 > parts/list.txt
python3 make_cues.py
python3 /root/.claude/skills/kaz-documentary/scripts/sound_bed.py cues.json bed.wav
ffmpeg -v error -y -f concat -safe 0 -i parts/list.txt -c copy board.mp4
bash /root/.claude/skills/kaz-documentary/scripts/mix_and_mux.sh board.mp4 narration_gap.wav bed.wav ${OUT}_1080p.mp4
rm -f board.mp4
PL=/tmp/claude-0/-home-user-Skill-3D/c280758a-1754-5c85-83f9-bb7bca6b2e9c/scratchpad/ph
VF="scale=1280:720:flags=lanczos,hqdn3d=1.5:1.5:4:4"
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 600k -pass 1 -passlogfile $PL -an -f null /dev/null
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 600k -pass 2 -passlogfile $PL -c:a aac -b:a 112k -movflags +faststart ${OUT}_720p.mp4
V5="scale=960:540,hqdn3d=3:3:6:6"
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 300k -pass 1 -passlogfile $PL -an -f mp4 /dev/null
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 300k -pass 2 -passlogfile $PL -c:a aac -b:a 96k -movflags +faststart ${OUT}_540p.mp4
VH="hqdn3d=1.5:1.5:4:4"
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VH" -c:v libx264 -preset slow -b:v 2000k -pass 1 -passlogfile $PL -an -f mp4 /dev/null
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VH" -c:v libx264 -preset slow -b:v 2000k -pass 2 -passlogfile $PL -c:a aac -b:a 192k -movflags +faststart ${OUT}_1080p_HQ.mp4
rm -rf parts
ls -la *.mp4
echo ALLDONE
