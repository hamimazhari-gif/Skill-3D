#!/usr/bin/env bash
# Swap in a new narration recording (same timing as narration_tail.wav) without re-rendering the picture.
# Usage: remix_voice.sh narasi_baru.wav
set -e
cd "$(dirname "$0")"
OUT=Pearl_Harbor_Kaz
ffmpeg -loglevel error -y -i ${OUT}_1080p.mp4 -i "$1" -i bed.wav -filter_complex \
 "[1:a]aresample=48000,asplit=2[v1][v2];[2:a]aformat=channel_layouts=mono[b];[b][v1]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[bd];[bd][v2]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart ${OUT}_1080p_new.mp4
mv ${OUT}_1080p_new.mp4 ${OUT}_1080p.mp4
PL=/tmp/claude-0/-home-user-Skill-3D/c280758a-1754-5c85-83f9-bb7bca6b2e9c/scratchpad/ph
VF="scale=1280:720:flags=lanczos,hqdn3d=1.5:1.5:4:4"
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 600k -pass 1 -passlogfile $PL -an -f null /dev/null
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$VF" -c:v libx264 -preset slow -b:v 600k -pass 2 -passlogfile $PL -c:a aac -b:a 112k -movflags +faststart ${OUT}_720p.mp4
V5="scale=960:540,hqdn3d=3:3:6:6"
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 300k -pass 1 -passlogfile $PL -an -f mp4 /dev/null
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vf "$V5" -c:v libx264 -preset medium -b:v 300k -pass 2 -passlogfile $PL -c:a aac -b:a 96k -movflags +faststart ${OUT}_540p.mp4
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vn -ar 48000 -c:a libmp3lame -b:a 192k Pearl_Harbor_Audio_Lengkap.mp3
ffmpeg -v error -y -i ${OUT}_1080p.mp4 -vn -c:a copy Pearl_Harbor_Audio_Lengkap.m4a
ls -la *.mp4 Pearl_Harbor_Audio_Lengkap.*
echo ALLDONE
