# Dashcam promo (vertical, TikTok / IG Reels) in Remotion

```bash
npm install
npm run fetch-assets        # source clip + Mixkit SFX/music -> public/
python3 scripts/remove_label.py  # paints out the "2K" screen label -> public/source_clean.mp4
npm run studio              # live preview
npm run preview             # 540x960 draft -> out/preview.mp4
npm run render              # 1080x1920 final -> out/final.mp4
```

In a sandbox without access to Remotion's Chrome CDN, set `REMOTION_CHROME=/path/to/chrome-headless-shell`.

- `src/timeline.ts`: edit decision list (voice cuts, word timings, shots, SFX cues, music)
- `src/DashcamPromo.tsx`: composition (shots, overlays, captions, mix)
- `DashcamPromo-SafeZone`: same edit with the TikTok/IG safe-zone guide overlaid

---

# "The Magic of Thinking Big" — 90 s vertical explainer (`ThinkBig` composition)

```bash
npm run tb:assets      # Mixkit music + SFX -> public/tb/ (not committed)
npm run studio         # preview "ThinkBig" / "ThinkBig-SafeZone"
npm run tb:render      # 1080x1920 -> out/thinkbig_raw.mp4 -> mastered out/thinkbig_final.mp4 (-14 LUFS)
```

Pipeline
1. **Narration** — `scripts/narration.txt`, voiced with ElevenLabs (voice "Brian", `eleven_turbo_v2_5`, `/with-timestamps`).
   Audio: `public/vo/narration.mp3`; word timings: `scripts/alignment.json` → `scripts/words.json`.
2. **Timing** — `scripts/build_vo_timeline.py` cuts the read into sentences and spaces them out to 90 s,
   writing `src/thinkbig/vo.ts` (segments, word times, scene starts). Every visual beat is keyed to a word via `wt("word", n)`.
3. **Illustrations + animation** — drawn in code (SVG/React) so characters and palette stay consistent:
   `src/thinkbig/parts.tsx` (character, landscape, cubes, flag, captions), `scenesA.tsx` (scenes 1–4), `scenesB.tsx` (scenes 5–7).
4. **Audio mix** — `src/thinkbig/ThinkBig.tsx`: voice, Mixkit "Motivating Mornings" ducked under speech, light SFX.
5. **Master** — `scripts/master-thinkbig.sh` (two-pass loudnorm).

`scripts/review-stills.sh <name> <sec> ...` renders a contact sheet of frames for quick visual review.
