#!/usr/bin/env bash
# Downloads the source clip, SFX and music into public/.
# SFX + music: Mixkit (free licence, https://mixkit.co/license/) — not committed to git.
set -euo pipefail
cd "$(dirname "$0")/../public"
mkdir -p sfx music

if [ ! -f source.mp4 ]; then
  curl -sSL -o source.mp4 \
    "https://drive.usercontent.google.com/download?id=1igNSe1lVrL0aR47QDwZ0Kc0RhlxDt0St&export=download&confirm=t"
fi

declare -A SFX=(
  [bass_hit]=563 [sweep_small]=166 [sweep_fast]=174 [pop_hard]=2364 [pop_whoosh]=3005
  [impact_zoom]=772 [glitch_scifi]=1022 [tech_slide]=3120 [click_ui]=2568 [confirm]=2867
  [riser]=790 [coin_prize]=1999 [coins]=1993 [sparkle]=3060 [pop_msg]=2354
)
for name in "${!SFX[@]}"; do
  id=${SFX[$name]}
  [ -f "sfx/$name.mp3" ] || curl -sS -o "sfx/$name.mp3" \
    "https://assets.mixkit.co/active_storage/sfx/$id/$id-preview.mp3"
done

# "Hazy After Hours" — Mixkit music #132
[ -f music/m132.mp3 ] || curl -sS -o music/m132.mp3 "https://assets.mixkit.co/music/132/132.mp3"
echo "Assets ready."
