// All timings are in OUTPUT seconds unless noted. 30 fps vertical 1080x1920.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION_FRAMES = 238; // 7.93 s
export const CTA_FROM = 188;

export const f = (s: number) => Math.round(s * FPS);

// ---------- Panel (main video window) ----------
export const PANEL = { x: 40, y: 300, w: 1000, h: 1250, r: 44 };

// ---------- Voice edit (source frames @30fps) ----------
// Removed: 0.57s dead air at start, 0.40s pause after "malam", 0.13s pause after "vision".
export const VOICE_SEGMENTS = [
  { srcFrom: 17, srcTo: 63, at: 0 }, //  "Risau memandu waktu malam,"
  { srcFrom: 75, srcTo: 173, at: 46 }, // "dashcam 3 kamera ini ada 4K dan night vision."
  { srcFrom: 177, srcTo: 221, at: 144 }, // "Ada warranty 5 tahun." (price line removed)
  { srcFrom: 280, srcTo: 295, at: 188, volume: 0.6 }, // room tone tail into CTA
];

// ---------- Word timings (output seconds, from Whisper + manual nudge) ----------
export type Word = { t: string; s: number; e: number; key?: boolean };
export const CAPTION_CHUNKS: { words: Word[]; hide?: boolean }[] = [
  { words: [{ t: "RISAU", s: 0.0, e: 0.43 }, { t: "MEMANDU", s: 0.43, e: 0.83 }] },
  { words: [{ t: "WAKTU", s: 0.83, e: 1.03 }, { t: "MALAM?", s: 1.03, e: 1.53, key: true }] },
  { words: [{ t: "DASHCAM", s: 1.55, e: 2.03 }, { t: "3", s: 2.03, e: 2.27, key: true }, { t: "KAMERA", s: 2.27, e: 2.65, key: true }] },
  { words: [{ t: "INI", s: 2.65, e: 2.87 }, { t: "ADA", s: 2.87, e: 3.17 }, { t: "4K", s: 3.17, e: 3.71, key: true }] },
  { words: [{ t: "DAN", s: 3.71, e: 4.01 }, { t: "NIGHT", s: 4.01, e: 4.27, key: true }, { t: "VISION", s: 4.27, e: 4.8, key: true }] },
  { words: [{ t: "ADA", s: 4.82, e: 5.02 }, { t: "WARRANTY", s: 5.02, e: 5.42 }] },
  { words: [{ t: "5", s: 5.42, e: 5.9, key: true }, { t: "TAHUN", s: 5.9, e: 6.27, key: true }] },
];

// ---------- Shots ----------
export type Region = { x: number; y: number; w: number; h: number };
export type Shot =
  | { id: string; kind: "crop"; from: number; to: number; src: number; region: Region; zoom: [number, number] }
  | { id: string; kind: "tri"; from: number; to: number; src: number }
  | { id: string; kind: "night"; from: number; to: number; src: number; region: Region }
  | { id: string; kind: "cta"; from: number; to: number; src: number; region: Region };

const POV: Region = { x: 352, y: 0, w: 576, h: 720 };
const CAM: Region = { x: 312, y: 0, w: 576, h: 720 };

// frames: 0-46 | 46-84 | 84-114 | 114-144 | 144-166 | 166-188 | 188-238 (CTA)
export const SHOTS: Shot[] = [
  { id: "pov", kind: "crop", from: 0, to: 46, src: 2.45, region: POV, zoom: [1.12, 1.0] },
  { id: "tri", kind: "tri", from: 46, to: 84, src: 5.25 },
  { id: "hero4k", kind: "crop", from: 84, to: 114, src: 0.55, region: CAM, zoom: [1.0, 1.1] },
  { id: "night", kind: "night", from: 114, to: 144, src: 4.0, region: POV },
  { id: "press", kind: "crop", from: 144, to: 166, src: 7.45, region: CAM, zoom: [1.08, 1.0] },
  { id: "hero2", kind: "crop", from: 166, to: 188, src: 1.55, region: CAM, zoom: [1.0, 1.1] },
  { id: "cta", kind: "cta", from: 188, to: 238, src: 9.9, region: CAM },
];

// ---------- Tri-camera restack (source pixel regions) ----------
export const TRI = [
  { label: "KAMERA DEPAN", region: { x: 196, y: 0, w: 887, h: 355 } },
  { label: "KAMERA DALAM", region: { x: 0, y: 395, w: 636, h: 254 } }, // driver's face lives here — keep clear
  { label: "KAMERA BELAKANG", region: { x: 646, y: 410, w: 634, h: 254 } },
];

// ---------- Music ----------
export const MUSIC = { file: "music/m132.mp3", startAt: 14.33 }; // drop (15.88s) lands on the 3-cam reveal

// ---------- SFX (output seconds) ----------
export const SFX: { t: number; file: string; vol: number; trim?: number }[] = [
  { t: 0.0, file: "bass_hit", vol: 0.5 }, // opening thump under hook
  { t: 1.22, file: "sweep_small", vol: 0.45 }, // whoosh into 3-cam
  { t: 1.7, file: "pop_hard", vol: 0.4 },
  { t: 1.9, file: "pop_hard", vol: 0.4 },
  { t: 2.1, file: "pop_hard", vol: 0.45 },
  { t: 2.78, file: "pop_whoosh", vol: 0.5 },
  { t: 2.68, file: "impact_zoom", vol: 0.5 }, // lands on "4K"
  { t: 3.65, file: "glitch_scifi", vol: 0.22 }, // into night vision
  { t: 4.0, file: "tech_slide", vol: 0.9 }, // scan line
  { t: 4.31, file: "sweep_fast", vol: 0.45 },
  { t: 4.95, file: "click_ui", vol: 0.9 }, // finger press
  { t: 5.19, file: "confirm", vol: 0.35 }, // warranty badge
  { t: 5.5, file: "pop_whoosh", vol: 0.4 },
  { t: 6.05, file: "sweep_small", vol: 0.4 }, // whoosh into CTA
  { t: 6.05, file: "sparkle", vol: 0.6 }, // CTA
  { t: 6.6, file: "pop_msg", vol: 0.7 }, // button
];

// Speech windows (output s) used for music ducking
export const SPEECH = [
  [0.05, 1.52],
  [1.57, 4.76],
  [4.82, 6.26],
];
