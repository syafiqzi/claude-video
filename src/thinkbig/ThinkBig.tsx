import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Grain } from "./parts";
import { Scene1, Scene2, SceneWalls } from "./scenesA";
import { Scene5, Scene6, Scene7 } from "./scenesB";
import { C, DURATION_FRAMES, FPS, SCENE, clamp, sec, wt } from "./theme";
import { VO_SEGMENTS } from "./vo";

// ---------------- fonts ----------------
const fontHandle = delayRender("tb-fonts");
Promise.all(
  [
    ["Montserrat", "fonts/montserrat-latin-700-normal.woff2", "700"],
    ["Montserrat", "fonts/montserrat-latin-800-normal.woff2", "800"],
    ["Montserrat", "fonts/montserrat-latin-900-normal.woff2", "900"],
  ].map(async ([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
    await face.load();
    document.fonts.add(face);
  }),
).then(() => continueRender(fontHandle));

// ---------------- scenes ----------------
const XFADE = 14; // frames
// Scenes 3 and 4 share one continuous set (the walls are built, then broken).
const SCENES: { from: number; to: number; C: React.FC }[] = [
  { from: SCENE[0], to: SCENE[1], C: Scene1 },
  { from: SCENE[1], to: SCENE[2], C: Scene2 },
  { from: SCENE[2], to: SCENE[4], C: SceneWalls },
  { from: SCENE[4], to: SCENE[5], C: Scene5 },
  { from: SCENE[5], to: SCENE[6], C: Scene6 },
  { from: SCENE[6], to: DURATION_FRAMES / FPS, C: Scene7 },
];

const SceneLayer: React.FC<{ from: number; to: number; C: React.FC; first: boolean }> = ({ from, to, C: Comp, first }) => {
  const frame = useCurrentFrame();
  const f0 = sec(from);
  const f1 = sec(to) + XFADE;
  if (frame < f0 || frame >= f1) return null;
  const o = first ? 1 : interpolate(frame, [f0, f0 + XFADE], [0, 1], clamp);
  const s = first ? 1 : interpolate(frame, [f0, f0 + XFADE], [1.04, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${s})` }}>
      <Comp />
    </AbsoluteFill>
  );
};

// ---------------- audio ----------------
const VOICE_GAIN = 1.0;
const MUSIC = { file: "tb/music/m474.mp3", startAt: 27 }; // track's natural ending lands on our end card
const SPEECH = VO_SEGMENTS.map((s) => [s.at + 0.05, s.at + (s.srcTo - s.srcFrom) - 0.1]);
const musicVolume = (frame: number) => {
  const t = frame / FPS;
  let dist = Infinity;
  for (const [a, b] of SPEECH) {
    if (t >= a && t <= b) {
      dist = 0;
      break;
    }
    dist = Math.min(dist, Math.abs(t - a), Math.abs(t - b));
  }
  const ducked = 0.11;
  const open = 0.24;
  const v = ducked + (open - ducked) * Math.min(1, Math.max(0, dist - 0.1) / 0.5);
  const fadeIn = interpolate(frame, [0, 20], [0.3, 1], clamp);
  const fadeOut = interpolate(frame, [DURATION_FRAMES - 60, DURATION_FRAMES], [1, 0], clamp);
  return v * fadeIn * fadeOut;
};

const SFX: { t: number; file: string; vol: number }[] = [
  { t: wt("extraordinary") - 0.1, file: "whoosh", vol: 0.12 },
  { t: wt("while") + 0.4, file: "pop", vol: 0.14 },
  { t: SCENE[1] - 0.15, file: "whoosh", vol: 0.16 },
  { t: wt("In") - 0.5, file: "pop", vol: 0.16 },
  { t: wt("intelligence") - 0.1, file: "bubble", vol: 0.3 },
  { t: wt("talent") - 0.2, file: "bubble", vol: 0.3 },
  { t: wt("beliefs") - 0.1, file: "bubble", vol: 0.32 },
  { t: wt("ambitions") - 0.3, file: "whoosh", vol: 0.14 },
  { t: SCENE[2] - 0.15, file: "whoosh", vol: 0.14 },
  { t: wt("What", 0) - 0.05, file: "bubble", vol: 0.3 },
  { t: wt("What", 1) - 0.05, file: "bubble", vol: 0.3 },
  { t: wt("Questions") + 0.25, file: "tick", vol: 0.25 },
  { t: wt("Questions") + 0.55, file: "tick", vol: 0.25 },
  { t: wt("Questions") + 0.85, file: "tick", vol: 0.25 },
  { t: wt('"Can') - 0.1, file: "pop", vol: 0.16 },
  { t: wt('"What', 2) - 0.15, file: "whoosh", vol: 0.12 },
  { t: wt('possible?"') + 0.75, file: "glass", vol: 0.32 },
  { t: wt('possible?"') + 1.4, file: "sparkle", vol: 0.3 },
  { t: SCENE[4] - 0.15, file: "whoosh", vol: 0.14 },
  { t: wt("finish") + 0.95, file: "tick", vol: 0.3 },
  { t: wt("leader") - 0.2, file: "whoosh", vol: 0.14 },
  { t: wt("improve"), file: "pop", vol: 0.12 },
  { t: SCENE[5] - 0.15, file: "whoosh", vol: 0.14 },
  { t: wt("Start") + 0.4, file: "tick", vol: 0.28 },
  { t: wt("Identify") + 0.4, file: "tick", vol: 0.28 },
  { t: wt("Break") + 0.4, file: "tick", vol: 0.28 },
  { t: wt("And", 1) + 0.4, file: "tick", vol: 0.28 },
  { t: wt("people", 1) - 0.1, file: "bubble", vol: 0.25 },
  { t: SCENE[6] - 0.15, file: "whoosh", vol: 0.14 },
  { t: wt("discovering") + 0.1, file: "whoosh", vol: 0.16 },
  { t: wt("discovering") + 0.5, file: "sparkle", vol: 0.3 },
  { t: wt("So", 1) + 0.6, file: "sparkle", vol: 0.22 },
];

const SoundTrack: React.FC = () => (
  <>
    {VO_SEGMENTS.map((seg) => {
      const from = sec(seg.at);
      const trimBefore = sec(seg.srcFrom);
      const trimAfter = sec(seg.srcTo);
      const len = trimAfter - trimBefore;
      return (
        <Sequence key={seg.at} from={from} durationInFrames={len}>
          <Audio
            src={staticFile("vo/narration.mp3")}
            trimBefore={trimBefore}
            trimAfter={trimAfter}
            volume={(fr) => VOICE_GAIN * interpolate(fr, [0, 1, len - 2, len], [0, 1, 1, 0], clamp)}
          />
        </Sequence>
      );
    })}
    <Audio src={staticFile(MUSIC.file)} trimBefore={sec(MUSIC.startAt)} volume={musicVolume} />
    {SFX.map((s, i) => (
      <Sequence key={i} from={Math.max(0, sec(s.t))}>
        <Audio src={staticFile(`tb/sfx/${s.file}.mp3`)} volume={s.vol} />
      </Sequence>
    ))}
  </>
);

// ---------------- composition ----------------
export const ThinkBig: React.FC<{ showSafeZone?: boolean }> = ({ showSafeZone }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      {SCENES.map((s, i) => (
        <SceneLayer key={i} {...s} first={i === 0} />
      ))}
      <Grain />
      {fadeIn > 0 && <AbsoluteFill style={{ background: C.paper, opacity: fadeIn }} />}
      <SoundTrack />
      {showSafeZone && <SafeZone />}
    </AbsoluteFill>
  );
};

const SafeZone: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220, background: "rgba(255,0,0,0.18)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 420, background: "rgba(255,0,0,0.18)" }} />
    <div style={{ position: "absolute", right: 0, top: 220, bottom: 420, width: 140, background: "rgba(255,0,0,0.12)" }} />
  </AbsoluteFill>
);
