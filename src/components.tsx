import React from "react";
import {
  AbsoluteFill,
  Easing,
  Freeze,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FPS, Region } from "./timeline";

export const SRC = staticFile("source.mp4");
export const YELLOW = "#FFD60A";
export const FONT = "Montserrat, sans-serif";
export const DISPLAY = "'Bebas Neue', Montserrat, sans-serif";

/** Shows `region` of the 1280x720 source scaled to fill a boxW x boxH box. */
export const VideoCrop: React.FC<{
  src: number; // source start (seconds)
  region: Region;
  boxW: number;
  boxH: number;
  zoom?: number;
  filter?: string;
  freeze?: boolean;
}> = ({ src, region, boxW, boxH, zoom = 1, filter, freeze }) => {
  const s = Math.max(boxW / region.w, boxH / region.h);
  const offX = (boxW - region.w * s) / 2;
  const offY = (boxH - region.h * s) / 2;
  const cx = (region.x + region.w / 2) * s;
  const cy = (region.y + region.h / 2) * s;
  const video = (
    <OffthreadVideo
      src={SRC}
      muted
      trimBefore={Math.round(src * FPS)}
      style={{
        position: "absolute",
        width: 1280 * s,
        height: 720 * s,
        left: -region.x * s + offX,
        top: -region.y * s + offY,
        transform: `scale(${zoom})`,
        transformOrigin: `${cx}px ${cy}px`,
        filter,
        maxWidth: "none",
      }}
    />
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {freeze ? <Freeze frame={0}>{video}</Freeze> : video}
    </div>
  );
};

/** Pop-in helper: spring 0→1 starting at local frame `at`. */
export const usePop = (at: number, damping = 12, stiffness = 180) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, stiffness, mass: 0.6 } });
};

export const Pill: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 22px",
      borderRadius: 999,
      background: "rgba(10,10,14,0.72)",
      border: "2px solid rgba(255,255,255,0.18)",
      backdropFilter: "blur(10px)",
      color: "white",
      fontFamily: FONT,
      fontWeight: 800,
      fontSize: 30,
      letterSpacing: 1.5,
      boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const RecDot: React.FC = () => {
  const frame = useCurrentFrame();
  const on = Math.floor(frame / 10) % 2 === 0;
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        background: "#FF3B30",
        opacity: on ? 1 : 0.25,
        boxShadow: "0 0 12px #FF3B30",
      }}
    />
  );
};

export const Flash: React.FC<{ at: number; len?: number; max?: number }> = ({ at, len = 5, max = 0.7 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 1, at + len], [0, max, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: "white", opacity: o, pointerEvents: "none" }} />;
};

export const ShieldIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z" fill={YELLOW} />
    <path d="M8 12.2l2.7 2.7L16.2 9.4" stroke="#111" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CartIcon: React.FC<{ size: number; color?: string }> = ({ size, color = "#111" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 001.5 1.2h8.6a1.5 1.5 0 001.5-1.1L21 8H6.3" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9.5" cy="20" r="1.6" fill={color} />
    <circle cx="17.5" cy="20" r="1.6" fill={color} />
  </svg>
);
