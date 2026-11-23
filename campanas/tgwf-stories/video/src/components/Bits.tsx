import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, PERSON, mono, text } from "../brand";

// Grano de papel, como el --grain de la app
export const Grain: React.FC<{ opacity?: number; id?: string }> = ({ opacity = 0.06, id = "g" }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", opacity }}>
    <svg width="100%" height="100%">
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  </AbsoluteFill>
);

// Etiqueta en mono, como las de la app ("TOUR · ACTIVO")
export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.ink2,
  size = 30,
  style,
}) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: size,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Avatar: React.FC<{ who: keyof typeof PERSON; size?: number; ring?: string; style?: React.CSSProperties }> = ({
  who,
  size = 64,
  ring,
  style,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      background: PERSON[who].color,
      color: "#fff",
      fontFamily: text,
      fontWeight: 600,
      fontSize: size * 0.36,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: ring ? `0 0 0 ${size * 0.07}px ${ring}` : undefined,
      flex: "none",
      ...style,
    }}
  >
    {who === "AP" ? "ÁP" : who}
  </div>
);

// Móvil con una captura real del modo demo de la app (390×844 a 3x)
export const Phone: React.FC<{ src: string; width: number; style?: React.CSSProperties }> = ({ src, width, style }) => {
  const height = (width * 844) / 390;
  const bezel = width * 0.028;
  return (
    <div
      style={{
        position: "absolute",
        width: width + bezel * 2,
        height: height + bezel * 2,
        borderRadius: width * 0.14,
        background: C.ink,
        padding: bezel,
        boxShadow: "0 50px 90px -40px rgba(21, 19, 15, 0.55)",
        ...style,
      }}
    >
      <div style={{ width, height, borderRadius: width * 0.115, overflow: "hidden", background: C.bg }}>
        <Img src={staticFile(src)} style={{ width, height, display: "block" }} />
      </div>
    </div>
  );
};
