import React from "react";
import { AbsoluteFill, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { C, FONT, FPS, H, W, clamp, ramp } from "./theme";

// ---------------------------------------------------------------- canvas
/** Full-frame SVG stage with a camera (zoom around a focus point + pan). */
export const Stage: React.FC<{
  children: React.ReactNode;
  zoom?: number;
  fx?: number; // focus point that stays fixed while zooming
  fy?: number;
  panX?: number;
  panY?: number;
  bg?: string;
}> = ({ children, zoom = 1, fx = W / 2, fy = H / 2, panX = 0, panY = 0, bg = C.paper }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, background: bg }}>
    <Defs />
    <g transform={`translate(${panX} ${panY}) translate(${fx} ${fy}) scale(${zoom}) translate(${-fx} ${-fy})`}>{children}</g>
  </svg>
);

/** Shared SVG patterns/gradients. */
export const Defs: React.FC = () => (
  <defs>
    <pattern id="hatch" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
      <line x1="0" y1="0" x2="0" y2="26" stroke={C.cream} strokeWidth="1.4" opacity="0.32" />
    </pattern>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-18) skewX(20)">
      <path d="M0 0H34M0 0V34" stroke={C.cream} strokeWidth="1.2" opacity="0.28" fill="none" />
    </pattern>
    <pattern id="gridAmber" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(-12) skewX(18)">
      <path d="M0 0H30M0 0V30" stroke="#FFF1D6" strokeWidth="1.3" opacity="0.45" fill="none" />
    </pattern>
    <radialGradient id="sunGlow">
      <stop offset="0" stopColor="#FFF4DC" stopOpacity="0.9" />
      <stop offset="1" stopColor="#FFF4DC" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="warmGlow">
      <stop offset="0" stopColor={C.amberLight} stopOpacity="0.95" />
      <stop offset="1" stopColor={C.amberLight} stopOpacity="0" />
    </radialGradient>
    <linearGradient id="skyWarm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.skyTop} />
      <stop offset="1" stopColor={C.skyLow} />
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#EAF4F1" stopOpacity="0.55" />
      <stop offset="0.5" stopColor="#D5E6E2" stopOpacity="0.28" />
      <stop offset="1" stopColor="#EAF4F1" stopOpacity="0.5" />
    </linearGradient>
  </defs>
);

/** Animated paper grain over everything (keeps the flat shapes feeling printed). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => {
  const frame = useCurrentFrame();
  const k = Math.floor(frame / 2);
  const x = Math.floor(random(`gx${k}`) * 512);
  const y = Math.floor(random(`gy${k}`) * 512);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("tb/grain.png")})`,
        backgroundPosition: `${x}px ${y}px`,
        mixBlendMode: "overlay",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

// ---------------------------------------------------------------- landscape
/** Smooth hill silhouette: sum of sines along the width, closed to the bottom. */
export const hillPath = (base: number, amp: number, seed: number, x0 = -200, x1 = W + 200, bottom = H + 400) => {
  const pts: string[] = [];
  const steps = 48;
  for (let i = 0; i <= steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const u = x / W;
    const y =
      base -
      amp * (0.55 * Math.sin(u * 4.1 + seed) + 0.3 * Math.sin(u * 7.3 + seed * 2.1) + 0.15 * Math.sin(u * 13 + seed * 0.7));
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${x0} ${bottom} L${pts.join(" L")} L${x1} ${bottom} Z`;
};

export const Hill: React.FC<{ base: number; amp: number; seed: number; fill: string; texture?: "hatch" | "grid"; opacity?: number }> = ({
  base,
  amp,
  seed,
  fill,
  texture,
  opacity = 1,
}) => {
  const d = hillPath(base, amp, seed);
  return (
    <g opacity={opacity}>
      <path d={d} fill={fill} />
      {texture && <path d={d} fill={`url(#${texture})`} />}
    </g>
  );
};

export const Sun: React.FC<{ x: number; y: number; r: number; fill?: string; glow?: number }> = ({ x, y, r, fill = C.sunPale, glow = 1 }) => (
  <g>
    <circle cx={x} cy={y} r={r * 2.1} fill="url(#sunGlow)" opacity={0.6 * glow} />
    <circle cx={x} cy={y} r={r} fill={fill} />
  </g>
);

/** Twinkling constellation (ref 1 sky). */
export const Constellation: React.FC<{ pts: [number, number][]; links: [number, number][]; color?: string; reveal?: number; seed?: string }> = ({
  pts,
  links,
  color = C.teal500,
  reveal = 1,
  seed = "c",
}) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={reveal}>
      {links.map(([a, b], i) => {
        const p = interpolate(reveal, [i / links.length, Math.min(1, (i + 1.5) / links.length)], [0, 1], clamp);
        const [x1, y1] = pts[a];
        const [x2, y2] = pts[b];
        return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={2} opacity={0.65} />;
      })}
      {pts.map(([x, y], i) => {
        const tw = 0.6 + 0.4 * Math.sin(frame / 9 + random(`${seed}${i}`) * 6.28);
        return <circle key={i} cx={x} cy={y} r={5 + random(`${seed}r${i}`) * 3} fill={color} opacity={tw} />;
      })}
    </g>
  );
};

/** Leafy sprig that sways (ref 1 foreground plants). */
export const Sprig: React.FC<{ x: number; y: number; h: number; color?: string; flip?: boolean; seed?: number; leaves?: number }> = ({
  x,
  y,
  h,
  color = C.teal600,
  flip = false,
  seed = 0,
  leaves = 7,
}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 28 + seed) * 3;
  const s = flip ? -1 : 1;
  const items = [];
  for (let i = 0; i < leaves; i++) {
    const t = (i + 1) / (leaves + 1);
    const ly = -h * t;
    const side = i % 2 === 0 ? 1 : -1;
    const len = h * 0.2 * (1 - t * 0.45);
    items.push(
      <ellipse
        key={i}
        cx={side * len * 0.55 + sway * t}
        cy={ly}
        rx={len * 0.55}
        ry={len * 0.2}
        fill={color}
        transform={`rotate(${side * -35 + sway} ${side * len * 0.55 + sway * t} ${ly})`}
      />,
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s} 1)`}>
      <path d={`M0 0 Q ${h * 0.06 + sway} ${-h * 0.5} ${sway * 1.4} ${-h}`} stroke={color} strokeWidth={h * 0.018 + 1.5} fill="none" strokeLinecap="round" />
      {items}
      <ellipse cx={sway * 1.4} cy={-h - h * 0.07} rx={h * 0.05} ry={h * 0.1} fill={color} />
    </g>
  );
};

/** Little grass tuft. */
export const Tuft: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = C.teal600 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round">
    <path d="M0 0 Q-6 -18 -16 -26" />
    <path d="M4 0 Q4 -22 2 -34" />
    <path d="M8 0 Q14 -16 24 -22" />
  </g>
);

// ---------------------------------------------------------------- people
export type Look = {
  sweater: string;
  pants: string;
  hair: string;
  skin?: string;
  backpack?: string | null;
  hairStyle?: "bob" | "short";
};

export const HERO: Look = { sweater: C.teal700, pants: C.teal900, hair: C.navy, backpack: C.orange, hairStyle: "bob" };
export const OTHER: Look = { sweater: "#6E8C99", pants: "#334A57", hair: "#2A3640", backpack: null, hairStyle: "short" };

/**
 * Person seen from behind (refs 1/4/5). Feet at (x, y), ~400 units tall at scale 1.
 * `walk` is a phase in radians (0 = standing); `look` turns the head slightly (-1..1); `lookUp` tilts head up (0..1).
 */
export const PersonBack: React.FC<{
  x: number;
  y: number;
  s?: number;
  look?: Look;
  walk?: number;
  walking?: number; // 0..1 amount of walk motion
  headTurn?: number;
  lookUp?: number;
  shadow?: boolean;
  opacity?: number;
}> = ({ x, y, s = 1, look = HERO, walk = 0, walking = 0, headTurn = 0, lookUp = 0, shadow = true, opacity = 1 }) => {
  const lift = Math.sin(walk) * 14 * walking;
  const bob = Math.abs(Math.sin(walk)) * 5 * walking;
  const arm = Math.sin(walk) * 6 * walking;
  const lL = Math.max(0, lift);
  const lR = Math.max(0, -lift);
  const hx = headTurn * 8;
  const hy = -lookUp * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      {shadow && <ellipse cx={30} cy={4} rx={95} ry={16} fill={C.teal900} opacity={0.22} />}
      <g transform={`translate(0 ${-bob})`}>
        {/* legs */}
        <path d={`M-40 -182 L-36 ${-12 - lL} Q-36 ${-2 - lL} -26 ${-2 - lL} L-6 ${-2 - lL} L-4 -182 Z`} fill={look.pants} />
        <path d={`M4 -182 L6 ${-2 - lR} L26 ${-2 - lR} Q36 ${-2 - lR} 36 ${-12 - lR} L40 -182 Z`} fill={look.pants} />
        <ellipse cx={-22} cy={-2 - lL} rx={22} ry={10} fill={C.navy} />
        <ellipse cx={22} cy={-2 - lR} rx={22} ry={10} fill={C.navy} />
        {/* arms */}
        <path d={`M-58 -318 Q-74 -250 -70 ${-178 + arm} Q-62 ${-166 + arm} -52 ${-178 + arm} L-44 -300 Z`} fill={look.sweater} />
        <path d={`M58 -318 Q74 -250 70 ${-178 - arm} Q62 ${-166 - arm} 52 ${-178 - arm} L44 -300 Z`} fill={look.sweater} />
        <circle cx={-62} cy={-170 + arm} r={11} fill={look.pants} opacity={0.9} />
        <circle cx={62} cy={-170 - arm} r={11} fill={look.pants} opacity={0.9} />
        {/* torso */}
        <path d="M-60 -322 Q-64 -260 -50 -176 L50 -176 Q64 -260 60 -322 Q0 -342 -60 -322 Z" fill={look.sweater} />
        <path d="M-50 -190 L50 -190 L50 -176 L-50 -176 Z" fill={look.pants} opacity={0.35} />
        {/* backpack */}
        {look.backpack && (
          <g>
            <rect x={-46} y={-318} width={92} height={118} rx={22} fill={look.backpack} />
            <rect x={-32} y={-262} width={64} height={50} rx={12} fill="#C9542A" />
            <path d="M-36 -318 Q-40 -290 -30 -260 M36 -318 Q40 -290 30 -260" stroke="#B44A23" strokeWidth={6} fill="none" />
            <rect x={-46} y={-290} width={92} height={7} fill="#B44A23" opacity={0.6} />
          </g>
        )}
        {/* neck + head */}
        <rect x={-13} y={-350} width={26} height={30} fill={C.navy} opacity={0.85} />
        <g transform={`translate(${hx} ${hy})`}>
          {look.hairStyle === "bob" ? (
            <path d="M-40 -380 Q-44 -430 0 -436 Q44 -430 40 -380 Q44 -344 30 -330 Q22 -338 18 -344 L-18 -344 Q-24 -336 -36 -334 Q-46 -350 -40 -380 Z" fill={look.hair} />
          ) : (
            <path d="M-36 -384 Q-38 -428 0 -432 Q38 -428 36 -384 Q36 -356 24 -348 L-24 -348 Q-36 -356 -36 -384 Z" fill={look.hair} />
          )}
          {/* ear hints */}
          <ellipse cx={-38} cy={-376} rx={6} ry={10} fill={look.hair} opacity={0.7} />
          <ellipse cx={38} cy={-376} rx={6} ry={10} fill={look.hair} opacity={0.7} />
        </g>
      </g>
    </g>
  );
};

/** Same character in side profile, facing right — used on the staircase. Feet at (x,y). */
export const PersonSide: React.FC<{ x: number; y: number; s?: number; look?: Look; stride?: number; lean?: number }> = ({
  x,
  y,
  s = 1,
  look = HERO,
  stride = 0, // -1..1 leg spread
  lean = 0,
}) => {
  const legA = 22 * stride;
  const legB = -22 * stride;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean} 0 -200)`}>
      <ellipse cx={0} cy={4} rx={60} ry={10} fill={C.teal900} opacity={0.18} />
      {/* back leg */}
      <g transform={`rotate(${legB} 0 -180)`}>
        <rect x={-16} y={-182} width={32} height={180} rx={14} fill={look.pants} opacity={0.82} />
        <ellipse cx={8} cy={-4} rx={26} ry={10} fill={C.navy} opacity={0.85} />
      </g>
      {/* back arm */}
      <g transform={`rotate(${-legB * 0.8} 0 -310)`}>
        <rect x={-12} y={-318} width={26} height={140} rx={13} fill={look.sweater} opacity={0.8} />
      </g>
      {/* torso */}
      <path d="M-34 -330 Q-44 -250 -32 -176 L36 -176 Q44 -260 32 -330 Q0 -344 -34 -330 Z" fill={look.sweater} />
      {look.backpack && <rect x={-74} y={-318} width={48} height={114} rx={16} fill={look.backpack} />}
      {look.backpack && <rect x={-70} y={-262} width={24} height={44} rx={8} fill="#C9542A" />}
      {/* front leg */}
      <g transform={`rotate(${legA} 0 -180)`}>
        <rect x={-16} y={-182} width={32} height={180} rx={14} fill={look.pants} />
        <ellipse cx={10} cy={-4} rx={27} ry={10} fill={C.navy} />
      </g>
      {/* front arm */}
      <g transform={`rotate(${-legA * 0.8} 0 -310)`}>
        <rect x={-12} y={-318} width={26} height={140} rx={13} fill={look.sweater} />
        <circle cx={1} cy={-176} r={11} fill={look.pants} />
      </g>
      {/* head */}
      <rect x={-8} y={-356} width={20} height={28} fill={C.navy} opacity={0.9} />
      <circle cx={6} cy={-386} r={36} fill={look.hair} />
      {look.hairStyle === "bob" && <path d="M-30 -400 Q-40 -350 -20 -334 L4 -340 Q-6 -370 6 -404 Z" fill={look.hair} />}
      <path d="M38 -392 Q46 -384 40 -376" stroke={look.hair} strokeWidth={6} fill="none" />
    </g>
  );
};

/** Tiny generic figure (ref 2 people on cubes). */
export const Mini: React.FC<{ x: number; y: number; s?: number; body?: string; dark?: string }> = ({ x, y, s = 1, body = C.orange, dark = C.navy }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={4} cy={2} rx={18} ry={5} fill={C.navy} opacity={0.2} />
    <rect x={-9} y={-44} width={8} height={44} rx={3} fill={dark} />
    <rect x={2} y={-44} width={8} height={44} rx={3} fill={dark} />
    <path d="M-13 -80 Q-15 -60 -11 -42 L12 -42 Q15 -60 13 -80 Q0 -86 -13 -80 Z" fill={body} />
    <circle cx={0} cy={-93} r={11} fill={dark} />
  </g>
);

// ---------------------------------------------------------------- objects
export const Flag: React.FC<{ x: number; y: number; h: number; color?: string; s?: number }> = ({ x, y, h, color = C.orange, s = 1 }) => {
  const frame = useCurrentFrame();
  const w = Math.sin(frame / 6) * 8;
  const fw = h * 0.55;
  const fh = h * 0.32;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-3} y={-h} width={6} height={h} fill={C.navy} />
      <path
        d={`M3 ${-h} C ${fw * 0.35} ${-h - 14 + w} ${fw * 0.65} ${-h + 12 - w} ${fw} ${-h + 2 + w * 0.6} L ${fw * 0.78} ${-h + fh * 0.5} L ${fw} ${-h + fh - 2 - w * 0.4} C ${fw * 0.65} ${-h + fh + 10 - w} ${fw * 0.35} ${-h + fh - 16 + w} 3 ${-h + fh} Z`}
        fill={color}
      />
    </g>
  );
};

/** Isometric cube (ref 2). (x, y) = centre of the top face; `a` = half width. */
export const IsoCube: React.FC<{
  x: number;
  y: number;
  a: number;
  h?: number;
  top?: string;
  left?: string;
  right?: string;
  opacity?: number;
}> = ({ x, y, a, h = a * 1.15, top = C.cream, left = C.orange, right = C.orangeLight, opacity = 1 }) => {
  const b = a * 0.577;
  return (
    <g opacity={opacity}>
      <path d={`M${x - a} ${y} L${x} ${y + b} L${x} ${y + b + h} L${x - a} ${y + h} Z`} fill={left} />
      <path d={`M${x} ${y + b} L${x + a} ${y} L${x + a} ${y + h} L${x} ${y + b + h} Z`} fill={right} />
      <path d={`M${x} ${y - b} L${x + a} ${y} L${x} ${y + b} L${x - a} ${y} Z`} fill={top} />
    </g>
  );
};

/** Draws an SVG path progressively (0..1) using pathLength normalisation. */
export const DrawPath: React.FC<{
  d: string;
  p: number;
  stroke: string;
  width: number;
  dash?: number;
  opacity?: number;
  linecap?: "round" | "butt";
}> = ({ d, p, stroke, width, dash, opacity = 1, linecap = "round" }) =>
  p <= 0.001 ? null : dash ? (
    <g opacity={opacity}>
      <mask id={`m${d.length}${Math.round(width)}`}>
        <path d={d} pathLength={1} stroke="white" strokeWidth={width + 4} fill="none" strokeDasharray={`${p} 1`} />
      </mask>
      <path d={d} stroke={stroke} strokeWidth={width} fill="none" strokeLinecap={linecap} strokeDasharray={`${dash} ${dash * 1.2}`} mask={`url(#m${d.length}${Math.round(width)})`} />
    </g>
  ) : (
    <path d={d} pathLength={1} stroke={stroke} strokeWidth={width} fill="none" strokeLinecap={linecap} strokeDasharray={`${p} 1`} opacity={opacity} />
  );

// ---------------------------------------------------------------- text (HTML overlay)
/** Selective on-screen text: slides up + fades in at `at` (s), out at `out` (s). */
export const Caption: React.FC<{
  at: number;
  out?: number;
  top: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  align?: "center" | "left";
  card?: string | null;
  width?: number;
}> = ({ at, out, top, children, size = 64, color = C.ink, weight = 800, align = "center", card = null, width = 900 }) => {
  const frame = useCurrentFrame();
  const pin = ramp(frame, at, 0.5);
  const pout = out !== undefined ? ramp(frame, out, 0.35) : 0;
  const o = pin * (1 - pout);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: (W - width) / 2,
        width,
        top,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(${(1 - pin) * 30 - pout * 14}px)`,
        opacity: o,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.12,
          color,
          textAlign: align,
          letterSpacing: -0.5,
          padding: card ? "22px 34px" : 0,
          background: card ?? undefined,
          borderRadius: card ? 28 : 0,
          boxShadow: card ? "0 10px 30px rgba(14,53,64,0.18)" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Speech / thought bubble in HTML, anchored by its tail tip (x, y). */
export const Bubble: React.FC<{
  x: number;
  y: number;
  p: number; // 0..1 pop
  children: React.ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  tail?: "left" | "right" | "center";
  maxW?: number;
}> = ({ x, y, p, children, bg = C.cream, color = C.ink, size = 46, tail = "center", maxW = 620 }) => {
  if (p <= 0.001) return null;
  const tx = tail === "left" ? "18%" : tail === "right" ? "82%" : "50%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-${tx}, -100%) translateY(-26px) scale(${p})`,
        transformOrigin: `${tx} 100%`,
        opacity: Math.min(1, p * 1.5),
      }}
    >
      <div
        style={{
          position: "relative",
          background: bg,
          color,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.15,
          padding: "22px 32px",
          borderRadius: 34,
          maxWidth: maxW,
          width: "max-content",
          textAlign: "center",
          boxShadow: "0 12px 30px rgba(14,53,64,0.2)",
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            left: tx,
            bottom: -20,
            width: 0,
            height: 0,
            transform: "translateX(-50%)",
            borderLeft: "18px solid transparent",
            borderRight: "18px solid transparent",
            borderTop: `24px solid ${bg}`,
          }}
        />
      </div>
    </div>
  );
};

export const frameToSec = (f: number) => f / FPS;
export { H, W };
