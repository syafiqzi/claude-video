import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame } from "remotion";
import { Bubble, Caption, Constellation, DrawPath, Flag, HERO, Hill, IsoCube, Mini, PersonBack, PersonSide, Sprig, Stage, Sun } from "./parts";
import { C, FONT, FPS, W, clamp, lerp, mixColor, pop, ramp, wt } from "./theme";

// =====================================================================================
// Scene 5 — Manager vs leader (one project cube → a connected organisation)
// =====================================================================================
const GRID: { i: number; j: number }[] = [];
for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) GRID.push({ i, j });

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const tManager = wt("manager");
  const tFinish = wt("finish");
  const tLeader = wt("leader");
  const tImprove = wt("improve");
  const tOrg = wt("organization");

  const A = 150;
  const cx = 540;
  const cy = 1010;
  const pos = (i: number, j: number) => ({ x: cx + (i - j) * A * 1.45, y: cy + (i + j) * A * 0.84 });

  const zoomOut = ramp(frame, tLeader - 0.2, 1.6, Easing.inOut(Easing.cubic));
  const zoom = lerp(1.25, 0.7, zoomOut) * (1 + ramp(frame, tOrg, 3, Easing.linear) * 0.04);
  const progress = ramp(frame, tFinish - 0.1, 1.0, Easing.inOut(Easing.quad));
  const net = ramp(frame, tImprove - 0.2, 1.2);
  const light = ramp(frame, tOrg - 0.3, 1.2);
  const web = ramp(frame, tImprove, 2);

  const neighbours: [number, number][] = [];
  GRID.forEach((g, a) =>
    GRID.forEach((h, b) => {
      if (b > a && Math.abs(g.i - h.i) + Math.abs(g.j - h.j) === 1) neighbours.push([a, b]);
    }),
  );
  const centre = GRID.findIndex((g) => g.i === 0 && g.j === 0);

  return (
    <AbsoluteFill>
      <Stage zoom={zoom} fx={cx} fy={cy + 40} bg={C.paperLight}>
        <rect x={-1200} y={-1200} width={W + 2400} height={4000} fill={C.paperLight} />
        {/* faint web of lines in the background (ref 2) */}
        <g opacity={0.25 + web * 0.5}>
          {Array.from({ length: 26 }).map((_, k) => {
            const x1 = -900 + random(`w1${k}`) * 2900;
            const y1 = -300 + random(`w2${k}`) * 2600;
            const x2 = x1 + (random(`w3${k}`) - 0.5) * 1800;
            const y2 = y1 + (random(`w4${k}`) - 0.5) * 1400;
            return <path key={k} d={`M${x1} ${y1} Q ${(x1 + x2) / 2 + 200} ${(y1 + y2) / 2 - 160} ${x2} ${y2}`} stroke={C.amber} strokeWidth={2} fill="none" opacity={0.6} />;
          })}
        </g>
        <path d="M-1200 1900 C -300 1720, 400 2020, 2300 1780 L2300 3400 L-1200 3400 Z" fill={C.teal800} />
        <path d="M-1200 1900 C -300 1720, 400 2020, 2300 1780 L2300 3400 L-1200 3400 Z" fill="url(#grid)" />

        {/* network links */}
        {neighbours.map(([a, b], k) => {
          const pa = pos(GRID[a].i, GRID[a].j);
          const pb = pos(GRID[b].i, GRID[b].j);
          const isCentre = a === centre || b === centre;
          const p = interpolate(net, [isCentre ? 0 : 0.35, isCentre ? 0.6 : 1], [0, 1], clamp);
          const [from, to] = b === centre ? [pb, pa] : [pa, pb];
          const d = `M${from.x} ${from.y + 30} L${to.x} ${to.y + 30}`;
          const pulseT = ((frame / FPS) * 0.7 + random(`pl${k}`)) % 1;
          return (
            <g key={k}>
              <DrawPath d={d} p={p} stroke={C.navy} width={7} />
              {p >= 1 && <circle cx={lerp(from.x, to.x, pulseT)} cy={lerp(from.y, to.y, pulseT) + 30} r={13} fill={C.amberLight} />}
            </g>
          );
        })}

        {/* cubes, back to front */}
        {[...GRID]
          .map((g, k) => ({ ...g, k }))
          .sort((a, b) => a.i + a.j - (b.i + b.j))
          .map(({ i, j, k }) => {
            const { x, y } = pos(i, j);
            const isC = k === centre;
            const appear = isC ? 1 : pop(frame, tLeader + 0.1 + random(`ap${k}`) * 0.7, 0.55);
            const lit = isC ? 1 : interpolate(light, [random(`lt${k}`) * 0.5, random(`lt${k}`) * 0.5 + 0.4], [0, 1], clamp);
            const h = A * (0.9 + random(`h${k}`) * 0.5);
            const rise = (1 - appear) * 260;
            return (
              <g key={k} opacity={Math.min(1, appear * 1.4)} transform={`translate(0 ${rise})`}>
                <IsoCube
                  x={x}
                  y={y}
                  a={A}
                  h={h}
                  top={C.cream}
                  left={mixColor("#E7DDCB", C.orange, lit)}
                  right={mixColor("#F4EDE0", C.orangeLight, lit)}
                />
                <g transform={`translate(${x} ${y + 6}) scale(${isC ? 1 : pop(frame, tOrg - 0.2 + random(`mn${k}`) * 0.8)})`}>
                  <Mini x={0} y={0} s={1.5} body={isC ? C.orange : k % 2 ? C.teal600 : C.orange} />
                </g>
              </g>
            );
          })}

        {/* progress bar under the project cube */}
        <g opacity={pop(frame, tFinish - 0.3) * (1 - zoomOut)}>
          <rect x={cx - 170} y={cy + 330} width={340} height={30} rx={15} fill={C.teal900} opacity={0.15} />
          <rect x={cx - 170} y={cy + 330} width={340 * progress} height={30} rx={15} fill={C.teal600} />
          <g transform={`translate(${cx + 210} ${cy + 345}) scale(${pop(frame, tFinish + 0.95)})`}>
            <circle r={30} fill={C.teal600} />
            <path d="M-13 1 L-4 10 L14 -9" stroke={C.cream} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </Stage>

      <Role at={tManager - 0.1} out={tLeader - 0.25} label="MANAGER" />
      <Role at={tLeader - 0.05} label="LEADER" accent />
      <Bubble x={540} y={720} p={pop(frame, wt('"How', 0) - 0.1) * (1 - ramp(frame, tLeader - 0.3, 0.3))} size={48}>
        How can we finish this project?
      </Bubble>
      <Caption at={wt('"How', 1)} top={400} size={52} card={C.cream} width={940}>
        How can this project improve <span style={{ color: C.orange }}>our entire organization?</span>
      </Caption>
    </AbsoluteFill>
  );
};

const Role: React.FC<{ at: number; out?: number; label: string; accent?: boolean }> = ({ at, out, label, accent }) => {
  const frame = useCurrentFrame();
  const p = pop(frame, at);
  const o = out !== undefined ? ramp(frame, out, 0.3) : 0;
  if (p <= 0 || o >= 1) return null;
  return (
    <div style={{ position: "absolute", top: 260, width: W, display: "flex", justifyContent: "center", opacity: 1 - o }}>
      <div
        style={{
          transform: `scale(${p})`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 54,
          letterSpacing: 8,
          color: accent ? C.cream : C.ink,
          background: accent ? C.orange : "transparent",
          border: accent ? "none" : `4px solid ${C.ink}`,
          borderRadius: 999,
          padding: "12px 40px",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// =====================================================================================
// Scene 6 — How to practise: Vision → Skills → Action → Growth (staircase, ref 3)
// =====================================================================================
const STEPS = [
  { x0: 110, x1: 300, top: 1450, label: "VISION" },
  { x0: 300, x1: 490, top: 1285, label: "SKILLS" },
  { x0: 490, x1: 680, top: 1120, label: "ACTION" },
  { x0: 680, x1: 990, top: 955, label: "GROWTH" },
];
const GROUND = 1640;

const StepIcon: React.FC<{ k: number; x: number; y: number; s: number }> = ({ k, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {k === 0 && (
      <g>
        <path d="M-34 0 Q0 -30 34 0 Q0 30 -34 0 Z" fill={C.cream} />
        <circle r={13} fill={C.teal800} />
        <circle cx={4} cy={-4} r={4} fill={C.cream} />
      </g>
    )}
    {k === 1 && (
      <path
        d="M-26 -26 H-6 A9 9 0 1 1 6 -26 H26 V-6 A9 9 0 1 1 26 6 V26 H-26 Z"
        fill={C.cream}
      />
    )}
    {k === 2 && (
      <g fill={C.cream}>
        <rect x={-30} y={8} width={18} height={18} rx={3} />
        <rect x={-10} y={-8} width={18} height={34} rx={3} />
        <rect x={10} y={-24} width={18} height={50} rx={3} />
      </g>
    )}
    {k === 3 && (
      <g>
        <path d="M0 28 V-6" stroke={C.cream} strokeWidth={7} strokeLinecap="round" />
        <ellipse cx={-14} cy={-10} rx={16} ry={8} fill={C.cream} transform="rotate(-30 -14 -10)" />
        <ellipse cx={14} cy={-20} rx={17} ry={8} fill={C.cream} transform="rotate(25 14 -20)" />
      </g>
    )}
  </g>
);

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const tSo = wt("So", 0);
  const hops = [wt("Start") - 0.05, wt("Identify") - 0.05, wt("Break") - 0.05, wt("And", 1) - 0.05];
  const labelsAt = [wt("bigger"), wt("skills"), wt("actions."), wt("surround")];
  const tMissing = wt("missing.");
  const tSmaller = wt("smaller");
  const tPeople = wt("people", 1);
  const tChallenge = wt("challenge");

  // hero position: ground → step tops
  const spots = [
    { x: 40, y: GROUND },
    ...STEPS.map((s, i) => ({ x: i === 3 ? 760 : (s.x0 + s.x1) / 2, y: s.top })),
  ];
  let hx = spots[0].x;
  let hy = spots[0].y;
  let stride = 0;
  const heroIn = ramp(frame, tSo - 0.4, 0.8);
  hx = lerp(-120, spots[0].x, heroIn);
  stride = Math.sin(frame / 3) * (1 - heroIn) * 0.8;
  hops.forEach((t, i) => {
    const p = ramp(frame, t, 0.55, Easing.inOut(Easing.quad));
    if (p > 0) {
      const a = spots[i];
      const b = spots[i + 1];
      hx = lerp(a.x, b.x, p);
      hy = lerp(a.y, b.y, p) - Math.sin(p * Math.PI) * 90;
      stride = Math.sin(p * Math.PI) * 0.9;
    }
  });

  const build = (i: number) => ramp(frame, tSo - 0.3 + i * 0.18, 0.5, Easing.out(Easing.back(1.2)));
  const flagIn = pop(frame, tSo + 0.6);
  const flagBig = 1 + ramp(frame, wt("bigger"), 0.6, Easing.out(Easing.back(2))) * 0.6;
  const zoom = 1 + ramp(frame, labelsAt[3], 4) * 0.06;

  return (
    <AbsoluteFill>
      <Stage zoom={zoom} fx={700} fy={1000} bg={C.paper}>
        <rect x={-200} y={-200} width={W + 400} height={2400} fill={C.paper} />
        <circle cx={420} cy={1000} r={lerp(0, 330, ramp(frame, tSo - 0.6, 1.0))} fill={mixColor(C.amberLight, "#E3D78C", 0.5)} />
        <Constellation seed="s6" reveal={ramp(frame, tSo, 2)} pts={[[760, 300], [850, 380], [960, 330], [900, 470]]} links={[[0, 1], [1, 2], [1, 3]]} color={C.sage} />
        <rect x={-200} y={GROUND} width={W + 400} height={500} fill={C.sage} />
        <rect x={-200} y={GROUND} width={W + 400} height={500} fill="url(#grid)" />

        {/* staircase */}
        {STEPS.map((s, i) => {
          const b = build(i);
          const top = lerp(GROUND, s.top, b);
          return (
            <g key={i}>
              <rect x={s.x0 - 14} y={top - 14} width={s.x1 - s.x0 + 14} height={GROUND - top + 14} fill={C.teal500} />
              <rect x={s.x0} y={top} width={(i === 3 ? 990 : 990) - s.x0} height={GROUND - top} fill={C.teal700} />
              <rect x={s.x0} y={top} width={990 - s.x0} height={GROUND - top} fill="url(#hatch)" opacity={0.5} />
            </g>
          );
        })}
        {/* step labels + icons on the risers */}
        {STEPS.map((s, i) => {
          const p = pop(frame, labelsAt[i] - 0.15);
          const mx = (s.x0 + Math.min(s.x1, 900)) / 2 + (i === 3 ? 60 : 0);
          return (
            <g key={`l${i}`} opacity={Math.min(1, p)}>
              <StepIcon k={i} x={mx} y={s.top + 70} s={p} />
              <text x={mx} y={s.top + 150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} letterSpacing={3} fill={C.cream}>
                {s.label}
              </text>
            </g>
          );
        })}
        {/* the missing puzzle piece slides in */}
        <g opacity={ramp(frame, tMissing - 0.6, 0.3)} transform={`translate(${lerp(-260, 0, ramp(frame, tMissing - 0.3, 0.6, Easing.out(Easing.back(1.4))))} 0)`}>
          <g transform="translate(462 1352) rotate(-8)">
            <path d="M-26 -26 H-6 A9 9 0 1 1 6 -26 H26 V-6 A9 9 0 1 1 26 6 V26 H-26 Z" fill={C.amber} />
          </g>
        </g>
        {/* break it into smaller actions: little amber stairs */}
        {[0, 1, 2, 3].map((k) => (
          <rect
            key={k}
            x={500 + k * 42}
            y={1120 - 14 - k * 16}
            width={40}
            height={14 + k * 16}
            rx={4}
            fill={C.amber}
            opacity={pop(frame, tSmaller + k * 0.1)}
          />
        ))}
        {/* flag on top */}
        <g transform={`translate(930 955) scale(${flagIn * flagBig})`}>
          <Flag x={0} y={0} h={180} color={C.orange} />
        </g>
        {/* people who challenge you */}
        {[
          { x: 830, y: 955, c: C.teal600 },
          { x: 560, y: 1120, c: C.orange },
          { x: 400, y: 1285, c: C.sage },
        ].map((m, k) => {
          const p = pop(frame, tPeople - 0.1 + k * 0.15);
          return (
            <g key={k} transform={`translate(${m.x} ${m.y}) scale(${p})`}>
              <Mini x={0} y={0} s={1.25} body={m.c} />
              <g transform={`translate(26 -150) scale(${pop(frame, tChallenge + k * 0.18)})`}>
                <rect x={-26} y={-26} width={52} height={46} rx={14} fill={C.cream} />
                <path d="M-6 18 L0 30 L8 18 Z" fill={C.cream} />
                <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.orange}>
                  {k === 1 ? "!" : "?"}
                </text>
              </g>
            </g>
          );
        })}
        <PersonSide x={hx} y={hy} s={0.5} look={HERO} stride={stride} lean={-stride * 4} />
        <Sprig x={60} y={1960} h={360} color={C.teal700} seed={1.4} />
      </Stage>

      <Caption at={tSo} out={labelsAt[0] - 0.3} top={250} size={60}>
        How to practise
        <br />
        big thinking
      </Caption>
      <StepsRow at={labelsAt} />
    </AbsoluteFill>
  );
};

const StepsRow: React.FC<{ at: number[] }> = ({ at }) => {
  const frame = useCurrentFrame();
  const words = ["Vision", "Skills", "Action", "Growth"];
  return (
    <div style={{ position: "absolute", top: 270, width: W, display: "flex", justifyContent: "center", gap: 10, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: C.ink }}>
      {words.map((w, i) => {
        const p = ramp(frame, at[i] - 0.15, 0.4);
        const active = i === at.filter((t) => frame / FPS >= t - 0.15).length - 1;
        return (
          <React.Fragment key={w}>
            {i > 0 && <span style={{ opacity: p, color: C.amber }}>→</span>}
            <span style={{ opacity: p, transform: `translateY(${(1 - p) * 20}px)`, color: active ? C.orange : C.ink }}>{w}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// =====================================================================================
// Scene 7 — Conclusion: pull back to the whole journey and the summit (refs 4/5)
// =====================================================================================
const TRAIL = "M560 1940 C 400 1780, 700 1640, 560 1500 C 440 1380, 660 1300, 560 1190 C 500 1120, 600 1060, 560 980 L 520 860 L 590 760 L 560 640";

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const tStart = wt("Thinking", 1);
  const tBut = wt("But");
  const tDisc = wt("discovering");
  const tDest = wt("So", 1);
  const tStay = wt("stay");

  const pull = ramp(frame, tDest - 0.1, 2.4, Easing.inOut(Easing.cubic));
  const zoom = lerp(2.0, 1.0, pull);
  const fy = lerp(1570, 1100, pull);
  const sunRise = ramp(frame, tDest, 3.0, Easing.out(Easing.cubic));
  const box = ramp(frame, tBut, 1.2, Easing.inOut(Easing.cubic));
  const burst = ramp(frame, tDisc + 0.1, 0.7, Easing.in(Easing.quad));
  const ticks = ramp(frame, tStay, 2.6, Easing.inOut(Easing.quad));
  const walkPhase = (frame / FPS) * 6.5;
  const walking = 1 - ramp(frame, tDest + 1.5, 0.8);
  const heroY = lerp(1640, 1560, ramp(frame, tStart - 0.7, 8, Easing.linear));

  // closing frame (small thinking) — in screen space
  const bw = lerp(1080, 420, box) + burst * 1600;
  const bh = lerp(1920, 560, box) + burst * 2400;
  const bxc = 540;
  const byc = 1300;

  const tickCount = 22;

  return (
    <AbsoluteFill>
      <Stage zoom={zoom} fx={560} fy={fy} bg="#F9DE9B">
        <defs>
          <linearGradient id="sky7" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F7D58A" />
            <stop offset="1" stopColor="#FBEBC6" />
          </linearGradient>
        </defs>
        <rect x={-600} y={-600} width={W + 1200} height={3200} fill="url(#sky7)" />
        <Constellation seed="s7" reveal={ramp(frame, tDest, 2)} pts={[[110, 230], [210, 300], [330, 250], [800, 200], [900, 280], [990, 220]]} links={[[0, 1], [1, 2], [3, 4], [4, 5]]} color={C.teal600} />
        <Sun x={lerp(560, 560, sunRise)} y={lerp(1000, 820, sunRise)} r={lerp(230, 270, sunRise)} fill={C.sun} glow={0.6} />
        {/* back range */}
        <path d="M-300 1100 L60 820 L220 900 L380 760 L520 880 L760 740 L960 860 L1380 1100 Z" fill="#7FA6B3" />
        {/* main summit */}
        <path d="M-80 1250 L300 900 L560 600 L820 900 L1160 1250 Z" fill={C.teal600} />
        <path d="M560 600 L1160 1250 L700 1250 L640 900 Z" fill={C.teal800} opacity={0.6} />
        <path d="M560 600 L640 700 L600 690 L580 730 L540 700 L500 720 L480 690 Z" fill={C.cream} />
        <path d="M300 900 L340 950 L310 945 L290 970 L270 940 Z" fill={C.cream} opacity={0.85} />
        {/* mid ridges */}
        <path d="M-300 1400 L120 1120 L360 1260 L560 1160 L780 1280 L1000 1120 L1380 1400 L1380 1800 L-300 1800 Z" fill={C.teal700} />
        <path d="M-300 1400 L120 1120 L360 1260 L560 1160 L780 1280 L1000 1120 L1380 1400 L1380 1800 L-300 1800 Z" fill="url(#hatch)" />
        <Hill base={1500} amp={50} seed={1.1} fill={C.teal500} texture="grid" />
        <Hill base={1700} amp={40} seed={2.9} fill={C.teal800} texture="grid" />

        {/* the journey so far: tiny landmarks from earlier scenes */}
        <g opacity={pull}>
          <IsoCube x={220} y={1300} a={26} h={28} />
          <IsoCube x={262} y={1324} a={26} h={34} />
          <IsoCube x={178} y={1324} a={26} h={22} top={C.cream} left="#E7DDCB" right="#F4EDE0" />
          <g>
            <rect x={790} y={1260} width={30} height={40} fill={C.teal900} />
            <rect x={820} y={1236} width={30} height={64} fill={C.teal900} />
            <rect x={850} y={1212} width={30} height={88} fill={C.teal900} />
            <Flag x={866} y={1212} h={50} />
          </g>
          {[0, 1, 2, 3, 4].map((k) => (
            <path key={k} d="M0 -12 L9 5 L-8 8 Z" transform={`translate(${330 + k * 30} ${1640 + (k % 2) * 16}) rotate(${k * 47})`} fill="#EAF4F1" opacity={0.8} />
          ))}
        </g>

        {/* the trail */}
        <path d={TRAIL} stroke={C.amber} strokeWidth={70} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
        <path d={TRAIL} stroke="url(#gridAmber)" strokeWidth={70} fill="none" />
        <path d={TRAIL} stroke={C.amberLight} strokeWidth={6} fill="none" strokeDasharray="0.012 0.026" pathLength={1} opacity={0.9} />
        {/* disciplined execution: step ticks light up along the trail */}
        <path
          d={TRAIL}
          pathLength={1}
          stroke={C.orange}
          strokeWidth={22}
          fill="none"
          strokeLinecap="butt"
          strokeDasharray={Array.from({ length: tickCount })
            .map((_, k) => (k / tickCount < ticks ? "0.012 0.033" : "0 0.045"))
            .join(" ")}
          strokeDashoffset={-0.005}
        />
        <Sprig x={90} y={1980} h={300} color={C.teal900} seed={0.4} />
        <Sprig x={1000} y={1980} h={360} color={C.teal900} flip seed={1.9} />
        <PersonBack x={575} y={heroY} s={0.62} look={HERO} walk={walkPhase} walking={walking} lookUp={pull * 0.9} />
      </Stage>

      {/* small-thinking frame closing in, then bursting open */}
      {box > 0 && burst < 1 && (
        <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
          <mask id="boxmask">
            <rect width={W} height={1920} fill="white" />
            <rect x={bxc - bw / 2} y={byc - bh / 2} width={bw} height={bh} rx={36} fill="black" />
          </mask>
          <rect width={W} height={1920} fill={C.teal900} opacity={0.6 * (1 - burst)} mask="url(#boxmask)" />
          <rect x={bxc - bw / 2} y={byc - bh / 2} width={bw} height={bh} rx={36} fill="none" stroke={C.cream} strokeWidth={6} strokeDasharray="22 16" opacity={1 - burst} />
        </svg>
      )}
      <Caption at={tBut + 0.2} out={tDisc} top={330} size={58} color={C.cream}>
        Thinking too small
        <br />
        keeps us in the box.
      </Caption>
      <Caption at={tDest + 0.6} top={250} size={62}>
        Think big about
        <br />
        your <span style={{ color: C.sunDeep }}>destination.</span>
      </Caption>
      <Caption at={tStay} top={420} size={43} weight={700} color={C.teal800} width={1040}>
        Stay disciplined about your execution.
      </Caption>
      <Credit at={tStay + 2.6} />
    </AbsoluteFill>
  );
};

const Credit: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, at, 0.8);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 500, width: W, textAlign: "center", opacity: p, fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: C.teal800 }}>
      THE MAGIC OF THINKING BIG · DAVID J. SCHWARTZ
    </div>
  );
};

export { Hill, PersonBack, Sun };
