import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import {
  Bubble,
  Caption,
  Constellation,
  DrawPath,
  Flag,
  Hill,
  HERO,
  OTHER,
  PersonBack,
  Sprig,
  Stage,
  Sun,
  Tuft,
} from "./parts";
import { C, FONT, FPS, H, W, clamp, lerp, mixColor, pop, ramp, wt } from "./theme";

// =====================================================================================
// Scene 1 — The opening question (two people, same start line, different horizons)
// =====================================================================================
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const tMountain = wt("extraordinary");
  const tSmall = wt("while");
  const tNever = wt("never");

  const mountainUp = ramp(frame, tMountain - 0.2, 1.4, Easing.bezier(0.2, 0.7, 0.2, 1));
  const pullBack = ramp(frame, 0.2, 3.2, Easing.inOut(Easing.cubic));
  const zoom = lerp(1.32, 1.0, pullBack) + ramp(frame, tNever, 3, Easing.inOut(Easing.quad)) * 0.06;
  const fy = lerp(1560, 1250, pullBack);
  const trail = ramp(frame, tMountain + 0.3, 1.6);
  const small = ramp(frame, tSmall + 0.1, 0.8);
  const dimOther = ramp(frame, tNever, 0.8);
  const heroLookUp = ramp(frame, tMountain, 0.8);

  const roadL = "M150 1920 C 250 1640, 500 1450, 500 1230 C 500 1120, 540 1050, 530 985";
  const road = `${roadL} L 566 985 C 590 1050, 640 1120, 660 1230 C 680 1450, 900 1640, 1010 1920 Z`;
  const peakY = lerp(985, 470, mountainUp);

  return (
    <AbsoluteFill>
      <Stage zoom={zoom} fx={560} fy={fy} bg={C.skyLow}>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#skyWarm)" />
        <Sun x={250} y={430} r={115} fill={C.sunPale} />
        <Constellation
          seed="s1"
          reveal={ramp(frame, 0.4, 2.5)}
          pts={[[410, 640], [470, 560], [560, 600], [610, 520], [520, 700], [440, 500], [600, 680]]}
          links={[[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6]]}
        />
        {/* the distant mountain + orange sun the hero is looking at */}
        <g opacity={mountainUp}>
          <circle cx={720} cy={lerp(760, 560, mountainUp)} r={170} fill={C.sun} opacity={0.9} />
        </g>
        <path d={`M260 1120 L${720} ${peakY} L1200 1120 Z`} fill={C.teal600} opacity={Math.min(1, mountainUp * 4)} />
        <path
          d={`M${lerp(720, 640, mountainUp)} ${lerp(985, 610, mountainUp)} L720 ${peakY} L${lerp(720, 800, mountainUp)} ${lerp(985, 610, mountainUp)} L760 ${lerp(985, 640, mountainUp)} L720 ${lerp(985, 600, mountainUp)} L690 ${lerp(985, 650, mountainUp)} Z`}
          fill={C.cream}
          opacity={0.92}
        />
        <path d={`M720 ${peakY} L1200 1120 L880 1120 Z`} fill={C.teal700} opacity={0.5 * Math.min(1, mountainUp * 4)} />
        {/* layered hills */}
        <Hill base={1000} amp={34} seed={1.2} fill={C.mist} />
        <Hill base={1110} amp={60} seed={2.4} fill={C.sageLight} texture="hatch" />
        <Hill base={1260} amp={70} seed={0.4} fill={C.sage} texture="grid" />
        <Hill base={1430} amp={60} seed={3.3} fill={C.teal500} texture="grid" />
        {/* the road */}
        <path d={road} fill={C.amber} />
        <path d={road} fill="url(#gridAmber)" />
        {/* start line */}
        <g>
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x={250 + i * 66} y={1606} width={40} height={18} rx={4} fill={C.cream} opacity={0.95} />
          ))}
        </g>
        {/* small destination for the other person */}
        <g opacity={small * (1 - dimOther * 0.45)}>
          <DrawPath d="M340 1650 C 300 1600, 250 1520, 240 1420" p={small} stroke={C.cream} width={7} dash={14} />
          <ellipse cx={240} cy={1416} rx={58 * small} ry={18 * small} fill="none" stroke={C.cream} strokeWidth={4} strokeDasharray="10 9" />
          <g transform={`translate(240 1416) scale(${pop(frame, tSmall + 0.4)})`}>
            <Flag x={0} y={0} h={80} color={C.cream} />
          </g>
        </g>
        {/* big trail for the hero */}
        <g opacity={1 - dimOther * 0 /* stays */}>
          <DrawPath d={`M680 1540 C 700 1380, 600 1240, 660 1100 C 700 1000, 690 800, 720 ${peakY + 30}`} p={trail} stroke={C.orange} width={8} dash={16} />
        </g>
        <PersonBack x={410} y={1690} s={0.84} look={OTHER} headTurn={-0.4} lookUp={-0.5} opacity={1 - dimOther * 0.35} />
        <PersonBack x={680} y={1690} s={0.84} look={HERO} lookUp={heroLookUp} headTurn={0.2 * heroLookUp} />
        {/* foreground plants */}
        <Sprig x={70} y={1960} h={560} color={C.teal700} seed={0.3} leaves={9} />
        <Sprig x={1010} y={1960} h={430} color={C.teal700} flip seed={1.1} />
        <Sprig x={180} y={1960} h={260} color={C.teal600} seed={2.2} leaves={5} />
        <Tuft x={880} y={1830} s={1.4} color={C.teal800} />
        <Tuft x={300} y={1880} s={1.2} color={C.teal800} />
      </Stage>
      <Caption at={0.9} out={tSmall - 0.4} top={250} size={70}>
        Same starting line.
      </Caption>
      <Caption at={tNever} top={250} size={70}>
        Different horizons.
      </Caption>
    </AbsoluteFill>
  );
};

// =====================================================================================
// Scene 2 — The central idea (the book → beliefs → ambitions bubble)
// =====================================================================================
const BookCover: React.FC<{ x: number; y: number; s: number; rot: number; opacity: number }> = ({ x, y, s, rot, opacity }) => (
  <div
    style={{
      position: "absolute",
      left: x - 210,
      top: y - 290,
      width: 420,
      height: 580,
      transform: `scale(${s}) rotate(${rot}deg)`,
      opacity,
    }}
  >
    {/* pages */}
    <div style={{ position: "absolute", left: 14, top: 12, width: 420, height: 580, borderRadius: 10, background: C.cream, boxShadow: "0 30px 50px rgba(14,53,64,0.25)" }} />
    <div style={{ position: "absolute", left: 7, top: 6, width: 420, height: 580, borderRadius: 10, background: "#EFE2C6" }} />
    {/* cover */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 10,
        background: `linear-gradient(160deg, ${C.teal600}, ${C.teal800})`,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 26, background: "rgba(0,0,0,0.18)" }} />
      <svg width={420} height={580} style={{ position: "absolute", inset: 0 }}>
        <circle cx={300} cy={420} r={70} fill={C.sun} />
        <path d="M60 580 L230 360 L300 440 L360 380 L460 580 Z" fill={C.teal900} opacity={0.7} />
        <path d="M230 360 L262 402 L244 398 L230 416 L214 400 Z" fill={C.cream} opacity={0.9} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 52,
          right: 30,
          top: 64,
          fontFamily: FONT,
          fontWeight: 900,
          color: C.cream,
          fontSize: 52,
          lineHeight: 1.0,
          letterSpacing: -1,
        }}
      >
        THE MAGIC
        <br />
        OF THINKING
        <br />
        <span style={{ color: C.amberLight, fontSize: 92 }}>BIG</span>
      </div>
      <div style={{ position: "absolute", left: 54, top: 316, fontFamily: FONT, fontWeight: 700, color: C.cream, fontSize: 22, letterSpacing: 4, opacity: 0.85 }}>
        DAVID J. SCHWARTZ
      </div>
    </div>
  </div>
);

const Chip: React.FC<{ x: number; y: number; p: number; out: number; icon: React.ReactNode; label: string }> = ({ x, y, p, out, icon, label }) => {
  if (p <= 0 || out >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%,-50%) scale(${p * (1 - out * 0.3)}) translateY(${out * 60}px)`,
        opacity: 1 - out,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 30px 18px 22px",
        borderRadius: 999,
        background: C.cream,
        boxShadow: "0 10px 26px rgba(14,53,64,0.18)",
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 44,
        color: C.ink,
      }}
    >
      {icon}
      {label}
    </div>
  );
};

const BulbIcon = () => (
  <svg width={54} height={54} viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" fill={C.amber} />
    <rect x={8.5} y={18} width={7} height={2.2} rx={1} fill={C.teal700} />
    <rect x={9.5} y={21} width={5} height={1.8} rx={0.9} fill={C.teal700} />
  </svg>
);
const StarIcon = () => (
  <svg width={54} height={54} viewBox="0 0 24 24">
    <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" fill={C.orange} />
  </svg>
);

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const t0 = wt("In");
  const tSuccess = wt("success");
  const tIntel = wt("intelligence");
  const tTalent = wt("talent");
  const tAlso = wt("It's");
  const tBeliefs = wt("beliefs");
  const tAmb = wt("ambitions");

  const bookIn = interpolate(frame, [(t0 - 0.6) * FPS, (t0 + 0.2) * FPS], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const bookUp = ramp(frame, tSuccess - 0.1, 0.8);
  const bookOut = ramp(frame, tAlso - 0.3, 0.5);
  const chipsOut = ramp(frame, tAlso - 0.2, 0.5);
  const heroIn = ramp(frame, tAlso - 0.1, 0.9, Easing.out(Easing.cubic));
  const dots = ramp(frame, tAlso + 0.5, 0.6);
  const r1 = interpolate(frame, [(tAlso + 0.9) * FPS, (tBeliefs - 0.1) * FPS, tBeliefs * FPS + 12], [0, 150, 250], { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const grow = ramp(frame, tAmb - 0.3, 1.6, Easing.inOut(Easing.cubic));
  const r = r1 + grow * 1500;
  const bx = 540;
  const by = lerp(820, 900, grow);
  const camZoom = 1 + ramp(frame, t0, 14, Easing.linear) * 0.05;

  return (
    <AbsoluteFill>
      <Stage zoom={camZoom} fy={900} bg={C.paper}>
        <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={C.paper} />
        <circle cx={540} cy={820} r={360} fill={C.paperLight} />
        <Constellation
          seed="s2"
          reveal={ramp(frame, t0, 2)}
          pts={[[120, 260], [210, 330], [170, 450], [880, 1240], [960, 1150], [1010, 1290]]}
          links={[[0, 1], [1, 2], [3, 4], [4, 5]]}
          color={C.sage}
        />
        <Hill base={1640} amp={36} seed={0.9} fill={C.sageLight} texture="hatch" />
        <Hill base={1780} amp={40} seed={2.7} fill={C.sage} texture="grid" />
        <Sprig x={90} y={1940} h={420} color={C.teal600} seed={0.5} />
        <Sprig x={1000} y={1940} h={340} color={C.teal600} flip seed={1.7} />

        {/* thought chain + growing bubble */}
        <g opacity={heroIn}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={560 + i * 14} cy={1270 - i * 90} r={(14 + i * 9) * interpolate(dots, [i / 3, (i + 1) / 3], [0, 1], clamp)} fill={C.cream} />
          ))}
        </g>
        {r > 1 && (
          <g>
            <clipPath id="bubbleClip">
              <circle cx={bx} cy={by} r={r} />
            </clipPath>
            <circle cx={bx} cy={by} r={r + 12} fill={C.cream} />
            <g clipPath="url(#bubbleClip)">
              <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={mixColor(C.mist, C.skyTop, grow)} />
              {/* beliefs: a sprout + small hills */}
              <g opacity={1 - grow}>
                <ellipse cx={bx} cy={by + 120} rx={260} ry={70} fill={C.sage} />
                <path d={`M${bx} ${by + 70} Q ${bx - 4} ${by + 10} ${bx + 4} ${by - 40}`} stroke={C.teal700} strokeWidth={9} fill="none" strokeLinecap="round" />
                <ellipse cx={bx - 40} cy={by - 10} rx={42} ry={18} fill={C.teal600} transform={`rotate(-25 ${bx - 40} ${by - 10})`} />
                <ellipse cx={bx + 44} cy={by - 40} rx={46} ry={19} fill={C.teal500} transform={`rotate(20 ${bx + 44} ${by - 40})`} />
              </g>
              {/* ambitions: wide sky, sun, mountains, constellations */}
              <g opacity={grow}>
                <circle cx={540} cy={760} r={210} fill={C.sun} />
                <Constellation
                  seed="amb"
                  pts={[[150, 300], [260, 230], [380, 320], [700, 220], [820, 300], [930, 210], [860, 420]]}
                  links={[[0, 1], [1, 2], [3, 4], [4, 5], [4, 6]]}
                  color={C.teal600}
                />
                <path d="M-100 1300 L300 760 L520 1040 L700 620 L1180 1300 Z" fill={C.teal700} />
                <path d="M700 620 L760 730 L720 712 L690 760 L660 720 Z" fill={C.cream} />
                <path d="M300 760 L340 820 L300 812 L276 840 Z" fill={C.cream} />
                <Hill base={1250} amp={50} seed={1.7} fill={C.teal500} texture="grid" />
                <Hill base={1460} amp={50} seed={0.2} fill={C.teal600} texture="grid" />
              </g>
            </g>
          </g>
        )}
        <g transform={`translate(0 ${(1 - heroIn) * 1000})`}>
          <PersonBack x={540} y={2020} s={1.55} look={HERO} lookUp={grow} shadow={false} />
        </g>
      </Stage>

      <BookCover x={540} y={lerp(820, 470, bookUp)} s={lerp(lerp(0.7, 1, bookIn), 0.62, bookUp) * (1 - bookOut * 0.2)} rot={lerp(-8, -3, bookIn)} opacity={bookIn * (1 - bookOut)} />
      <Chip x={300} y={1010} p={pop(frame, tIntel - 0.1)} out={chipsOut} icon={<BulbIcon />} label="Intelligence" />
      <Chip x={790} y={1150} p={pop(frame, tTalent - 0.2)} out={chipsOut} icon={<StarIcon />} label="Talent" />
      <Caption at={tSuccess + 0.4} out={tAlso - 0.3} top={830} size={40} weight={700} color={C.teal700}>
        Success isn't shaped only by…
      </Caption>
      <Caption at={tBeliefs - 0.6} top={250} size={42} weight={700} color={C.teal700}>
        It's also the size of our
      </Caption>
      <BigWord at={tBeliefs - 0.1} out={tAmb - 0.2} word="BELIEFS" />
      <BigWord at={tAmb} word="AMBITIONS" color={C.teal900} />
    </AbsoluteFill>
  );
};

const BigWord: React.FC<{ at: number; out?: number; word: string; color?: string; shadow?: boolean }> = ({ at, out, word, color = C.ink, shadow }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at, 0.5);
  const o = out !== undefined ? ramp(frame, out, 0.3) : 0;
  if (p <= 0 || o >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: 312,
        width: W,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 118,
        letterSpacing: 2,
        color,
        transform: `scale(${p})`,
        opacity: 1 - o,
        textShadow: shadow ? "0 6px 26px rgba(14,53,64,0.45)" : undefined,
      }}
    >
      {word}
    </div>
  );
};

// =====================================================================================
// Scenes 3 + 4 — Small thinking builds walls; a better question breaks them
// =====================================================================================
const WALLS = {
  left: [[250, 1560], [345, 1440], [345, 870], [250, 790]],
  back: [[345, 1440], [735, 1440], [735, 870], [345, 870]],
  right: [[735, 1440], [830, 1560], [830, 790], [735, 870]],
} as const;

const DOORS: [number, number, number][] = [
  [140, 1000, 0.85],
  [540, 760, 0.7],
  [945, 980, 0.9],
];

const Door: React.FC<{ x: number; y: number; s: number; lit: number; open: number }> = ({ x, y, s, lit, open }) => {
  const col = mixColor(C.greyLight, C.amber, lit);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-80} r={150} fill="url(#warmGlow)" opacity={lit * 0.9} />
      <path d="M-50 0 L-50 -110 A50 50 0 0 1 50 -110 L50 0 Z" fill={col} />
      <path d={`M-50 0 L-50 -110 A50 50 0 0 1 ${lerp(50, -10, open)} ${lerp(-110, -150, open)} L${lerp(50, -10, open)} 0 Z`} fill={mixColor(C.grey, C.orange, lit)} opacity={0.55} />
      <ellipse cx={0} cy={4} rx={70} ry={10} fill={C.teal900} opacity={0.15} />
    </g>
  );
};

export const SceneWalls: React.FC = () => {
  const frame = useCurrentFrame();
  // scene 3 beats
  const tSmall = wt("When");
  const tFail = wt("What", 0);
  const tGood = wt("What", 1);
  const tQuestions = wt("Questions");
  const tOpp = wt("opportunities...");
  const tBefore = wt("before");
  // scene 4 beats
  const tBig = wt("Big", 1);
  const tCan = wt('"Can');
  const tWhat = wt('"What', 2);
  const tPossible = wt('possible?"');
  const tShatter = tPossible + 0.75;

  const warm = ramp(frame, tShatter, 1.2);
  const muted = ramp(frame, tSmall, 1.2) * (1 - warm);
  const sky = mixColor(mixColor(C.skyLow, "#E4E2D8", muted), C.skyTop, warm * 0.6);
  const hillA = mixColor(C.sageLight, "#B9C4BE", muted);
  const hillB = mixColor(C.sage, "#94A6A0", muted);
  const hillC = mixColor(C.teal500, "#6F8784", muted);
  const ground = mixColor(C.teal600, "#5D7472", muted);

  const vignette = lerp(1400, 560, ramp(frame, tSmall, 1.6)) + ramp(frame, tShatter, 1.0) * 1600;
  const wallsUp = ramp(frame, tQuestions - 0.1, 0.9, Easing.out(Easing.cubic));
  const crack = ramp(frame, tPossible - 0.2, 0.8);
  const shatter = ramp(frame, tShatter, 1.1, Easing.out(Easing.quad));
  const zoom = 1 + ramp(frame, tSmall, 8) * 0.08 + ramp(frame, tBig, 4) * 0.06 - ramp(frame, tShatter + 0.4, 2.2) * 0.2;
  const fy = lerp(1150, 1100, warm);

  const doorsIn = ramp(frame, tOpp - 0.2, 0.6);
  const paths = ramp(frame, tShatter + 0.8, 1.6);

  const wallLabel = (txt: string, x: number, y: number, at: number, rot = 0) => {
    const p = pop(frame, at);
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight={900}
        fontSize={44}
        letterSpacing={4}
        fill={C.teal900}
        opacity={0.75 * p * (1 - shatter)}
        transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y}) scale(${p}) translate(${-x} ${-y})`}
      >
        {txt}
      </text>
    );
  };

  const poly = (pts: readonly (readonly [number, number])[]) => pts.map((p) => p.join(" ")).join(" L");
  const wall = (pts: readonly (readonly [number, number])[], key: string) => {
    // rise from the floor
    const floorY = Math.max(...pts.map((p) => p[1]));
    const sc = wallsUp;
    return (
      <g key={key} transform={`translate(0 ${floorY}) scale(1 ${sc}) translate(0 ${-floorY})`} opacity={1 - shatter}>
        <path d={`M${poly(pts)} Z`} fill="url(#glass)" stroke="#F3FAF8" strokeWidth={5} strokeOpacity={0.8} />
        <path d={`M${poly(pts)} Z`} fill={C.teal700} opacity={0.08} />
      </g>
    );
  };

  // shards for the shatter
  const shards = Array.from({ length: 34 }).map((_, i) => {
    const cx = 260 + random(`sx${i}`) * 560;
    const cy = 800 + random(`sy${i}`) * 640;
    const ang = Math.atan2(cy - 1150, cx - 540) + (random(`sa${i}`) - 0.5) * 0.6;
    const dist = 300 + random(`sd${i}`) * 700;
    const sz = 30 + random(`sz${i}`) * 60;
    const x = cx + Math.cos(ang) * dist * shatter;
    const y = cy + Math.sin(ang) * dist * shatter + 380 * shatter * shatter;
    const rot = (random(`sr${i}`) - 0.5) * 540 * shatter;
    return (
      <path
        key={i}
        d={`M0 ${-sz} L${sz * 0.6} ${sz * 0.3} L${-sz * 0.5} ${sz * 0.5} Z`}
        transform={`translate(${x} ${y}) rotate(${rot})`}
        fill="#EAF4F1"
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.75 * (1 - shatter)}
      />
    );
  });

  const cracks = [
    "M300 900 L330 990 L300 1060 L340 1150 L310 1240",
    "M420 880 L470 990 L440 1080 L520 1180 L500 1300 L560 1420",
    "M700 900 L640 1010 L690 1120 L620 1220 L660 1330",
    "M800 820 L770 950 L810 1050 L780 1180",
  ];

  const pathEnds: [number, number][] = [
    [140, 1000],
    [330, 960],
    [540, 760],
    [760, 940],
    [945, 980],
  ];

  return (
    <AbsoluteFill>
      <Stage zoom={zoom} fx={540} fy={fy} bg={sky}>
        <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={sky} />
        <Sun x={800} y={420} r={lerp(110, 150, warm)} fill={mixColor(mixColor(C.sunPale, "#EEE9DC", muted), C.sun, warm * 0.85)} glow={1 - muted * 0.7} />
        <Constellation
          seed="s4"
          reveal={warm}
          pts={[[120, 260], [220, 200], [300, 300], [420, 240], [180, 380]]}
          links={[[0, 1], [1, 2], [2, 3], [0, 4]]}
        />
        <Hill base={900} amp={40} seed={2.2} fill={hillA} texture="hatch" />
        <Hill base={1060} amp={60} seed={0.7} fill={hillB} texture="grid" />
        <Hill base={1300} amp={50} seed={3.9} fill={hillC} texture="grid" />
        <rect x={-400} y={1420} width={W + 800} height={900} fill={ground} />
        <rect x={-400} y={1420} width={W + 800} height={900} fill="url(#grid)" />

        {/* opportunities in the distance */}
        {DOORS.map(([x, y, s], i) => {
          const dim = ramp(frame, tBefore + i * 0.4, 0.6);
          const relight = ramp(frame, tShatter + 0.3 + i * 0.2, 0.7);
          const lit = Math.max(doorsIn * (1 - dim), relight);
          const sc = s * (doorsIn > 0 ? 1 : 0) * (1 - dim * 0.25 + relight * 0.45) * pop(frame, tOpp - 0.2 + i * 0.15);
          return <Door key={i} x={x} y={y} s={sc} lit={lit} open={relight} />;
        })}

        {/* new paths opening after the walls break */}
        {pathEnds.map(([x, y], i) => {
          const d = `M540 1430 C ${540 + (x - 540) * 0.2} 1300, ${x + (540 - x) * 0.3} ${y + 220}, ${x} ${y + 10}`;
          const p = interpolate(paths, [i * 0.1, 0.6 + i * 0.1], [0, 1], clamp);
          return (
            <g key={i}>
              <DrawPath d={d} p={p} stroke={C.amber} width={lerp(46, 30, i % 2)} />
              <DrawPath d={d} p={p} stroke={C.amberLight} width={8} dash={18} />
            </g>
          );
        })}

        {/* walls */}
        {wall(WALLS.back, "b")}
        <PersonBack x={540} y={1440} s={0.95} look={HERO} lookUp={warm * 0.8 - muted * 0.6} headTurn={0} />
        {wall(WALLS.left, "l")}
        {wall(WALLS.right, "r")}
        {wallLabel("FEAR", 298, 1180, tQuestions + 0.25, -90)}
        {wallLabel("DOUBT", 540, 930, tQuestions + 0.55)}
        {wallLabel("EXCUSES", 782, 1180, tQuestions + 0.85, 90)}
        <g opacity={1 - shatter}>
          {cracks.map((d, i) => (
            <DrawPath key={i} d={d} p={interpolate(crack, [i * 0.15, 0.55 + i * 0.15], [0, 1], clamp)} stroke="#FFFFFF" width={4} />
          ))}
        </g>
        {shatter > 0 && shatter < 1 && shards}

        {/* closing-in vignette */}
        <mask id="vig">
          <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="white" />
          <circle cx={540} cy={1180} r={vignette} fill="black" />
        </mask>
        <rect x={-400} y={-400} width={W + 800} height={H + 800} fill={C.teal900} opacity={0.38 * (1 - warm)} mask="url(#vig)" />

        <Sprig x={60} y={1960} h={380} color={mixColor(C.teal700, "#4D6563", muted)} seed={0.8} />
        <Sprig x={1020} y={1960} h={480} color={mixColor(C.teal700, "#4D6563", muted)} flip seed={2.1} leaves={8} />
      </Stage>

      {/* scene 3 speech bubbles */}
      <Bubble x={300} y={1010} p={pop(frame, tFail - 0.05) * (1 - ramp(frame, tQuestions - 0.2, 0.4))} tail="left" bg="#EDEBE4" color="#3E5552">
        What if I fail?
      </Bubble>
      <Bubble x={790} y={860} p={pop(frame, tGood - 0.05) * (1 - ramp(frame, tQuestions - 0.2, 0.4))} tail="right" bg="#EDEBE4" color="#3E5552" maxW={520}>
        What if I'm not good enough?
      </Bubble>

      {/* scene 4 question card flip */}
      <QuestionCard tIn={tCan - 0.1} tFlip={tWhat - 0.15} tOut={tShatter + 1.6} />
    </AbsoluteFill>
  );
};

const QuestionCard: React.FC<{ tIn: number; tFlip: number; tOut: number }> = ({ tIn, tFlip, tOut }) => {
  const frame = useCurrentFrame();
  const pin = pop(frame, tIn);
  const flip = ramp(frame, tFlip, 0.5, Easing.inOut(Easing.cubic));
  const out = ramp(frame, tOut, 0.5);
  if (pin <= 0 || out >= 1) return null;
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const front = flip < 0.5;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: W,
        top: 380,
        display: "flex",
        justifyContent: "center",
        opacity: 1 - out,
        transform: `translateY(${-out * 40}px)`,
      }}
    >
      <div
        style={{
          transform: `scale(${pin}) scaleX(${Math.max(0.02, sx)})`,
          background: front ? "#EDEBE4" : C.amber,
          color: front ? "#3E5552" : C.ink,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: front ? 64 : 56,
          lineHeight: 1.15,
          padding: "30px 44px",
          borderRadius: 32,
          maxWidth: 860,
          textAlign: "center",
          boxShadow: "0 16px 40px rgba(14,53,64,0.22)",
        }}
      >
        {front ? (
          <>
            <span style={{ textDecoration: frame >= wt("they") * FPS ? "line-through" : "none", textDecorationThickness: 6, textDecorationColor: C.orange }}>Can I do this?</span>
          </>
        ) : (
          <>What would I need to learn to make this possible?</>
        )}
      </div>
    </div>
  );
};
