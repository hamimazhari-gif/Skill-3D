#!/usr/bin/env bash
# Re-finish after adding the 5 s end tail: concat board parts, rebuild sound, mix, encode 720p + 540p
set -e
cd "$(dirname "$0")"
OUT=Pearl_Harbor_Kaz
python3 make_cues.py
python3 /root/.claude/skills/kaz-documentary/scripts/sound_bed.py cues.json bed.wav
ffmpeg -v error -y -f concat -safe 0 -i parts/list2.txt -c copy board.mp4
ffmpeg -v error -y -i narration_gap.wav -af apad=pad_dur=5 narration_tail.wav
bash /root/.claude/skills/kaz-documentary/scripts/mix_and_mux.sh board.mp4 narration_tail.wav bed.wav ${OUT}_1080p.mp4
rm -f board.mp4
PL=/tmp/claude-0/-home-user-Skill-3D/c280758a-1754-5c85-83f9-bb7bca6b2e9c/scratchpad/ph
VF="scale=1280:720:flags=lanczos,hqdn3d=1.5:1.5:4:4"
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 600k -pass 1 -passlogfile $PL -an -f null /dev/null
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 600k -pass 2 -passlogfile $PL -c:a aac -b:a 112k -movflags +faststart ${OUT}_720p.mp4
V5="scale=960:540,hqdn3d=3:3:6:6"
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 300k -pass 1 -passlogfile $PL -an -f mp4 /dev/null
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 300k -pass 2 -passlogfile $PL -c:a aac -b:a 96k -movflags +faststart ${OUT}_540p.mp4
ls -la *.mp4
echo ALLDONE
