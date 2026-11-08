#!/usr/bin/env bash
# Music + SFX for the "Thinking Big" explainer. Mixkit free licence (https://mixkit.co/license/), not committed.
set -euo pipefail
cd "$(dirname "$0")/../public"
mkdir -p tb/sfx tb/music
# "Motivating Mornings" — Mixkit music #474
[ -f tb/music/m474.mp3 ] || curl -sS -o tb/music/m474.mp3 "https://assets.mixkit.co/music/474/474.mp3"
declare -A SFX=([whoosh]=1714 [pop]=2364 [glass]=1317 [sparkle]=3005 [tick]=2357 [bubble]=2356)
for name in "${!SFX[@]}"; do
  id=${SFX[$name]}
  [ -f "tb/sfx/$name.mp3" ] || curl -sS -o "tb/sfx/$name.mp3" "https://assets.mixkit.co/active_storage/sfx/$id/$id-preview.mp3"
done
echo "Thinking Big assets ready."
