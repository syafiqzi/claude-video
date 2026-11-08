import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS, SCENE, W, clamp, wt } from "./theme";
import { WORDS } from "./vo";

// Word-synced subtitles. They are hidden wherever the same words are already on screen
// (speech bubbles, question cards, headline captions) so the viewer never reads things twice.
type Chunk = { words: typeof WORDS; s: number; e: number };

const MAX_CHARS = 30;
const chunks: Chunk[] = [];
{
  // 1) clauses: break at punctuation or a pause
  const clauses: (typeof WORDS)[] = [];
  let cur: typeof WORDS = [];
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    if (cur.length && prev && w.s - prev.e > 0.45) {
      clauses.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.,?!:;]["”]?$|\.\.\.$/.test(w.w)) {
      clauses.push(cur);
      cur = [];
    }
  });
  if (cur.length) clauses.push(cur);
  // merge very short clauses (≤ 2 words) into a neighbour when it still fits
  const merged: (typeof WORDS)[] = [];
  clauses.forEach((c) => {
    const last = merged[merged.length - 1];
    const text = (ws: typeof WORDS) => ws.map((x) => x.w).join(" ");
    if (last && (c.length <= 2 || last.length <= 2) && text([...last, ...c]).length <= MAX_CHARS + 4 && c[0].s - last[last.length - 1].e < 0.45)
      merged[merged.length - 1] = [...last, ...c];
    else merged.push(c);
  });
  // 2) split long clauses into balanced lines
  merged.forEach((c) => {
    const total = c.map((x) => x.w).join(" ").length;
    const n = Math.ceil(total / MAX_CHARS);
    const target = total / n;
    let acc: typeof WORDS = [];
    let len = 0;
    c.forEach((w, k) => {
      acc.push(w);
      len += w.w.length + 1;
      const remaining = c.length - k - 1;
      if (len >= target && remaining >= 2 && chunks.length < 999) {
        chunks.push({ words: acc, s: acc[0].s, e: w.e });
        acc = [];
        len = 0;
      }
    });
    if (acc.length) chunks.push({ words: acc, s: acc[0].s, e: acc[acc.length - 1].e });
  });
}
// show each chunk until shortly after it ends (or until the next one starts)
export const shown = chunks.map((c, i) => ({ ...c, until: Math.min(c.e + 0.35, chunks[i + 1]?.s ?? Infinity) }));

/** Windows where the narration is already printed on screen. */
const HIDE: [number, number][] = [
  [wt("success") - 0.05, wt("talent.", 0, "e") + 0.1], // "Success isn't shaped only by…" + chips
  [wt("It's") - 0.05, wt("ambitions.", 0, "e") + 0.1], // "It's also the size of our BELIEFS / AMBITIONS"
  [wt("What", 0) - 0.05, wt("enough?", 0, "e") + 0.1], // bubbles
  [wt("Instead") - 0.05, wt('possible?"', 0, "e") + 0.1], // question card
  [wt('"How', 0) - 0.05, wt('project?"', 0, "e") + 0.1], // manager bubble
  [wt('"How', 1) - 0.05, wt('works?"', 0, "e") + 0.1], // leader caption
  [wt("So", 0) - 0.05, wt("it?", 0, "e") + 0.1], // "How to practise big thinking"
  [wt("So", 1) - 0.05, wt("execution.", 0, "e") + 0.5], // final headline captions
];

// Vertical position per scene (keeps clear of each scene's own text and key art).
const sceneY = (t: number) => {
  const idx = SCENE.filter((s) => t >= s).length - 1;
  return [1150, 1480, 1580, 1580, 1600, 520, 1580][idx] ?? 1580;
};

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const c = shown.find((x) => t >= x.s - 0.08 && t < x.until);
  if (!c) return null;
  const mid = (c.s + c.e) / 2;
  if (HIDE.some(([a, b]) => mid >= a && mid <= b)) return null;
  const pin = interpolate(frame, [(c.s - 0.08) * FPS, (c.s + 0.04) * FPS], [0, 1], clamp);
  const pout = interpolate(frame, [(c.until - 0.1) * FPS, c.until * FPS], [0, 1], clamp);
  const o = pin * (1 - pout);
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: sceneY(c.s), display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          transform: `translateY(${(1 - pin) * 10}px)`,
          background: "rgba(14,53,64,0.78)",
          borderRadius: 22,
          padding: "14px 30px 16px",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 52,
          lineHeight: 1.1,
          color: C.cream,
          textAlign: "center",
          maxWidth: 1000,
        }}
      >
        {c.words.map((w, i) => {
          const active = t >= w.s - 0.03;
          return (
            <span key={i} style={{ color: active && t < w.e + 0.15 ? C.amberLight : C.cream, opacity: active ? 1 : 0.55 }}>
              {w.w.replace(/^"|"$|",$/g, (m) => (m === '",' ? "," : "")).replace(/\.\.\.$/, "…")}
              {i < c.words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
