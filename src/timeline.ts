// All timings are in OUTPUT seconds unless noted. 30 fps vertical 1080x1920.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION_FRAMES = 297; // 9.9 s

export const f = (s: number) => Math.round(s * FPS);

// ---------- Panel (main video window) ----------
export const PANEL = { x: 40, y: 300, w: 1000, h: 1250, r: 44 };

// ---------- Voice edit (source frames @30fps) ----------
// Removed: 0.57s dead air at start, 0.40s pause after "malam", 0.13s pause after "vision".
export const VOICE_SEGMENTS = [
  { srcFrom: 17, srcTo: 63, at: 0 }, //  "Risau memandu waktu malam,"
  { srcFrom: 75, srcTo: 173, at: 46 }, // "dashcam 3 kamera ini ada 4K dan night vision."
  { srcFrom: 177, srcTo: 280, at: 144 }, // "Ada warranty 5 tahun dan harga cuma 107 ringgit."
  { srcFrom: 280, srcTo: 295, at: 247, volume: 0.6 }, // room tone tail into CTA
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
  { words: [{ t: "5", s: 5.42, e: 5.78, key: true }, { t: "TAHUN", s: 5.78, e: 6.08, key: true }] },
  { words: [{ t: "DAN", s: 6.08, e: 6.5 }, { t: "HARGA", s: 6.5, e: 6.92 }, { t: "CUMA", s: 6.92, e: 7.12 }] },
  // price chunk is shown by the big price graphic instead of captions
  { words: [{ t: "107", s: 7.12, e: 7.82 }, { t: "RINGGIT", s: 7.82, e: 8.23 }], hide: true },
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

// frames: 0-46 | 46-84 | 84-114 | 114-144 | 144-170 | 170-194 | 194-247 | 247-297
export const SHOTS: Shot[] = [
  { id: "pov", kind: "crop", from: 0, to: 46, src: 2.45, region: POV, zoom: [1.12, 1.0] },
  { id: "tri", kind: "tri", from: 46, to: 84, src: 5.25 },
  { id: "hero4k", kind: "crop", from: 84, to: 114, src: 0.55, region: CAM, zoom: [1.0, 1.1] },
  { id: "night", kind: "night", from: 114, to: 144, src: 4.0, region: POV },
  { id: "press", kind: "crop", from: 144, to: 170, src: 7.45, region: CAM, zoom: [1.08, 1.0] },
  { id: "hero2", kind: "crop", from: 170, to: 194, src: 1.55, region: CAM, zoom: [1.0, 1.08] },
  { id: "price", kind: "crop", from: 194, to: 247, src: 8.2, region: CAM, zoom: [1.0, 1.12] },
  { id: "cta", kind: "cta", from: 247, to: 297, src: 9.9, region: CAM },
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
  { t: 5.6, file: "pop_whoosh", vol: 0.4 },
  { t: 6.42, file: "tech_slide", vol: 0.7 },
  { t: 5.61, file: "riser", vol: 0.3, trim: 1.0 }, // builds to price
  { t: 6.63, file: "impact_zoom", vol: 0.65 }, // price slam
  { t: 6.95, file: "coin_prize", vol: 0.45 },
  { t: 7.3, file: "coins", vol: 0.3 },
  { t: 8.02, file: "sparkle", vol: 0.6 }, // CTA
  { t: 8.6, file: "pop_msg", vol: 0.7 },
];

// Speech windows (output s) used for music ducking
export const SPEECH = [
  [0.05, 1.52],
  [1.57, 4.76],
  [4.82, 8.23],
];
