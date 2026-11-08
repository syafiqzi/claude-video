# Dashcam promo (vertical, TikTok / IG Reels) in Remotion

```bash
npm install
npm run fetch-assets        # source clip + Mixkit SFX/music -> public/
npm run studio              # live preview
npm run preview             # 540x960 draft -> out/preview.mp4
npm run render              # 1080x1920 final -> out/final.mp4
```

In a sandbox without access to Remotion's Chrome CDN, set `REMOTION_CHROME=/path/to/chrome-headless-shell`.

- `src/timeline.ts`: edit decision list (voice cuts, word timings, shots, SFX cues, music)
- `src/DashcamPromo.tsx`: composition (shots, overlays, captions, mix)
- `DashcamPromo-SafeZone`: same edit with the TikTok/IG safe-zone guide overlaid
