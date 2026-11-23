#!/usr/bin/env bash
# Full pipeline: render board (4 chunks) -> concat -> sound bed -> mix -> 720p deliverable
set -e
cd "$(dirname "$0")"
N=$(python3 -c "import json,math;print(math.ceil(json.load(open('timing_gap.json'))['duration']*30))")
rm -rf parts; mkdir -p parts
for i in 0 1 2 3; do python3 kaz30.py full $((N*i/4)) $((N*(i+1)/4)) parts/p$i.mp4 & done; wait
printf "file 'p%s.mp4'\n" 0 1 2 3 > parts/list.txt
ffmpeg -v error -y -f concat -safe 0 -i parts/list.txt -c copy board.mp4
python3 make_cues.py
python3 /root/.claude/skills/kaz-documentary/scripts/sound_bed.py cues.json bed.wav
bash /root/.claude/skills/kaz-documentary/scripts/mix_and_mux.sh board.mp4 narration_gap.wav bed.wav Perang_Tiga_Puluh_Tahun_Kaz_1080p.mp4
PL=/tmp/claude-0/-home-user-Skill-3D/c280758a-1754-5c85-83f9-bb7bca6b2e9c/scratchpad/p2
VF="scale=1280:720:flags=lanczos,hqdn3d=1.5:1.5:4:4"
ffmpeg -v error -y -i Perang_Tiga_Puluh_Tahun_Kaz_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 780k -pass 1 -passlogfile $PL -an -f null /dev/null
ffmpeg -v error -y -i Perang_Tiga_Puluh_Tahun_Kaz_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 780k -pass 2 -passlogfile $PL -c:a aac -b:a 128k -movflags +faststart Perang_Tiga_Puluh_Tahun_Kaz_720p.mp4
V5="scale=960:540,hqdn3d=3:3:6:6"
ffmpeg -v error -y -i Perang_Tiga_Puluh_Tahun_Kaz_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 330k -pass 1 -passlogfile $PL -an -f mp4 /dev/null
ffmpeg -v error -y -i Perang_Tiga_Puluh_Tahun_Kaz_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 330k -pass 2 -passlogfile $PL -c:a aac -b:a 96k -movflags +faststart Perang_Tiga_Puluh_Tahun_Kaz_540p.mp4
VH="hqdn3d=1.5:1.5:4:4"
ffmpeg -v error -y -i Perang_Tiga_Puluh_Tahun_Kaz_1080p.mp4 -vf "$VH" -c:v libx264 -preset slow -b:v 2800k -pass 1 -passlogfile $PL -an -f mp4 /dev/null
ffmpeg -v error -y -i Perang_Tiga_Puluh_Tahun_Kaz_1080p.mp4 -vf "$VH" -c:v libx264 -preset slow -b:v 2800k -pass 2 -passlogfile $PL -c:a aac -b:a 192k -movflags +faststart Perang_Tiga_Puluh_Tahun_Kaz_1080p_HQ.mp4
rm -f board.mp4 parts/p*.mp4
ls -la *.mp4
