#!/usr/bin/env bash
# Renders frames at the given seconds into out/review/ and tiles them into a contact sheet.
set -euo pipefail
cd "$(dirname "$0")/.."
export REMOTION_CHROME=${REMOTION_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}
name=$1; shift
files=()
for s in "$@"; do
  f=$(python3 -c "print(round($s*30))")
  npx remotion still src/index.ts ThinkBig out/review/${name}_$s.png --frame=$f --scale=0.4 --log=error >/dev/null
  files+=(out/review/${name}_$s.png)
done
montage=$(printf '%s ' "${files[@]}")
python3 - "$name" "${files[@]}" <<'PY'
import sys
from PIL import Image, ImageDraw
name, files = sys.argv[1], sys.argv[2:]
ims=[Image.open(f) for f in files]
w,h=ims[0].size
sheet=Image.new('RGB',(w*len(ims)+8*(len(ims)-1),h+40),'white')
d=ImageDraw.Draw(sheet)
for i,(im,f) in enumerate(zip(ims,files)):
    sheet.paste(im,(i*(w+8),40)); d.text((i*(w+8)+6,10),f.split('_')[-1][:-4]+'s',fill='black')
sheet.save(f'out/review/sheet_{name}.png')
PY
