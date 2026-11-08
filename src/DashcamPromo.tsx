import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  CAPTION_CHUNKS,
  FPS,
  H,
  MUSIC,
  PANEL,
  SFX,
  SHOTS,
  SPEECH,
  Shot,
  TRI,
  VOICE_SEGMENTS,
  W,
  f,
} from "./timeline";
import {
  CartIcon,
  DISPLAY,
  FONT,
  Flash,
  Pill,
  RecDot,
  SRC,
  ShieldIcon,
  VideoCrop,
  YELLOW,
  usePop,
} from "./components";

// ---------------- Fonts ----------------
const fontHandle = delayRender("fonts");
Promise.all(
  [
    ["Montserrat", "fonts/montserrat-latin-700-normal.woff2", "700"],
    ["Montserrat", "fonts/montserrat-latin-800-normal.woff2", "800"],
    ["Montserrat", "fonts/montserrat-latin-900-normal.woff2", "900"],
    ["Bebas Neue", "fonts/bebas-neue-latin-400-normal.woff2", "400"],
  ].map(async ([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, { weight });
    await face.load();
    document.fonts.add(face);
  }),
).then(() => continueRender(fontHandle));

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PRICE_SLAM = f(7.12); // 214

// ---------------- Shots ----------------
const Background: React.FC<{ shot: Shot }> = ({ shot }) => {
  const region = shot.kind === "tri" ? TRI[0].region : shot.region;
  return (
    <VideoCrop
      src={shot.src}
      region={region}
      boxW={W}
      boxH={H}
      zoom={1.25}
      freeze={shot.kind === "cta"}
      filter="blur(38px) brightness(0.32) saturate(1.5)"
    />
  );
};

const panelFrame: React.CSSProperties = {
  position: "absolute",
  left: PANEL.x,
  top: PANEL.y,
  width: PANEL.w,
  height: PANEL.h,
  borderRadius: PANEL.r,
  overflow: "hidden",
  boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.08)",
  background: "#000",
};

const useShake = (globalFrame: number) => {
  const t = globalFrame - PRICE_SLAM;
  if (t < 0 || t > 10) return "";
  const amp = 14 * Math.exp(-t / 3.5);
  return `translate(${Math.sin(t * 2.7) * amp}px, ${Math.cos(t * 3.3) * amp}px)`;
};

const CropShot: React.FC<{ shot: Extract<Shot, { kind: "crop" }> }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const len = shot.to - shot.from;
  const zoom = interpolate(frame, [0, len], shot.zoom, { ...clamp, easing: Easing.inOut(Easing.quad) });
  const enter = interpolate(frame, [0, 6], [1.12, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const blur = interpolate(frame, [0, 5], [10, 0], clamp);
  return (
    <div style={{ ...panelFrame, transform: useShake(shot.from + frame) }}>
      <VideoCrop
        src={shot.src}
        region={shot.region}
        boxW={PANEL.w}
        boxH={PANEL.h}
        zoom={zoom * (shot.from === 0 ? 1 : enter)}
        filter={blur > 0.2 && shot.from !== 0 ? `blur(${blur}px)` : undefined}
      />
      <Vignette />
    </div>
  );
};

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

const TriShot: React.FC<{ shot: Extract<Shot, { kind: "tri" }> }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardH = 400;
  const gap = 25;
  return (
    <>
      {TRI.map((cam, i) => {
        const p = spring({ frame: frame - i * 3, fps, config: { damping: 16, stiffness: 170, mass: 0.7 } });
        const x = interpolate(p, [0, 1], [i % 2 === 0 ? 1100 : -1100, 0]);
        const label = usePop(5 + i * 6, 10, 220);
        return (
          <div
            key={cam.label}
            style={{
              ...panelFrame,
              top: PANEL.y + i * (cardH + gap),
              height: cardH,
              borderRadius: 32,
              transform: `translateX(${x}px)`,
            }}
          >
            <VideoCrop src={shot.src} region={cam.region} boxW={PANEL.w} boxH={cardH} />
            <div
              style={{
                position: "absolute",
                left: 22,
                top: 20,
                transform: `scale(${label})`,
                transformOrigin: "left center",
              }}
            >
              <Pill style={{ fontSize: 26, padding: "10px 18px" }}>
                <RecDot />
                <span style={{ color: YELLOW }}>{i + 1}</span>
                {cam.label}
              </Pill>
            </div>
          </div>
        );
      })}
    </>
  );
};

const NightShot: React.FC<{ shot: Extract<Shot, { kind: "night" }> }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 30], [1.04, 1.12], clamp);
  const scan = interpolate(frame, [6, 20], [0, 100], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const glitch = frame < 4;
  const jitter = glitch ? (frame % 2 === 0 ? 18 : -14) : 0;
  const hud = usePop(8, 14, 200);
  return (
    <div style={{ ...panelFrame, transform: `translateX(${jitter}px)` }}>
      <VideoCrop
        src={shot.src}
        region={shot.region}
        boxW={PANEL.w}
        boxH={PANEL.h}
        zoom={zoom}
        filter={`brightness(0.55) saturate(0.7)${glitch ? " hue-rotate(90deg)" : ""}`}
      />
      {/* "enhanced" layer revealed by the scan line */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${100 - scan}% 0)` }}>
        <VideoCrop
          src={shot.src}
          region={shot.region}
          boxW={PANEL.w}
          boxH={PANEL.h}
          zoom={zoom}
          filter="brightness(1.45) contrast(1.15) saturate(1.3)"
        />
      </div>
      {scan > 0 && scan < 100 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scan}%`,
            height: 6,
            background: "#7CF7FF",
            boxShadow: "0 0 30px 10px rgba(124,247,255,0.6)",
          }}
        />
      )}
      <Vignette />
      {/* HUD corners (kept to the edges — no face in this shot) */}
      {[
        { left: 36, top: 36, b: "borderLeft borderTop" },
        { right: 36, top: 36, b: "borderRight borderTop" },
        { left: 36, bottom: 36, b: "borderLeft borderBottom" },
        { right: 36, bottom: 36, b: "borderRight borderBottom" },
      ].map((c, i) => {
        const { b, ...pos } = c;
        const style: React.CSSProperties = { position: "absolute", width: 90, height: 90, opacity: hud, ...pos };
        b.split(" ").forEach((k) => ((style as Record<string, string>)[k] = "6px solid rgba(255,255,255,0.85)"));
        return <div key={i} style={style} />;
      })}
    </div>
  );
};

const CtaShot: React.FC<{ shot: Extract<Shot, { kind: "cta" }> }> = ({ shot }) => {
  const frame = useCurrentFrame();
  const blur = interpolate(frame, [0, 8], [0, 14], clamp);
  const dim = interpolate(frame, [0, 8], [1, 0.45], clamp);
  return (
    <div style={panelFrame}>
      <VideoCrop
        src={shot.src}
        region={shot.region}
        boxW={PANEL.w}
        boxH={PANEL.h}
        zoom={1.12}
        freeze
        filter={`blur(${blur}px) brightness(${dim})`}
      />
    </div>
  );
};

const ShotLayer: React.FC<{ shot: Shot }> = ({ shot }) => (
  <AbsoluteFill>
    <Background shot={shot} />
    {shot.kind === "crop" && <CropShot shot={shot} />}
    {shot.kind === "tri" && <TriShot shot={shot} />}
    {shot.kind === "night" && <NightShot shot={shot} />}
    {shot.kind === "cta" && <CtaShot shot={shot} />}
  </AbsoluteFill>
);

// ---------------- Overlays ----------------
// All overlay text lives inside the TikTok/IG safe area: x 90–940, y 250–1450.
const SAFE_CX = 515;

const Centered: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  top,
  children,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: SAFE_CX - 420,
      width: 840,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

const bigTextShadow = "0 6px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.6)";

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.03 * Math.sin(frame / 4);
  const out = interpolate(frame, [38, 46], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <Centered top={360} style={{ opacity: 1 - out, transform: `translateY(${-out * 80}px)` }}>
      <Pill style={{ fontSize: 30 }}>
        <RecDot /> DASHCAM 3 KAMERA • 4K
      </Pill>
      <div
        style={{
          marginTop: 10,
          fontFamily: DISPLAY,
          fontSize: 190,
          lineHeight: 0.95,
          color: YELLOW,
          textShadow: bigTextShadow,
          transform: `scale(${pulse}) rotate(-3deg)`,
        }}
      >
        RM107 JE?!
      </div>
    </Centered>
  );
};

const Badge4K: React.FC = () => {
  const p = usePop(0, 9, 200);
  return (
    <Centered top={360} style={{ transform: `scale(${0.4 + 0.6 * p})`, opacity: Math.min(1, p * 2) }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 300,
          lineHeight: 0.85,
          color: "white",
          textShadow: bigTextShadow,
          letterSpacing: 6,
        }}
      >
        4K
      </div>
      <Pill style={{ background: YELLOW, color: "#111", border: "none", fontSize: 30 }}>ULTRA HD RECORDING</Pill>
    </Centered>
  );
};

const NightLabel: React.FC = () => {
  const p = usePop(6, 12, 200);
  return (
    <Centered top={380} style={{ transform: `scale(${p})` }}>
      <Pill style={{ fontSize: 40, padding: "16px 30px", border: "2px solid #7CF7FF", color: "#7CF7FF" }}>
        <RecDot /> NIGHT VISION: ON
      </Pill>
    </Centered>
  );
};

const Warranty: React.FC = () => {
  const frame = useCurrentFrame();
  const p = usePop(0, 10, 200);
  const shine = interpolate(frame, [4, 18], [-120, 220], clamp);
  return (
    <Centered top={370} style={{ transform: `scale(${p})` }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "22px 40px 22px 26px",
          borderRadius: 36,
          background: "rgba(12,12,16,0.82)",
          border: `3px solid ${YELLOW}`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
      >
        <ShieldIcon size={120} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 120, lineHeight: 0.9, color: YELLOW }}>5 TAHUN</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: "white", letterSpacing: 6 }}>
            WARRANTY
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${shine}%`,
            width: 80,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
            transform: "skewX(-20deg)",
          }}
        />
      </div>
    </Centered>
  );
};

const Price: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const label = usePop(2, 12, 200);
  const slamAt = PRICE_SLAM - 194;
  const slam = spring({ frame: frame - slamAt, fps, config: { damping: 9, stiffness: 260, mass: 0.8 } });
  const scale = interpolate(slam, [0, 1], [1.9, 1]);
  const shine = interpolate(frame, [slamAt + 6, slamAt + 22], [-30, 130], clamp);
  const ring = interpolate(frame, [slamAt, slamAt + 14], [0, 1], clamp);
  return (
    <Centered top={360}>
      <div style={{ transform: `scale(${label})` }}>
        <Pill style={{ fontSize: 36, padding: "14px 28px" }}>HARGA CUMA</Pill>
      </div>
      {frame >= slamAt && (
        <div style={{ position: "relative", marginTop: 6 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 700,
              height: 700,
              marginLeft: -350,
              marginTop: -350,
              borderRadius: "50%",
              border: `10px solid ${YELLOW}`,
              transform: `scale(${0.3 + ring * 1.1})`,
              opacity: 1 - ring,
            }}
          />
          <div
            style={{
              position: "relative",
              fontFamily: DISPLAY,
              fontSize: 280,
              lineHeight: 0.9,
              color: YELLOW,
              textShadow: bigTextShadow,
              transform: `scale(${scale}) rotate(-4deg)`,
              opacity: Math.min(1, slam * 3),
              WebkitMaskImage: `linear-gradient(100deg, #000 ${shine - 12}%, rgba(0,0,0,0.55) ${shine}%, #000 ${shine + 12}%)`,
            }}
          >
            RM107
          </div>
        </div>
      )}
    </Centered>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const title = usePop(2, 12, 180);
  const btn = usePop(10, 10, 200);
  const pulse = 1 + 0.04 * Math.sin((frame - 10) / 3);
  const bounce = Math.abs(Math.sin(frame / 5)) * 18;
  return (
    <Centered top={620}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: 130,
          lineHeight: 0.95,
          color: "white",
          textAlign: "center",
          textShadow: bigTextShadow,
          transform: `scale(${title})`,
        }}
      >
        DAPATKAN
        <br />
        <span style={{ color: YELLOW }}>SEKARANG</span>
      </div>
      <div
        style={{
          marginTop: 40,
          transform: `scale(${btn * (frame > 22 ? pulse : 1)})`,
          display: "flex",
          alignItems: "center",
          gap: 18,
          padding: "26px 46px",
          borderRadius: 999,
          background: YELLOW,
          color: "#111",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 44,
          boxShadow: "0 18px 50px rgba(255,214,10,0.35)",
        }}
      >
        <CartIcon size={52} /> TEKAN BEG KUNING
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 32,
          color: "rgba(255,255,255,0.85)",
          opacity: btn,
        }}
      >
        atau link di bio
      </div>
      <svg width={70} height={70} viewBox="0 0 24 24" style={{ marginTop: 18 + bounce, opacity: btn }}>
        <path d="M12 4v14M5 12l7 7 7-7" stroke="white" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Centered>
  );
};

// ---------------- Captions ----------------
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunk = CAPTION_CHUNKS.find((c) => t >= c.words[0].s && t < c.words[c.words.length - 1].e);
  if (!chunk || chunk.hide) return null;
  const start = f(chunk.words[0].s);
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE_CX - 400,
        width: 800,
        top: 1250,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 28px",
      }}
    >
      {chunk.words.map((w) => {
        const active = t >= w.s && t < w.e;
        const p = spring({
          frame: frame - start,
          fps: FPS,
          config: { damping: 12, stiffness: 220, mass: 0.5 },
        });
        return (
          <span
            key={w.t + w.s}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 82,
              lineHeight: 1.1,
              color: active || w.key ? YELLOW : "white",
              WebkitTextStroke: "3px rgba(0,0,0,0.9)",
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,0.7)",
              transform: `scale(${0.7 + 0.3 * p}) translateY(${(1 - p) * 30 + (active ? -6 : 0)}px)`,
              display: "inline-block",
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};

// ---------------- Safe-zone guide (preview only) ----------------
export const SafeZoneGuide: React.FC = () => {
  const zone: React.CSSProperties = { position: "absolute", background: "rgba(255,0,60,0.22)" };
  const label: React.CSSProperties = {
    position: "absolute",
    color: "#ff5c7a",
    fontFamily: FONT,
    fontWeight: 800,
    fontSize: 24,
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ ...zone, left: 0, right: 0, top: 0, height: 250 }} />
      <div style={{ ...zone, left: 0, right: 0, bottom: 0, height: 470 }} />
      <div style={{ ...zone, right: 0, top: 250, width: 140, height: 1200 }} />
      <div style={{ ...zone, left: 0, top: 250, width: 60, height: 1200 }} />
      <div style={{ ...label, left: 30, top: 200 }}>TOP UI (TikTok/IG)</div>
      <div style={{ ...label, left: 30, top: 1460 }}>CAPTION / USERNAME / BEG KUNING</div>
      <div style={{ ...label, right: 10, top: 260, width: 120, textAlign: "right" }}>BUTTONS</div>
    </AbsoluteFill>
  );
};

// ---------------- Audio ----------------
// Mix: voice leads; music bed sits ~15 dB under speech, SFX are accents. Headroom kept below 0 dBFS.
const VOICE_GAIN = 0.72;
const SFX_GAIN = 0.55;
const musicVolume = (frame: number) => {
  const t = frame / FPS;
  const ducked = 0.04;
  const open = 0.16;
  let dist = Infinity;
  for (const [s, e] of SPEECH) {
    if (t >= s && t <= e) {
      dist = 0;
      break;
    }
    dist = Math.min(dist, Math.abs(t - s), Math.abs(t - e));
  }
  const v = ducked + (open - ducked) * Math.min(1, dist / 0.15);
  const fadeOut = interpolate(frame, [282, 297], [1, 0], clamp);
  return v * fadeOut;
};

const SoundTrack: React.FC = () => (
  <>
    {VOICE_SEGMENTS.map((seg) => {
      const len = seg.srcTo - seg.srcFrom;
      const vol = VOICE_GAIN * (seg.volume ?? 1);
      return (
        <Sequence key={seg.at} from={seg.at} durationInFrames={len}>
          <Audio
            src={SRC}
            trimBefore={seg.srcFrom}
            trimAfter={seg.srcTo}
            volume={(fr) => vol * interpolate(fr, [0, 1, len - 1, len], [0, 1, 1, 0], clamp)}
          />
        </Sequence>
      );
    })}
    <Audio src={staticFile(MUSIC.file)} trimBefore={Math.round(MUSIC.startAt * FPS)} volume={musicVolume} />
    {SFX.map((s, i) => (
      <Sequence key={i} from={f(s.t)}>
        <Audio
          src={staticFile(`sfx/${s.file}.mp3`)}
          trimBefore={s.trim ? Math.round(s.trim * FPS) : undefined}
          volume={s.vol * SFX_GAIN}
        />
      </Sequence>
    ))}
  </>
);

// ---------------- Composition ----------------
export const DashcamPromo: React.FC<{ showSafeZone: boolean }> = ({ showSafeZone }) => (
  <AbsoluteFill style={{ background: "#07070a" }}>
    {SHOTS.map((shot) => (
      <Sequence key={shot.id} from={shot.from} durationInFrames={shot.to - shot.from}>
        <ShotLayer shot={shot} />
      </Sequence>
    ))}

    <Sequence from={0} durationInFrames={46}>
      <Hook />
    </Sequence>
    <Sequence from={f(3.17)} durationInFrames={114 - f(3.17)}>
      <Badge4K />
    </Sequence>
    <Sequence from={114} durationInFrames={30}>
      <NightLabel />
    </Sequence>
    <Sequence from={f(5.42)} durationInFrames={194 - f(5.42)}>
      <Warranty />
    </Sequence>
    <Sequence from={194} durationInFrames={53}>
      <Price />
    </Sequence>
    <Sequence from={247} durationInFrames={50}>
      <Cta />
    </Sequence>

    <Captions />

    <Flash at={46} max={0.5} />
    <Flash at={PRICE_SLAM} len={6} max={0.6} />
    <Flash at={247} max={0.35} />

    <SoundTrack />
    {showSafeZone && <SafeZoneGuide />}
  </AbsoluteFill>
);
