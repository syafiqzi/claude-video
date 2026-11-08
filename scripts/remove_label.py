#!/usr/bin/env python3
"""Removes the "2K" label on the dashcam screen: tracks it per frame (template matching) and
paints it over with the bar colour. Run from repo root after fetch-assets: python3 scripts/remove_label.py"""
import os, subprocess
os.makedirs("_dl", exist_ok=True); os.chdir("_dl")
for d in ("nf", "cf"): os.makedirs(d, exist_ok=True)
subprocess.run(["ffmpeg","-v","error","-y","-i","../public/source.mp4","-vsync","0","nf/%03d.png"],check=True)
subprocess.run(["cp","../public/source.mp4","source.mp4"],check=True)
# --- tracking ---
import cv2, numpy as np, json

def load(i): return cv2.imread(f"nf/{i:03d}.png")
shots = {
  "A": dict(frames=range(1, 61), ref=25, box=(464, 256, 48, 26)),
  "D": dict(frames=range(176, 241), ref=193, box=(576, 249, 46, 28)),
}
res = {}
for name, s in shots.items():
    x,y,w,h = s["box"]; ref = load(s["ref"]); tpl = cv2.cvtColor(ref[y:y+h, x:x+w], cv2.COLOR_BGR2GRAY)
    prev = (x, y, 1.0)
    for i in s["frames"]:
        g = cv2.cvtColor(load(i), cv2.COLOR_BGR2GRAY)
        best = None
        for sc in np.arange(0.8, 1.3, 0.025):
            t = cv2.resize(tpl, None, fx=sc, fy=sc)
            px, py = prev[0], prev[1]
            x0, y0 = max(0, int(px - 90)), max(0, int(py - 70))
            roi = g[y0:y0+140+t.shape[0], x0:x0+180+t.shape[1]]
            if roi.shape[0] < t.shape[0] or roi.shape[1] < t.shape[1]: continue
            r = cv2.matchTemplate(roi, t, cv2.TM_CCOEFF_NORMED); _, mv, _, ml = cv2.minMaxLoc(r)
            if best is None or mv > best[0]: best = (mv, x0+ml[0], y0+ml[1], sc, t.shape[1], t.shape[0])
        mv, bx, by, sc, tw, th = best
        res[i] = dict(score=round(float(mv),3), x=int(bx), y=int(by), w=int(tw), h=int(th))
        if mv > 0.5: prev = (bx, by, sc)
json.dump(res, open("track.json","w"))
for i in list(res)[::4]: print(i, res[i])
# --- paint-over ---
import cv2, json, numpy as np, shutil
r = {int(k): v for k, v in json.load(open("track.json")).items()}
targets = list(range(1, 61)) + list(range(178, 195))
rng = np.random.default_rng(1)
for i in range(1, 241):
    src = f"nf/{i:03d}.png"
    if i not in targets:
        shutil.copy(src, f"cf/{i:03d}.png"); continue
    b = r[max(i, 180)] if i >= 178 else r[i]
    img = cv2.imread(src).astype(np.float32)
    h = b["h"]
    x0, x1 = b["x"] + 1, b["x"] + b["w"] + int(0.15 * h)
    y0, y1 = b["y"] + int(round(0.04 * h)), b["y"] + int(round(0.85 * h))
    ref = img[y0:y1 + 1, x1 + 3:x1 + 3 + int(0.8 * h)]          # clean bar to the right, same rows
    rows = np.median(ref, axis=1)                                 # per-row colour keeps bar edges
    out = img.copy()
    out[y0:y1 + 1, x0:x1] = rows[:, None, :] + rng.normal(0, 1.0, (y1 - y0 + 1, x1 - x0, 3))
    alpha = np.zeros(img.shape[:2], np.float32); alpha[y0:y1 + 1, x0:x1] = 1
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)[..., None]
    cv2.imwrite(f"cf/{i:03d}.png", np.clip(img * (1 - alpha) + out * alpha, 0, 255).astype(np.uint8))
subprocess.run(["ffmpeg","-v","error","-y","-framerate","24","-i","cf/%03d.png","-i","source.mp4","-map","0:v","-map","1:a","-c:v","libx264","-crf","10","-preset","slow","-pix_fmt","yuv420p","-c:a","copy","../public/source_clean.mp4"],check=True)
