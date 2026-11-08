import { Easing, interpolate } from "remotion";
import { DURATION_S, SCENE_STARTS, WORDS } from "./vo";

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION_FRAMES = Math.round(DURATION_S * FPS);

// Palette — warm paper + teal landscape (ref 1), orange/blue summit accents (refs 2–5).
export const C = {
  paper: "#F7E9CC",
  paperLight: "#FBF2DF",
  skyTop: "#F6DDB0",
  skyLow: "#FAEBCF",
  sunPale: "#FCEFD2",
  sun: "#F08A4B",
  sunDeep: "#E2632D",
  amber: "#E9A75A",
  amberLight: "#F3C887",
  orange: "#E8672F",
  orangeLight: "#F29A5C",
  teal900: "#0E3540",
  teal800: "#164652",
  teal700: "#1F5A63",
  teal600: "#2E7471",
  teal500: "#4C8C84",
  sage: "#7FAE9E",
  sageLight: "#A9C9B6",
  mist: "#CFE0D2",
  navy: "#13283A",
  ink: "#12313A",
  cream: "#FFF6E6",
  grey: "#8C9A9B",
  greyLight: "#C3CBC8",
} as const;

export const FONT = "Montserrat, sans-serif";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const sec = (s: number) => Math.round(s * FPS);

/** Output time (s) of the nth occurrence (0-based) of a narration word (punctuation-insensitive prefix match). */
export const wt = (word: string, nth = 0, edge: "s" | "e" = "s"): number => {
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z']/g, "");
  const target = norm(word);
  const hits = WORDS.filter((w) => norm(w.w) === target);
  const hit = hits[nth];
  if (!hit) throw new Error(`word not found: ${word} #${nth}`);
  return hit[edge];
};

export const SCENE = SCENE_STARTS; // [s1..s7] start times in seconds
export const sceneEnd = (i: number) => (i + 1 < SCENE.length ? SCENE[i + 1] : DURATION_S);

/** 0→1 ramp starting at time `t` (s) lasting `d` (s), eased. */
export const ramp = (frame: number, t: number, d = 0.6, easing = Easing.bezier(0.33, 0, 0.2, 1)) =>
  interpolate(frame, [t * FPS, (t + d) * FPS], [0, 1], { ...clamp, easing });

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const mixColor = (a: string, b: string, p: number) => {
  const parse = (c: string) =>
    c.startsWith("#") ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const pa = parse(a);
  const pb = parse(b);
  return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], p))).join(",")})`;
};

/** Overshooting pop 0→1 (back easing), for icons & labels. */
export const pop = (frame: number, t: number, d = 0.45) =>
  interpolate(frame, [t * FPS, (t + d) * FPS], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.7)) });
